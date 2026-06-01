package com.kaoyanbuddy.controller;

import com.kaoyanbuddy.domain.UserAccount;
import com.kaoyanbuddy.dto.DashboardSummaryResponse;
import com.kaoyanbuddy.service.DashboardService;
import com.kaoyanbuddy.service.UserService;
import java.security.Principal;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    public DashboardController(DashboardService dashboardService, UserService userService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary(
            Principal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        UserAccount user = userService.getByUsername(principal.getName());
        return dashboardService.summary(user, start, end);
    }
}
