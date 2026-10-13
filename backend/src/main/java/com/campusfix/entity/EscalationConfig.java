package com.campusfix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Table: escalation_config - holds the configurable escalation thresholds.
 * The table normally contains a single row.
 */
@Entity
@Table(name = "escalation_config")
public class EscalationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** LOW complaints become MEDIUM after this many days without a priority change. */
    @Column(name = "low_to_medium_days", nullable = false)
    private int lowToMediumDays;

    /** MEDIUM complaints become HIGH after this many additional days. */
    @Column(name = "medium_to_high_days", nullable = false)
    private int mediumToHighDays;

    /** Master switch: when false, no complaint is escalated. */
    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public int getLowToMediumDays() {
        return lowToMediumDays;
    }

    public void setLowToMediumDays(int lowToMediumDays) {
        this.lowToMediumDays = lowToMediumDays;
    }

    public int getMediumToHighDays() {
        return mediumToHighDays;
    }

    public void setMediumToHighDays(int mediumToHighDays) {
        this.mediumToHighDays = mediumToHighDays;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }
}
