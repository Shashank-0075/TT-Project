package com.campusfix.dto;

import com.campusfix.entity.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Body used by the admin to create any kind of user (POST /api/admin/users). */
public record UserCreateRequest(

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 150, message = "Email is too long")
        String email,

        @NotBlank(message = "Password is required")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,64}$",
                message = "Password must be 8-64 characters and contain at least one letter and one number")
        String password,

        @Pattern(regexp = "^$|^[0-9+\\-\\s]{7,20}$", message = "Enter a valid phone number")
        String phone,

        @Size(max = 100, message = "Department is too long")
        String department,

        @NotNull(message = "Role is required")
        RoleName role) {
}
