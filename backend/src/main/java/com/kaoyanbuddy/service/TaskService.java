package com.kaoyanbuddy.service;

import com.kaoyanbuddy.domain.StudyTask;
import com.kaoyanbuddy.domain.Subject;
import com.kaoyanbuddy.domain.TaskPriority;
import com.kaoyanbuddy.domain.TaskStatus;
import com.kaoyanbuddy.domain.UserAccount;
import com.kaoyanbuddy.dto.TaskGenerateRequest;
import com.kaoyanbuddy.dto.TaskRequest;
import com.kaoyanbuddy.dto.TaskResponse;
import com.kaoyanbuddy.dto.TaskStatusRequest;
import com.kaoyanbuddy.exception.ResourceNotFoundException;
import com.kaoyanbuddy.repository.StudyTaskRepository;
import com.kaoyanbuddy.repository.SubjectRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

    private final StudyTaskRepository taskRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectService subjectService;

    public TaskService(StudyTaskRepository taskRepository, SubjectRepository subjectRepository,
                       SubjectService subjectService) {
        this.taskRepository = taskRepository;
        this.subjectRepository = subjectRepository;
        this.subjectService = subjectService;
    }

    public List<TaskResponse> list(UserAccount user, LocalDate date, TaskStatus status, Long subjectId) {
        Subject subject = subjectId == null ? null : subjectService.getSubject(user, subjectId);
        return taskRepository.findByUserOrderByTaskDateAscCreatedAtAsc(user)
                .stream()
                .filter(task -> date == null || task.getTaskDate().equals(date))
                .filter(task -> status == null || task.getStatus() == status)
                .filter(task -> subject == null || task.getSubject().getId().equals(subject.getId()))
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional
    public TaskResponse create(UserAccount user, TaskRequest request) {
        Subject subject = subjectService.getSubject(user, request.subjectId());
        StudyTask task = taskRepository.save(new StudyTask(
                user,
                subject,
                request.title().trim(),
                normalizedDescription(request.description()),
                request.taskDate(),
                request.status() == null ? TaskStatus.TODO : request.status(),
                request.priority() == null ? TaskPriority.MEDIUM : request.priority(),
                request.plannedMinutes(),
                request.actualMinutes() == null ? 0 : request.actualMinutes()
        ));
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse update(UserAccount user, Long id, TaskRequest request) {
        StudyTask task = getTask(user, id);
        Subject subject = subjectService.getSubject(user, request.subjectId());
        task.update(
                subject,
                request.title().trim(),
                normalizedDescription(request.description()),
                request.taskDate(),
                request.status() == null ? task.getStatus() : request.status(),
                request.priority() == null ? task.getPriority() : request.priority(),
                request.plannedMinutes(),
                request.actualMinutes() == null ? task.getActualMinutes() : request.actualMinutes()
        );
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse updateStatus(UserAccount user, Long id, TaskStatusRequest request) {
        StudyTask task = getTask(user, id);
        task.changeStatus(request.status(), request.actualMinutes());
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(UserAccount user, Long id) {
        taskRepository.delete(getTask(user, id));
    }

    @Transactional
    public List<TaskResponse> generate(UserAccount user, TaskGenerateRequest request) {
        LocalDate date = request.date();
        int totalMinutes = request.totalMinutes() == null ? 360 : request.totalMinutes();
        List<Subject> subjects = ensureSubjects(user);
        int perSubject = Math.max(30, totalMinutes / subjects.size());
        List<StudyTask> generated = new ArrayList<>();

        for (Subject subject : subjects) {
            String title = subject.getName() + " 基础复习";
            if (taskRepository.existsByUserAndSubjectAndTaskDateAndTitle(user, subject, date, title)) {
                continue;
            }
            generated.add(taskRepository.save(new StudyTask(
                    user,
                    subject,
                    title,
                    "按当天计划完成知识点复盘、错题整理和限时练习。",
                    date,
                    TaskStatus.TODO,
                    TaskPriority.MEDIUM,
                    perSubject,
                    0
            )));
        }

        return generated.stream().map(TaskResponse::from).toList();
    }

    private StudyTask getTask(UserAccount user, Long id) {
        return taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("任务不存在"));
    }

    private List<Subject> ensureSubjects(UserAccount user) {
        List<Subject> existing = subjectRepository.findByUserOrderByCreatedAtAsc(user);
        if (!existing.isEmpty()) {
            return existing;
        }

        return subjectRepository.saveAll(List.of(
                new Subject(user, "英语", "公共课", "#22c55e", 180),
                new Subject(user, "政治", "公共课", "#f59e0b", 120),
                new Subject(user, "数学", "公共课", "#38bdf8", 220),
                new Subject(user, "专业课", "专业课", "#a78bfa", 260)
        ));
    }

    private String normalizedDescription(String description) {
        return description == null ? "" : description.trim();
    }
}
