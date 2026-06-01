package com.kaoyanbuddy.controller;

import com.kaoyanbuddy.domain.UserAccount;
import com.kaoyanbuddy.dto.SubjectRequest;
import com.kaoyanbuddy.dto.SubjectResponse;
import com.kaoyanbuddy.service.SubjectService;
import com.kaoyanbuddy.service.UserService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;
    private final UserService userService;

    public SubjectController(SubjectService subjectService, UserService userService) {
        this.subjectService = subjectService;
        this.userService = userService;
    }

    @GetMapping
    public List<SubjectResponse> list(Principal principal) {
        return subjectService.list(currentUser(principal));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubjectResponse create(Principal principal, @Valid @RequestBody SubjectRequest request) {
        return subjectService.create(currentUser(principal), request);
    }

    @PutMapping("/{id}")
    public SubjectResponse update(Principal principal, @PathVariable Long id, @Valid @RequestBody SubjectRequest request) {
        return subjectService.update(currentUser(principal), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Principal principal, @PathVariable Long id) {
        subjectService.delete(currentUser(principal), id);
    }

    private UserAccount currentUser(Principal principal) {
        return userService.getByUsername(principal.getName());
    }
}
