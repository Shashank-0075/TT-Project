package com.campusfix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Body of PUT /api/users/me - a user editing their own profile. */
public record ProfileUpdateRequest(

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
        String fullName,

        @Pattern(regexp = "^$|^[0-9+\\-\\s]{7,20}$", message = "Enter a valid phone number")
        String phone,

        @Size(max = 100, message = "Department is too long")
        String department) {
}
