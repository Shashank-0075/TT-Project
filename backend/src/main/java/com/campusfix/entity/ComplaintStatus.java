package com.campusfix.entity;

/**
 * Complaint lifecycle:  PENDING  ->  IN_PROGRESS  ->  RESOLVED
 *
 * A complaint can only move forward one step at a time.
 * RESOLVED is the final state.
 */
public enum ComplaintStatus {
    PENDING,
    IN_PROGRESS,
    RESOLVED;

    /** Returns true if moving from this status to the target status is allowed. */
    public boolean canMoveTo(ComplaintStatus target) {
        switch (this) {
            case PENDING:
                return target == IN_PROGRESS;
            case IN_PROGRESS:
                return target == RESOLVED;
            default:
                return false; // RESOLVED is final
        }
    }

    /** Unresolved complaints are the ones that can still be escalated. */
    public boolean isUnresolved() {
        return this != RESOLVED;
    }
}
