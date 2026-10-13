package com.campusfix.dto;

import com.campusfix.entity.Category;
import com.campusfix.entity.Location;

/** Response for a category or a location. */
public record MasterDataResponse(Long id, String name, String description, boolean active) {

    public static MasterDataResponse from(Category category) {
        return new MasterDataResponse(category.getId(), category.getName(),
                category.getDescription(), category.isActive());
    }

    public static MasterDataResponse from(Location location) {
        return new MasterDataResponse(location.getId(), location.getName(),
                location.getDescription(), location.isActive());
    }
}
