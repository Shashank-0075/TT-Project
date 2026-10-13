package com.campusfix.dto;

import com.campusfix.entity.Complaint;
import com.campusfix.entity.ComplaintStatus;
import com.campusfix.entity.Priority;
import java.time.LocalDateTime;
import java.util.List;

/** Everything shown on the complaint details page. */
public record ComplaintDetailResponse(
        Long id,
        String title,
        String description,
        MasterDataResponse category,
        MasterDataResponse location,
        Priority priority,
        ComplaintStatus status,
        SubmittedBy submittedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt,
        /** Relative image path; the frontend loads it from GET /api/files/{imagePath}. */
        String imagePath,
        boolean escalated,
        int escalationCount,
        LocalDateTime lastEscalatedAt,
        String escalationReason,
        LocalDateTime priorityUpdatedAt,
        ResolutionResponse resolution,
        List<StatusHistoryResponse> statusHistory,
        List<EscalationLogResponse> escalationLogs) {

    /** Small summary of the user who submitted the complaint. */
    public record SubmittedBy(Long id, String fullName, String email, String department) {
    }

    public static ComplaintDetailResponse from(Complaint c,
                                               ResolutionResponse resolution,
                                               List<StatusHistoryResponse> history,
                                               List<EscalationLogResponse> escalationLogs) {
        return new ComplaintDetailResponse(
                c.getId(),
                c.getTitle(),
                c.getDescription(),
                MasterDataResponse.from(c.getCategory()),
                MasterDataResponse.from(c.getLocation()),
                c.getPriority(),
                c.getStatus(),
                new SubmittedBy(c.getSubmittedBy().getId(), c.getSubmittedBy().getFullName(),
                        c.getSubmittedBy().getEmail(), c.getSubmittedBy().getDepartment()),
                c.getCreatedAt(),
                c.getUpdatedAt(),
                c.getResolvedAt(),
                c.getImagePath(),
                c.isEscalated(),
                c.getEscalationCount(),
                c.getLastEscalatedAt(),
                c.getEscalationReason(),
                c.getPriorityUpdatedAt(),
                resolution,
                history,
                escalationLogs);
    }
}
