package com.kaoyanbuddy.controller;

import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final String appName;

    public HealthController(@Value("${spring.application.name:kaoyan-buddy}") String appName) {
        this.appName = appName;
    }

    @GetMapping
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", appName,
                "timestamp", LocalDateTime.now()
        );
    }
}
