package com.campusfix.exception;

/** Thrown for invalid input that passed basic validation but breaks a business rule. HTTP 400. */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
