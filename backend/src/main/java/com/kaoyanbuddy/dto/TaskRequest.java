package com.kaoyanbuddy.dto;

import com.kaoyanbuddy.domain.TaskPriority;
import com.kaoyanbuddy.domain.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record TaskRequest(
        @NotNull(message = "科目不能为空")
        Long subjectId,

        @NotBlank(message = "任务标题不能为空")
        @Size(max = 120, message = "任务标题不能超过 120 个字符")
        String title,

        @Size(max = 500, message = "任务说明不能超过 500 个字符")
        String description,

        @NotNull(message = "任务日期不能为空")
        LocalDate taskDate,

        TaskStatus status,

        TaskPriority priority,

        @NotNull(message = "计划时长不能为空")
        @Min(value = 5, message = "计划时长至少 5 分钟")
        @Max(value = 960, message = "计划时长不能超过 960 分钟")
        Integer plannedMinutes,

        @Min(value = 0, message = "实际时长不能小于 0")
        @Max(value = 960, message = "实际时长不能超过 960 分钟")
        Integer actualMinutes
) {
}
