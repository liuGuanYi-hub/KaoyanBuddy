package com.kaoyanbuddy.dto;

import com.kaoyanbuddy.domain.StudyTask;
import com.kaoyanbuddy.domain.TaskPriority;
import com.kaoyanbuddy.domain.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        SubjectResponse subject,
        String title,
        String description,
        LocalDate taskDate,
        TaskStatus status,
        TaskPriority priority,
        Integer plannedMinutes,
        Integer actualMinutes,
        LocalDateTime completedAt,
        LocalDateTime createdAt
) {

    public static TaskResponse from(StudyTask task) {
        return new TaskResponse(
                task.getId(),
                SubjectResponse.from(task.getSubject()),
                task.getTitle(),
                task.getDescription(),
                task.getTaskDate(),
                task.getStatus(),
                task.getPriority(),
                task.getPlannedMinutes(),
                task.getActualMinutes(),
                task.getCompletedAt(),
                task.getCreatedAt()
        );
    }
}
