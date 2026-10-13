package com.campusfix.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Runs the escalation check automatically in the background.
 * Interval and first delay come from application.properties
 * (campusfix.escalation.check-interval-ms / initial-delay-ms).
 */
@Component
public class EscalationScheduler {

    private static final Logger log = LoggerFactory.getLogger(EscalationScheduler.class);

    private final EscalationService escalationService;

    public EscalationScheduler(EscalationService escalationService) {
        this.escalationService = escalationService;
    }

    @Scheduled(initialDelayString = "${campusfix.escalation.initial-delay-ms}",
            fixedDelayString = "${campusfix.escalation.check-interval-ms}")
    public void checkForEscalation() {
        try {
            int count = escalationService.runEscalation();
            log.debug("Scheduled escalation check completed, {} escalation(s)", count);
        } catch (Exception ex) {
            // An error must not stop future runs of the scheduler
            log.error("Scheduled escalation check failed", ex);
        }
    }
}
