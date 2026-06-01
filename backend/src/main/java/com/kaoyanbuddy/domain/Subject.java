package com.kaoyanbuddy.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(nullable = false, length = 40)
    private String category;

    @Column(nullable = false, length = 16)
    private String color;

    @Column(nullable = false)
    private Integer targetHours;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Subject() {
    }

    public Subject(UserAccount user, String name, String category, String color, Integer targetHours) {
        this.user = user;
        this.name = name;
        this.category = category;
        this.color = color;
        this.targetHours = targetHours;
    }

    public void update(String name, String category, String color, Integer targetHours) {
        this.name = name;
        this.category = category;
        this.color = color;
        this.targetHours = targetHours;
    }

    public Long getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public String getColor() {
        return color;
    }

    public Integer getTargetHours() {
        return targetHours;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
