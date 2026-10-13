package com.campusfix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

/** Multipart form of POST /api/maintenance/complaints/{id}/resolve. */
public class ResolveForm {

    @NotBlank(message = "Resolution remarks are required")
    @Size(min = 5, max = 2000, message = "Remarks must be 5-2000 characters")
    private String remarks;

    /** Optional proof image. */
    private MultipartFile proofImage;

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public MultipartFile getProofImage() {
        return proofImage;
    }

    public void setProofImage(MultipartFile proofImage) {
        this.proofImage = proofImage;
    }
}
