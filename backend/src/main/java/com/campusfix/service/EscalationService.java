package com.campusfix.service;

import com.campusfix.dto.EscalationConfigRequest;
import com.campusfix.dto.EscalationConfigResponse;
import com.campusfix.entity.Complaint;
import com.campusfix.entity.ComplaintStatus;
import com.campusfix.entity.EscalationConfig;
import com.campusfix.entity.EscalationLog;
import com.campusfix.entity.Priority;
import com.campusfix.exception.ResourceNotFoundException;
import com.campusfix.repository.ComplaintRepository;
import com.campusfix.repository.EscalationConfigRepository;
import com.campusfix.repository.EscalationLogRepository;
import com.campusfix.repository.UserRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AUTOMATIC PRIORITY ESCALATION  (core feature)
 *
 * Rule:  for every complaint that is NOT resolved
 *          LOW    -> MEDIUM   when it has had LOW    priority for  "lowToMediumDays"  days
 *          MEDIUM -> HIGH     when it has had MEDIUM priority for  "mediumToHighDays" days
 *        HIGH is the maximum, resolved complaints are never touched.
 *
 * "Has had this priority for N days" is measured from complaint.priorityUpdatedAt:
 *   - at the start it equals the creation time
 *   - when a complaint is escalated, priorityUpdatedAt moves to the moment the threshold was crossed
 * So the same level is never escalated twice, and the second step needs
 * its own additional waiting time. Example with thresholds 3 and 3 days:
 *
 *      01 Jan  complaint created, LOW
 *      04 Jan  LOW  -> MEDIUM   (3 days after 01 Jan)
 *      07 Jan  MEDIUM -> HIGH   (3 more days after 04 Jan)
 *
 * If the server was switched off for a while, one run will catch up and apply every
 * level that was due, each one with its correct date.
 *
 * The thresholds are stored in the table "escalation_config" and can be changed by the admin.
 */
@Service
public class EscalationService {

    private static final Logger log = LoggerFactory.getLogger(EscalationService.class);

    private final EscalationConfigRepository configRepository;
    private final EscalationLogRepository logRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final int defaultLowToMediumDays;
    private final int defaultMediumToHighDays;

    public EscalationService(EscalationConfigRepository configRepository,
                             EscalationLogRepository logRepository,
                             ComplaintRepository complaintRepository,
                             UserRepository userRepository,
                             @Value("${campusfix.escalation.default-low-to-medium-days:3}") int defaultLowToMediumDays,
                             @Value("${campusfix.escalation.default-medium-to-high-days:3}") int defaultMediumToHighDays) {
        this.configRepository = configRepository;
        this.logRepository = logRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.defaultLowToMediumDays = defaultLowToMediumDays;
        this.defaultMediumToHighDays = defaultMediumToHighDays;
    }

    // ------------------------------------------------------------------
    // Configuration
    // ------------------------------------------------------------------

    /** Returns the configuration row; creates it with the default values the first time. */
    @Transactional
    public EscalationConfig getOrCreateConfig() {
        return configRepository.findFirstByOrderByIdAsc().orElseGet(() -> {
            EscalationConfig config = new EscalationConfig();
            config.setLowToMediumDays(defaultLowToMediumDays);
            config.setMediumToHighDays(defaultMediumToHighDays);
            config.setEnabled(true);
            return configRepository.save(config);
        });
    }

    @Transactional
    public EscalationConfigResponse getConfig() {
        return EscalationConfigResponse.from(getOrCreateConfig());
    }

    @Transactional
    public EscalationConfigResponse updateConfig(EscalationConfigRequest request, Long adminId) {
        EscalationConfig config = getOrCreateConfig();
        config.setLowToMediumDays(request.lowToMediumDays());
        config.setMediumToHighDays(request.mediumToHighDays());
        config.setEnabled(request.enabled());
        config.setUpdatedBy(userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId)));
        return EscalationConfigResponse.from(configRepository.save(config));
    }

    // ------------------------------------------------------------------
    // The escalation job
    // ------------------------------------------------------------------

    /** Runs the check now. Called by the scheduler and by the admin's "Run check now" button. */
    @Transactional
    public int runEscalation() {
        return runEscalation(LocalDateTime.now());
    }

    /**
     * Same as above but with an explicit "current time" (makes the logic easy to test).
     *
     * @return the number of priority increases that were applied
     */
    @Transactional
    public int runEscalation(LocalDateTime now) {
        EscalationConfig config = getOrCreateConfig();
        if (!config.isEnabled()) {
            log.info("Escalation is disabled - nothing to do");
            return 0;
        }

        // Only unresolved complaints that are not already HIGH can be escalated.
        List<Complaint> candidates = complaintRepository
                .findByStatusNotAndPriorityNot(ComplaintStatus.RESOLVED, Priority.HIGH);

        int escalations = 0;
        for (Complaint complaint : candidates) {
            escalations += escalateComplaint(complaint, config, now);
        }
        if (escalations > 0) {
            log.info("Escalation job finished: {} priority increase(s) applied", escalations);
        }
        return escalations;
    }

    /** Escalates one complaint as many levels as are due. Returns how many levels were applied. */
    private int escalateComplaint(Complaint complaint, EscalationConfig config, LocalDateTime now) {
        int levels = 0;

        // Safety: resolved complaints must never be escalated.
        while (complaint.getStatus().isUnresolved()) {
            Priority current = complaint.getPriority();
            Priority next = current.next();
            if (next == null) {
                break; // already HIGH
            }

            int thresholdDays = current == Priority.LOW
                    ? config.getLowToMediumDays()
                    : config.getMediumToHighDays();

            LocalDateTime dueAt = complaint.getPriorityUpdatedAt().plusDays(thresholdDays);
            if (dueAt.isAfter(now)) {
                break; // not yet due
            }

            long ageInDays = Duration.between(complaint.getCreatedAt(), dueAt).toDays();
            String reason = String.format(
                    "Unresolved for %d day(s) since submission. %s priority exceeded the limit of %d day(s), "
                            + "so the priority was raised automatically from %s to %s.",
                    ageInDays, current, thresholdDays, current, next);

            complaint.setPriority(next);
            complaint.setPriorityUpdatedAt(dueAt);
            complaint.setEscalationCount(complaint.getEscalationCount() + 1);
            complaint.setLastEscalatedAt(dueAt);
            complaint.setEscalationReason(reason);

            EscalationLog entry = new EscalationLog();
            entry.setComplaint(complaint);
            entry.setFromPriority(current);
            entry.setToPriority(next);
            entry.setReason(reason);
            entry.setEscalatedAt(dueAt);
            logRepository.save(entry);

            levels++;
        }

        if (levels > 0) {
            complaintRepository.save(complaint);
        }
        return levels;
    }
}
