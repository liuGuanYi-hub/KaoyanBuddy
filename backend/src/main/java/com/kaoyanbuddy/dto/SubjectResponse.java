package com.kaoyanbuddy.dto;

import com.kaoyanbuddy.domain.Subject;
import java.time.LocalDateTime;

public record SubjectResponse(
        Long id,
        String name,
        String category,
        String color,
        Integer targetHours,
        LocalDateTime createdAt
) {

    public static SubjectResponse from(Subject subject) {
        return new SubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getCategory(),
                subject.getColor(),
                subject.getTargetHours(),
                subject.getCreatedAt()
        );
    }
}
