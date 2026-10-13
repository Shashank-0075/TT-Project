package com.campusfix.dto;

import com.campusfix.entity.User;
import java.time.LocalDateTime;

/** User data sent to the frontend. The password hash is deliberately NOT included. */
public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String department,
        String role,
        boolean active,
        LocalDateTime createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getDepartment(),
                user.getRole().getName().name(),
                user.isActive(),
                user.getCreatedAt());
    }
}
