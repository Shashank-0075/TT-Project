package com.campusfix.dto;

import com.campusfix.entity.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Body of PUT /api/maintenance/complaints/{id}/status (used to start work: PENDING -> IN_PROGRESS). */
public record StatusUpdateRequest(

        @NotNull(message = "Status is required")
        ComplaintStatus status,

        @Size(max = 1000, message = "Remarks must be at most 1000 characters")
        String remarks) {
}
