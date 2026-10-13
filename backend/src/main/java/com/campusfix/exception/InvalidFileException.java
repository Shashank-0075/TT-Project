package com.campusfix.exception;

/** Thrown when an uploaded file is empty, too large, or not a real image. HTTP 400. */
public class InvalidFileException extends RuntimeException {

    public InvalidFileException(String message) {
        super(message);
    }
}
