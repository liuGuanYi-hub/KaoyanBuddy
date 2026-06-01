package com.kaoyanbuddy.dto;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
