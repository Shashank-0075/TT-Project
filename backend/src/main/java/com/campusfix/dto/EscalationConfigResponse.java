package com.campusfix.dto;

import com.campusfix.entity.EscalationConfig;
import java.time.LocalDateTime;

public record EscalationConfigResponse(
        int lowToMediumDays,
        int mediumToHighDays,
        boolean enabled,
        LocalDateTime updatedAt,
        String updatedByName) {

    public static EscalationConfigResponse from(EscalationConfig c) {
        return new EscalationConfigResponse(
                c.getLowToMediumDays(),
                c.getMediumToHighDays(),
                c.isEnabled(),
                c.getUpdatedAt(),
                c.getUpdatedBy() != null ? c.getUpdatedBy().getFullName() : null);
    }
}
