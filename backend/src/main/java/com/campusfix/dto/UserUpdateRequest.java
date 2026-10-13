package com.campusfix.dto;

import com.campusfix.entity.RoleName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Body used by the admin to edit a user (PUT /api/admin/users/{id}). */
public record UserUpdateRequest(

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
        String fullName,

        @Pattern(regexp = "^$|^[0-9+\\-\\s]{7,20}$", message = "Enter a valid phone number")
        String phone,

        @Size(max = 100, message = "Department is too long")
        String department,

        @NotNull(message = "Role is required")
        RoleName role,

        @NotNull(message = "Active flag is required")
        Boolean active) {
}
