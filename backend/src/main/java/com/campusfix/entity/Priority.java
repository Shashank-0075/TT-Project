package com.campusfix.entity;

/** Complaint priority. Escalation moves a complaint LOW -> MEDIUM -> HIGH. */
public enum Priority {
    LOW,
    MEDIUM,
    HIGH;

    /** The next higher priority, or null if this is already the highest (HIGH). */
    public Priority next() {
        switch (this) {
            case LOW:
                return MEDIUM;
            case MEDIUM:
                return HIGH;
            default:
                return null;
        }
    }
}
