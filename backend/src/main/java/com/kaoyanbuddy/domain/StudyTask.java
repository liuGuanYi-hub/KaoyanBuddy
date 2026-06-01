package com.kaoyanbuddy.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_tasks")
public class StudyTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private LocalDate taskDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(nullable = false)
    private Integer plannedMinutes;

    @Column(nullable = false)
    private Integer actualMinutes = 0;

    private LocalDateTime completedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected StudyTask() {
    }

    public StudyTask(UserAccount user, Subject subject, String title, String description, LocalDate taskDate,
                     TaskStatus status, TaskPriority priority, Integer plannedMinutes, Integer actualMinutes) {
        this.user = user;
        this.subject = subject;
        this.title = title;
        this.description = description;
        this.taskDate = taskDate;
        this.status = status;
        this.priority = priority;
        this.plannedMinutes = plannedMinutes;
        this.actualMinutes = actualMinutes;
        updateCompletedAt();
    }

    public void update(Subject subject, String title, String description, LocalDate taskDate, TaskStatus status,
                       TaskPriority priority, Integer plannedMinutes, Integer actualMinutes) {
        this.subject = subject;
        this.title = title;
        this.description = description;
        this.taskDate = taskDate;
        this.status = status;
        this.priority = priority;
        this.plannedMinutes = plannedMinutes;
        this.actualMinutes = actualMinutes;
        updateCompletedAt();
    }

    public void changeStatus(TaskStatus status, Integer actualMinutes) {
        this.status = status;
        if (actualMinutes != null) {
            this.actualMinutes = actualMinutes;
        }
        updateCompletedAt();
    }

    private void updateCompletedAt() {
        if (status == TaskStatus.DONE && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
        if (status != TaskStatus.DONE) {
            completedAt = null;
        }
    }

    public Long getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public Subject getSubject() {
        return subject;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getTaskDate() {
        return taskDate;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public Integer getPlannedMinutes() {
        return plannedMinutes;
    }

    public Integer getActualMinutes() {
        return actualMinutes;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
