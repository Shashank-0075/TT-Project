package com.campusfix.dto;

/** Returned after a successful login or registration. */
public record AuthResponse(String token, String tokenType, long expiresInMs, UserResponse user) {
}
