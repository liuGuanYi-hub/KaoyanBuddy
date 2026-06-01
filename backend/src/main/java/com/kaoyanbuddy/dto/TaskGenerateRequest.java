package com.kaoyanbuddy.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record TaskGenerateRequest(
        @NotNull(message = "日期不能为空")
        LocalDate date,

        @Min(value = 60, message = "每日计划至少 60 分钟")
        @Max(value = 960, message = "每日计划不能超过 960 分钟")
        Integer totalMinutes
) {
}
