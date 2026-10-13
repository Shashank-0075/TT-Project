package com.campusfix.dto;

import com.campusfix.entity.Complaint;
import com.campusfix.entity.ComplaintStatus;
import com.campusfix.entity.Priority;
import java.time.LocalDateTime;

/** One row of a complaint list (tables). Contains no heavy data. */
public record ComplaintSummaryResponse(
        Long id,
        String title,
        Long categoryId,
        String categoryName,
        Long locationId,
        String locationName,
        Priority priority,
        ComplaintStatus status,
        Long submittedById,
        String submittedByName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt,
        boolean hasImage,
        boolean escalated,
        int escalationCount,
        LocalDateTime lastEscalatedAt) {

    public static ComplaintSummaryResponse from(Complaint c) {
        return new ComplaintSummaryResponse(
                c.getId(),
                c.getTitle(),
                c.getCategory().getId(),
                c.getCategory().getName(),
                c.getLocation().getId(),
                c.getLocation().getName(),
                c.getPriority(),
                c.getStatus(),
                c.getSubmittedBy().getId(),
                c.getSubmittedBy().getFullName(),
                c.getCreatedAt(),
                c.getUpdatedAt(),
                c.getResolvedAt(),
                c.getImagePath() != null,
                c.isEscalated(),
                c.getEscalationCount(),
                c.getLastEscalatedAt());
    }
}
