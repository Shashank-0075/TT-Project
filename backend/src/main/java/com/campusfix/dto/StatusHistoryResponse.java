package com.campusfix.dto;

import com.campusfix.entity.ComplaintStatus;
import com.campusfix.entity.ComplaintStatusHistory;
import java.time.LocalDateTime;

/** One entry of the status timeline. */
public record StatusHistoryResponse(
        Long id,
        Long complaintId,
        String complaintTitle,
        ComplaintStatus oldStatus,
        ComplaintStatus newStatus,
        String changedByName,
        String changedByRole,
        String remarks,
        LocalDateTime changedAt) {

    public static StatusHistoryResponse from(ComplaintStatusHistory h) {
        return new StatusHistoryResponse(
                h.getId(),
                h.getComplaint().getId(),
                h.getComplaint().getTitle(),
                h.getOldStatus(),
                h.getNewStatus(),
                h.getChangedBy() != null ? h.getChangedBy().getFullName() : "System",
                h.getChangedBy() != null ? h.getChangedBy().getRole().getName().name() : "SYSTEM",
                h.getRemarks(),
                h.getChangedAt());
    }
}
