package com.kaoyanbuddy.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String message,
        Map<String, String> fields
) {

    public static ApiErrorResponse of(int status, String message) {
        return new ApiErrorResponse(LocalDateTime.now(), status, message, Map.of());
    }

    public static ApiErrorResponse of(int status, String message, Map<String, String> fields) {
        return new ApiErrorResponse(LocalDateTime.now(), status, message, fields);
    }
}
