package com.campusfix.exception;

/** Thrown when a status change breaks the lifecycle PENDING -> IN_PROGRESS -> RESOLVED. HTTP 400. */
public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
