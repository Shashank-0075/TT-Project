package com.campusfix.dto;

import com.campusfix.entity.Resolution;
import java.time.LocalDateTime;

/** Maintenance resolution details (also used by the Resolution History page). */
public record ResolutionResponse(
        Long id,
        Long complaintId,
        String complaintTitle,
        String categoryName,
        String locationName,
        String remarks,
        String proofImagePath,
        String resolvedByName,
        LocalDateTime resolvedAt) {

    public static ResolutionResponse from(Resolution r) {
        return new ResolutionResponse(
                r.getId(),
                r.getComplaint().getId(),
                r.getComplaint().getTitle(),
                r.getComplaint().getCategory().getName(),
                r.getComplaint().getLocation().getName(),
                r.getRemarks(),
                r.getProofImagePath(),
                r.getResolvedBy().getFullName(),
                r.getResolvedAt());
    }
}
