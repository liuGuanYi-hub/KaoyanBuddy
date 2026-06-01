package com.kaoyanbuddy.dto;

public record AiChatResponse(
        String answer,
        boolean fallback
) {
}
