package com.campusfix.exception;

/** Thrown when the request conflicts with existing data (e.g. duplicate email). HTTP 409. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
