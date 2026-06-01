package com.kaoyanbuddy.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SubjectRequest(
        @NotBlank(message = "科目名称不能为空")
        @Size(max = 60, message = "科目名称不能超过 60 个字符")
        String name,

        @NotBlank(message = "分类不能为空")
        @Size(max = 40, message = "分类不能超过 40 个字符")
        String category,

        @NotBlank(message = "颜色不能为空")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "颜色必须是十六进制格式")
        String color,

        @Min(value = 1, message = "目标时长至少 1 小时")
        @Max(value = 2000, message = "目标时长不能超过 2000 小时")
        Integer targetHours
) {
}
