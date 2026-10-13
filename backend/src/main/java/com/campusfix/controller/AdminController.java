package com.campusfix.controller;

import com.campusfix.dto.ComplaintFilter;
import com.campusfix.dto.ComplaintSummaryResponse;
import com.campusfix.dto.DashboardResponse;
import com.campusfix.dto.EscalationConfigRequest;
import com.campusfix.dto.EscalationConfigResponse;
import com.campusfix.dto.MessageResponse;
import com.campusfix.dto.PageResponse;
import com.campusfix.security.UserPrincipal;
import com.campusfix.service.ComplaintService;
import com.campusfix.service.DashboardService;
import com.campusfix.service.EscalationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Admin dashboard, all complaints and escalation management - ADMIN only. */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ComplaintService complaintService;
    private final DashboardService dashboardService;
    private final EscalationService escalationService;

    public AdminController(ComplaintService complaintService, DashboardService dashboardService,
                           EscalationService escalationService) {
        this.complaintService = complaintService;
        this.dashboardService = dashboardService;
        this.escalationService = escalationService;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return dashboardService.build(null);
    }

    /** All complaints of all users (search / filters / paging). */
    @GetMapping("/complaints")
    public PageResponse<ComplaintSummaryResponse> allComplaints(ComplaintFilter filter) {
        return complaintService.search(filter, null);
    }

    /** Complaints whose priority was raised automatically at least once. */
    @GetMapping("/complaints/escalated")
    public PageResponse<ComplaintSummaryResponse> escalatedComplaints(ComplaintFilter filter) {
        filter.setEscalatedOnly(true);
        return complaintService.search(filter, null);
    }

    @GetMapping("/escalation-config")
    public EscalationConfigResponse getEscalationConfig() {
        return escalationService.getConfig();
    }

    @PutMapping("/escalation-config")
    public EscalationConfigResponse updateEscalationConfig(@Valid @RequestBody EscalationConfigRequest request,
                                                           @AuthenticationPrincipal UserPrincipal admin) {
        return escalationService.updateConfig(request, admin.getId());
    }

    /** Runs the escalation check immediately (the scheduler also runs it automatically). */
    @PostMapping("/escalation/run")
    public MessageResponse runEscalationNow() {
        int count = escalationService.runEscalation();
        return new MessageResponse(count == 0
                ? "Escalation check completed. No complaint needed escalation."
                : "Escalation check completed. " + count + " priority increase(s) applied.");
    }
}
