package com.campusfix.service;

import com.campusfix.dto.MasterDataRequest;
import com.campusfix.dto.MasterDataResponse;
import com.campusfix.entity.Location;
import com.campusfix.exception.ConflictException;
import com.campusfix.exception.ResourceNotFoundException;
import com.campusfix.repository.ComplaintRepository;
import com.campusfix.repository.LocationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Campus locations (Block A, Library, Hostel ...). */
@Service
@Transactional
public class LocationService {

    private final LocationRepository locationRepository;
    private final ComplaintRepository complaintRepository;

    public LocationService(LocationRepository locationRepository, ComplaintRepository complaintRepository) {
        this.locationRepository = locationRepository;
        this.complaintRepository = complaintRepository;
    }

    /** includeInactive = true is only used for the admin screen. */
    @Transactional(readOnly = true)
    public List<MasterDataResponse> list(boolean includeInactive) {
        List<Location> locations = includeInactive
                ? locationRepository.findAllByOrderByNameAsc()
                : locationRepository.findByActiveTrueOrderByNameAsc();
        return locations.stream().map(MasterDataResponse::from).toList();
    }

    public MasterDataResponse create(MasterDataRequest request) {
        String name = request.name().trim();
        if (locationRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new ConflictException("A location named '" + name + "' already exists");
        }
        Location location = new Location();
        location.setName(name);
        location.setDescription(blankToNull(request.description()));
        location.setActive(request.active() == null || request.active());
        return MasterDataResponse.from(locationRepository.save(location));
    }

    public MasterDataResponse update(Long id, MasterDataRequest request) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id));
        String name = request.name().trim();
        locationRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ConflictException("A location named '" + name + "' already exists");
            }
        });
        location.setName(name);
        location.setDescription(blankToNull(request.description()));
        if (request.active() != null) {
            location.setActive(request.active());
        }
        return MasterDataResponse.from(locationRepository.save(location));
    }

    public void delete(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id));
        if (complaintRepository.existsByLocationId(id)) {
            throw new ConflictException("This location is used by existing complaints. Deactivate it instead of deleting it.");
        }
        locationRepository.delete(location);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
