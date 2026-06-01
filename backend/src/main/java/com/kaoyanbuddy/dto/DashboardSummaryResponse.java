package com.kaoyanbuddy.dto;

import java.time.LocalDate;
import java.util.List;

public record DashboardSummaryResponse(
        long totalTasks,
        long completedTasks,
        double completionRate,
        int plannedMinutes,
        int actualMinutes,
        List<SubjectProgress> subjects,
        List<DailyProgress> days
) {

    public record SubjectProgress(
            Long subjectId,
            String subjectName,
            String color,
            long totalTasks,
            long completedTasks,
            int plannedMinutes,
            int actualMinutes
    ) {
    }

    public record DailyProgress(
            LocalDate date,
            long totalTasks,
            long completedTasks,
            int actualMinutes
    ) {
    }
}
