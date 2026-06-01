package com.kaoyanbuddy.dto;

import com.kaoyanbuddy.domain.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record TaskStatusRequest(
        @NotNull(message = "状态不能为空")
        TaskStatus status,

        @Min(value = 0, message = "实际时长不能小于 0")
        @Max(value = 960, message = "实际时长不能超过 960 分钟")
        Integer actualMinutes
) {
}
