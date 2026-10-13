package com.campusfix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Used for both categories and locations (they have the same fields). */
public record MasterDataRequest(

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
        String name,

        @Size(max = 255, message = "Description must be at most 255 characters")
        String description,

        /** Optional. null means "active". */
        Boolean active) {
}
