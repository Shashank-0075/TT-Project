package com.campusfix.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Body of PUT /api/admin/escalation-config. */
public record EscalationConfigRequest(

        @NotNull(message = "LOW to MEDIUM days is required")
        @Min(value = 1, message = "Must be at least 1 day")
        @Max(value = 365, message = "Must be at most 365 days")
        Integer lowToMediumDays,

        @NotNull(message = "MEDIUM to HIGH days is required")
        @Min(value = 1, message = "Must be at least 1 day")
        @Max(value = 365, message = "Must be at most 365 days")
        Integer mediumToHighDays,

        @NotNull(message = "Enabled flag is required")
        Boolean enabled) {
}
