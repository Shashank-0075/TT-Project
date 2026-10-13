package com.campusfix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body of POST /api/maintenance/complaints/{id}/progress - a progress note. */
public record ProgressNoteRequest(

        @NotBlank(message = "Remarks are required")
        @Size(max = 1000, message = "Remarks must be at most 1000 characters")
        String remarks) {
}
