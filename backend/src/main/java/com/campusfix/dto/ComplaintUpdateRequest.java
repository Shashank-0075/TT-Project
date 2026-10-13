package com.campusfix.dto;

import com.campusfix.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Body of PUT /api/complaints/{id} - the owner edits a complaint that is still PENDING. */
public record ComplaintUpdateRequest(

        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 150, message = "Title must be 5-150 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(min = 10, max = 2000, message = "Description must be 10-2000 characters")
        String description,

        @NotNull(message = "Category is required")
        Long categoryId,

        @NotNull(message = "Location is required")
        Long locationId,

        @NotNull(message = "Priority is required")
        Priority priority) {
}
