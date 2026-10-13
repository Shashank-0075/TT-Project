package com.campusfix.dto;

import com.campusfix.entity.EscalationLog;
import com.campusfix.entity.Priority;
import java.time.LocalDateTime;

/** One automatic priority escalation: when, from what, to what and why. */
public record EscalationLogResponse(
        Long id,
        Priority fromPriority,
        Priority toPriority,
        String reason,
        LocalDateTime escalatedAt) {

    public static EscalationLogResponse from(EscalationLog log) {
        return new EscalationLogResponse(log.getId(), log.getFromPriority(), log.getToPriority(),
                log.getReason(), log.getEscalatedAt());
    }
}
