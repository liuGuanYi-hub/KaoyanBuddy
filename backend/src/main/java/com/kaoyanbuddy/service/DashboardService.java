package com.kaoyanbuddy.service;

import com.kaoyanbuddy.domain.StudyTask;
import com.kaoyanbuddy.domain.TaskStatus;
import com.kaoyanbuddy.domain.UserAccount;
import com.kaoyanbuddy.dto.DashboardSummaryResponse;
import com.kaoyanbuddy.exception.BadRequestException;
import com.kaoyanbuddy.repository.StudyTaskRepository;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final StudyTaskRepository taskRepository;

    public DashboardService(StudyTaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public DashboardSummaryResponse summary(UserAccount user, LocalDate start, LocalDate end) {
        LocalDate resolvedEnd = end == null ? LocalDate.now() : end;
        LocalDate resolvedStart = start == null ? resolvedEnd.minusDays(6) : start;
        if (resolvedStart.isAfter(resolvedEnd)) {
            throw new BadRequestException("开始日期不能晚于结束日期");
        }

        List<StudyTask> tasks = taskRepository.findByUserAndTaskDateBetweenOrderByTaskDateAscCreatedAtAsc(
                user,
                resolvedStart,
                resolvedEnd
        );

        long total = tasks.size();
        long completed = tasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count();
        int plannedMinutes = tasks.stream().mapToInt(StudyTask::getPlannedMinutes).sum();
        int actualMinutes = tasks.stream().mapToInt(StudyTask::getActualMinutes).sum();
        double completionRate = total == 0 ? 0 : Math.round((completed * 10000.0 / total)) / 100.0;

        Map<Long, List<StudyTask>> bySubject = tasks.stream()
                .collect(Collectors.groupingBy(task -> task.getSubject().getId(), LinkedHashMap::new, Collectors.toList()));

        List<DashboardSummaryResponse.SubjectProgress> subjectProgress = bySubject.values()
                .stream()
                .map(subjectTasks -> {
                    StudyTask first = subjectTasks.get(0);
                    long subjectCompleted = subjectTasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count();
                    return new DashboardSummaryResponse.SubjectProgress(
                            first.getSubject().getId(),
                            first.getSubject().getName(),
                            first.getSubject().getColor(),
                            subjectTasks.size(),
                            subjectCompleted,
                            subjectTasks.stream().mapToInt(StudyTask::getPlannedMinutes).sum(),
                            subjectTasks.stream().mapToInt(StudyTask::getActualMinutes).sum()
                    );
                })
                .sorted(Comparator.comparing(DashboardSummaryResponse.SubjectProgress::subjectName))
                .toList();

        Map<LocalDate, List<StudyTask>> byDay = tasks.stream()
                .collect(Collectors.groupingBy(StudyTask::getTaskDate, LinkedHashMap::new, Collectors.toList()));

        List<DashboardSummaryResponse.DailyProgress> dailyProgress = resolvedStart.datesUntil(resolvedEnd.plusDays(1))
                .map(date -> {
                    List<StudyTask> dayTasks = byDay.getOrDefault(date, List.of());
                    long dayCompleted = dayTasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count();
                    return new DashboardSummaryResponse.DailyProgress(
                            date,
                            dayTasks.size(),
                            dayCompleted,
                            dayTasks.stream().mapToInt(StudyTask::getActualMinutes).sum()
                    );
                })
                .toList();

        return new DashboardSummaryResponse(
                total,
                completed,
                completionRate,
                plannedMinutes,
                actualMinutes,
                subjectProgress,
                dailyProgress
        );
    }
}
