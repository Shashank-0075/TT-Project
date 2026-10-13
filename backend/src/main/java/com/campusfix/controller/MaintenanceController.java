package com.campusfix.controller;

import com.campusfix.dto.ComplaintDetailResponse;
import com.campusfix.dto.ComplaintFilter;
import com.campusfix.dto.ComplaintSummaryResponse;
import com.campusfix.dto.DashboardResponse;
import com.campusfix.dto.PageResponse;
import com.campusfix.dto.ProgressNoteRequest;
import com.campusfix.dto.ResolutionResponse;
import com.campusfix.dto.ResolveForm;
import com.campusfix.dto.StatusUpdateRequest;
import com.campusfix.security.UserPrincipal;
import com.campusfix.service.ComplaintService;
import com.campusfix.service.DashboardService;
import com.campusfix.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
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

/**
 * Maintenance work: view complaints, start work, add notes, resolve with proof image.
 * Allowed for MAINTENANCE staff; ADMIN may also use these endpoints "when necessary".
 * There is deliberately NO "assign complaint to a staff member" endpoint.
 */
@RestController
@RequestMapping("/api/maintenance")
@PreAuthorize("hasAnyRole('MAINTENANCE', 'ADMIN')")
public class MaintenanceController {

    private final ComplaintService complaintService;
    private final MaintenanceService maintenanceService;
    private final DashboardService dashboardService;

    public MaintenanceController(ComplaintService complaintService, MaintenanceService maintenanceService,
                                 DashboardService dashboardService) {
        this.complaintService = complaintService;
        this.maintenanceService = maintenanceService;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return dashboardService.build(null);
    }

    /** All complaints (use ?unresolvedOnly=true or ?status=PENDING to see the work to be done). */
    @GetMapping("/complaints")
    public PageResponse<ComplaintSummaryResponse> complaints(ComplaintFilter filter) {
        return complaintService.search(filter, null);
    }

    /** Start work: PENDING -> IN_PROGRESS. */
    @PutMapping("/complaints/{id}/status")
    public ComplaintDetailResponse updateStatus(@PathVariable Long id,
                                                @Valid @RequestBody StatusUpdateRequest request,
                                                @AuthenticationPrincipal UserPrincipal principal) {
        return maintenanceService.updateStatus(id, request, principal);
    }

    /** Add a progress remark while the complaint is IN_PROGRESS. */
    @PostMapping("/complaints/{id}/progress")
    public ComplaintDetailResponse addProgress(@PathVariable Long id,
                                               @Valid @RequestBody ProgressNoteRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        return maintenanceService.addProgressNote(id, request, principal);
    }

    /** Resolve: IN_PROGRESS -> RESOLVED with remarks and an optional proof image (multipart). */
    @PostMapping(value = "/complaints/{id}/resolve", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ComplaintDetailResponse resolve(@PathVariable Long id,
                                           @Valid @ModelAttribute ResolveForm form,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        return maintenanceService.resolve(id, form, principal);
    }

    /** Completed maintenance records. */
    @GetMapping("/resolutions")
    public PageResponse<ResolutionResponse> resolutions(@RequestParam(defaultValue = "") String search,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size) {
        return maintenanceService.resolutionHistory(search, page, size);
    }
}
