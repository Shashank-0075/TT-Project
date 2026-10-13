package com.campusfix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Table: escalation_logs - one row for every automatic priority increase. */
@Entity
@Table(name = "escalation_logs")
public class EscalationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "from_priority", nullable = false, length = 10)
    private Priority fromPriority;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "to_priority", nullable = false, length = 10)
    private Priority toPriority;

    /** Human readable explanation shown in the UI ("why was it escalated"). */
    @Column(nullable = false, length = 500)
    private String reason;

    @Column(name = "escalated_at", nullable = false)
    private LocalDateTime escalatedAt;

    public Long getId() {
        return id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public Priority getFromPriority() {
        return fromPriority;
    }

    public void setFromPriority(Priority fromPriority) {
        this.fromPriority = fromPriority;
    }

    public Priority getToPriority() {
        return toPriority;
    }

    public void setToPriority(Priority toPriority) {
        this.toPriority = toPriority;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getEscalatedAt() {
        return escalatedAt;
    }

    public void setEscalatedAt(LocalDateTime escalatedAt) {
        this.escalatedAt = escalatedAt;
    }
}
