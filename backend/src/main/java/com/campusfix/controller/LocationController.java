package com.campusfix.controller;

import com.campusfix.dto.MasterDataRequest;
import com.campusfix.dto.MasterDataResponse;
import com.campusfix.dto.MessageResponse;
import com.campusfix.security.UserPrincipal;
import com.campusfix.service.LocationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Campus locations. Everyone logged in can list them; only ADMIN can change them. */
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    public List<MasterDataResponse> list(@RequestParam(defaultValue = "false") boolean includeInactive,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = "ADMIN".equals(principal.getRoleName());
        return locationService.list(includeInactive && isAdmin);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MasterDataResponse> create(@Valid @RequestBody MasterDataRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MasterDataResponse update(@PathVariable Long id, @Valid @RequestBody MasterDataRequest request) {
        return locationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MessageResponse delete(@PathVariable Long id) {
        locationService.delete(id);
        return new MessageResponse("Location deleted");
    }
}
