package com.campusfix.controller;

import com.campusfix.dto.ComplaintDetailResponse;
import com.campusfix.dto.ComplaintFilter;
import com.campusfix.dto.ComplaintForm;
import com.campusfix.dto.ComplaintSummaryResponse;
import com.campusfix.dto.ComplaintUpdateRequest;
import com.campusfix.dto.DashboardResponse;
import com.campusfix.dto.PageResponse;
import com.campusfix.dto.StatusHistoryResponse;
import com.campusfix.security.UserPrincipal;
import com.campusfix.service.ComplaintService;
import com.campusfix.service.DashboardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Complaint endpoints for students / staff (plus the shared "get details" endpoint). */
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final DashboardService dashboardService;

    public ComplaintController(ComplaintService complaintService, DashboardService dashboardService) {
        this.complaintService = complaintService;
        this.dashboardService = dashboardService;
    }

    /** Submit a complaint. Sent as multipart/form-data because it can contain an image. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'STUDENT_STAFF')")
    public ResponseEntity<ComplaintDetailResponse> create(@Valid @ModelAttribute ComplaintForm form,
                                                          @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintService.create(form, principal));
    }

    /** My complaints with search, filters and paging. */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'STUDENT_STAFF')")
    public PageResponse<ComplaintSummaryResponse> myComplaints(ComplaintFilter filter,
                                                               @AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.search(filter, principal.getId());
    }

    /** Activity feed (all status changes) of my complaints. */
    @GetMapping("/my/history")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'STUDENT_STAFF')")
    public PageResponse<StatusHistoryResponse> myHistory(@RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "10") int size,
                                                         @AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.myHistory(principal.getId(), page, size);
    }

    /** Dashboard numbers for my own complaints. */
    @GetMapping("/my/dashboard")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'STUDENT_STAFF')")
    public DashboardResponse myDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return dashboardService.build(principal.getId());
    }

    /** Complaint details. Owners see their own, admin and maintenance see everything. */
    @GetMapping("/{id}")
    public ComplaintDetailResponse getDetails(@PathVariable Long id,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.getDetails(id, principal);
    }

    /** The owner edits a complaint that is still PENDING. */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'STUDENT_STAFF')")
    public ComplaintDetailResponse update(@PathVariable Long id,
                                          @Valid @RequestBody ComplaintUpdateRequest request,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.update(id, request, principal);
    }
}
