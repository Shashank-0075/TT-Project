package com.campusfix.service;

import com.campusfix.dto.ComplaintDetailResponse;
import com.campusfix.dto.PageResponse;
import com.campusfix.dto.ProgressNoteRequest;
import com.campusfix.dto.ResolutionResponse;
import com.campusfix.dto.ResolveForm;
import com.campusfix.dto.StatusUpdateRequest;
import com.campusfix.entity.Complaint;
import com.campusfix.entity.ComplaintStatus;
import com.campusfix.entity.Resolution;
import com.campusfix.entity.User;
import com.campusfix.exception.BadRequestException;
import com.campusfix.exception.InvalidStatusTransitionException;
import com.campusfix.exception.ResourceNotFoundException;
import com.campusfix.repository.ComplaintRepository;
import com.campusfix.repository.ResolutionRepository;
import com.campusfix.repository.UserRepository;
import com.campusfix.security.UserPrincipal;
import java.time.LocalDateTime;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Work done by maintenance staff (and admin when necessary):
 *   PENDING --start work--> IN_PROGRESS --resolve--> RESOLVED
 */
@Service
@Transactional
public class MaintenanceService {

    private final ComplaintService complaintService;
    private final ComplaintRepository complaintRepository;
    private final ResolutionRepository resolutionRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public MaintenanceService(ComplaintService complaintService,
                              ComplaintRepository complaintRepository,
                              ResolutionRepository resolutionRepository,
                              UserRepository userRepository,
                              FileStorageService fileStorageService) {
        this.complaintService = complaintService;
        this.complaintRepository = complaintRepository;
        this.resolutionRepository = resolutionRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    /** Changes the status. Only PENDING -> IN_PROGRESS is done here; resolving needs remarks (see resolve). */
    public ComplaintDetailResponse updateStatus(Long complaintId, StatusUpdateRequest request, UserPrincipal principal) {
        Complaint complaint = complaintService.findComplaint(complaintId);
        User actor = loadUser(principal);
        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.status();

        if (newStatus == ComplaintStatus.RESOLVED) {
            throw new BadRequestException(
                    "To resolve a complaint use the resolve action, because resolution remarks are required");
        }
        if (!oldStatus.canMoveTo(newStatus)) {
            throw new InvalidStatusTransitionException(
                    "Invalid status change: " + oldStatus + " -> " + newStatus
                            + ". Allowed flow is PENDING -> IN_PROGRESS -> RESOLVED");
        }

        complaint.setStatus(newStatus);
        complaintRepository.save(complaint);

        String remarks = request.remarks() == null || request.remarks().isBlank()
                ? "Work started" : request.remarks().trim();
        complaintService.addHistory(complaint, oldStatus, newStatus, actor, remarks);
        return complaintService.buildDetails(complaint);
    }

    /** A progress note while work is going on. The status stays IN_PROGRESS. */
    public ComplaintDetailResponse addProgressNote(Long complaintId, ProgressNoteRequest request,
                                                   UserPrincipal principal) {
        Complaint complaint = complaintService.findComplaint(complaintId);
        if (complaint.getStatus() != ComplaintStatus.IN_PROGRESS) {
            throw new BadRequestException("Progress notes can only be added while the complaint is IN_PROGRESS");
        }
        complaintService.addHistory(complaint, ComplaintStatus.IN_PROGRESS, ComplaintStatus.IN_PROGRESS,
                loadUser(principal), request.remarks().trim());
        return complaintService.buildDetails(complaint);
    }

    /** Completes the work: saves the resolution (+ optional proof image) and sets the status to RESOLVED. */
    public ComplaintDetailResponse resolve(Long complaintId, ResolveForm form, UserPrincipal principal) {
        Complaint complaint = complaintService.findComplaint(complaintId);
        User actor = loadUser(principal);
        ComplaintStatus oldStatus = complaint.getStatus();

        if (!oldStatus.canMoveTo(ComplaintStatus.RESOLVED)) {
            throw new InvalidStatusTransitionException(
                    "Only complaints that are IN_PROGRESS can be resolved (current status: " + oldStatus + ")");
        }

        String proofPath = null;
        if (form.getProofImage() != null && !form.getProofImage().isEmpty()) {
            proofPath = fileStorageService.storeImage(form.getProofImage(), FileStorageService.RESOLUTION_FOLDER);
        }

        try {
            LocalDateTime now = LocalDateTime.now();

            Resolution resolution = new Resolution();
            resolution.setComplaint(complaint);
            resolution.setRemarks(form.getRemarks().trim());
            resolution.setProofImagePath(proofPath);
            resolution.setResolvedBy(actor);
            resolution.setResolvedAt(now);
            resolutionRepository.save(resolution);

            complaint.setStatus(ComplaintStatus.RESOLVED);
            complaint.setResolvedAt(now);
            complaintRepository.save(complaint);

            complaintService.addHistory(complaint, oldStatus, ComplaintStatus.RESOLVED, actor,
                    "Resolved: " + form.getRemarks().trim());
            return complaintService.buildDetails(complaint);
        } catch (RuntimeException ex) {
            fileStorageService.deleteQuietly(proofPath);
            throw ex;
        }
    }

    /** "Resolution history": completed maintenance work, newest first. */
    @Transactional(readOnly = true)
    public PageResponse<ResolutionResponse> resolutionHistory(String keyword, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "resolvedAt"));
        String safeKeyword = keyword == null ? "" : keyword.trim();
        return PageResponse.from(resolutionRepository.search(safeKeyword, pageable).map(ResolutionResponse::from));
    }

    private User loadUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", principal.getId()));
    }
}
