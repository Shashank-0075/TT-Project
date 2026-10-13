package com.campusfix.controller;

import com.campusfix.entity.Complaint;
import com.campusfix.exception.ResourceNotFoundException;
import com.campusfix.repository.ComplaintRepository;
import com.campusfix.repository.ResolutionRepository;
import com.campusfix.security.UserPrincipal;
import com.campusfix.service.ComplaintService;
import com.campusfix.service.FileStorageService;
import java.time.Duration;
import java.util.Optional;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves uploaded images. The folder "uploads/" is NOT public: every image request needs a JWT
 * and the user must be allowed to see the complaint the image belongs to.
 * (The frontend downloads the image with Axios and shows it as a blob.)
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;
    private final ComplaintRepository complaintRepository;
    private final ResolutionRepository resolutionRepository;
    private final ComplaintService complaintService;

    public FileController(FileStorageService fileStorageService, ComplaintRepository complaintRepository,
                          ResolutionRepository resolutionRepository, ComplaintService complaintService) {
        this.fileStorageService = fileStorageService;
        this.complaintRepository = complaintRepository;
        this.resolutionRepository = resolutionRepository;
        this.complaintService = complaintService;
    }

    @GetMapping("/{folder}/{filename:.+}")
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> getFile(@PathVariable String folder, @PathVariable String filename,
                                            @AuthenticationPrincipal UserPrincipal principal) {
        String relativePath = folder + "/" + filename;

        // Find the complaint this file belongs to, and check that the caller may view it.
        Complaint owner = findOwningComplaint(folder, relativePath);
        complaintService.assertCanView(owner, principal);

        Resource resource = fileStorageService.load(relativePath);
        return ResponseEntity.ok()
                .contentType(fileStorageService.mediaTypeFor(relativePath))
                .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePrivate())
                .body(resource);
    }

    private Complaint findOwningComplaint(String folder, String relativePath) {
        Optional<Complaint> complaint;
        if (FileStorageService.COMPLAINT_FOLDER.equals(folder)) {
            complaint = complaintRepository.findByImagePath(relativePath);
        } else if (FileStorageService.RESOLUTION_FOLDER.equals(folder)) {
            complaint = resolutionRepository.findByProofImagePath(relativePath)
                    .map(resolution -> resolution.getComplaint());
        } else {
            complaint = Optional.empty();
        }
        return complaint.orElseThrow(() -> new ResourceNotFoundException("File not found"));
    }
}
