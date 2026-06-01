package com.kaoyanbuddy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiChatRequest(
        @NotBlank(message = "问题不能为空")
        @Size(max = 2000, message = "问题不能超过 2000 个字符")
        String message
) {
}
