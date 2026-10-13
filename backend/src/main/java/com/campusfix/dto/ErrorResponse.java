package com.campusfix.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;

/** The JSON body returned for every error (see GlobalExceptionHandler). */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        /** Only present for validation errors: field name -> message. */
        Map<String, String> fieldErrors) {
}
