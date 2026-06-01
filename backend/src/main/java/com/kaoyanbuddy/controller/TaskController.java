package com.kaoyanbuddy.controller;

import com.kaoyanbuddy.domain.TaskStatus;
import com.kaoyanbuddy.domain.UserAccount;
import com.kaoyanbuddy.dto.TaskGenerateRequest;
import com.kaoyanbuddy.dto.TaskRequest;
import com.kaoyanbuddy.dto.TaskResponse;
import com.kaoyanbuddy.dto.TaskStatusRequest;
import com.kaoyanbuddy.service.TaskService;
import com.kaoyanbuddy.service.UserService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    @GetMapping
    public List<TaskResponse> list(
            Principal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Long subjectId
    ) {
        return taskService.list(currentUser(principal), date, status, subjectId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(Principal principal, @Valid @RequestBody TaskRequest request) {
        return taskService.create(currentUser(principal), request);
    }

    @PutMapping("/{id}")
    public TaskResponse update(Principal principal, @PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return taskService.update(currentUser(principal), id, request);
    }

    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(Principal principal, @PathVariable Long id,
                                     @Valid @RequestBody TaskStatusRequest request) {
        return taskService.updateStatus(currentUser(principal), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Principal principal, @PathVariable Long id) {
        taskService.delete(currentUser(principal), id);
    }

    @PostMapping("/generate")
    public List<TaskResponse> generate(Principal principal, @Valid @RequestBody TaskGenerateRequest request) {
        return taskService.generate(currentUser(principal), request);
    }

    private UserAccount currentUser(Principal principal) {
        return userService.getByUsername(principal.getName());
    }
}
