package com.campusfix.service;

import com.campusfix.dto.MasterDataRequest;
import com.campusfix.dto.MasterDataResponse;
import com.campusfix.entity.Category;
import com.campusfix.exception.ConflictException;
import com.campusfix.exception.ResourceNotFoundException;
import com.campusfix.repository.CategoryRepository;
import com.campusfix.repository.ComplaintRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Complaint categories (Electrical, Plumbing ...). */
@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ComplaintRepository complaintRepository;

    public CategoryService(CategoryRepository categoryRepository, ComplaintRepository complaintRepository) {
        this.categoryRepository = categoryRepository;
        this.complaintRepository = complaintRepository;
    }

    /** includeInactive = true is only used for the admin screen. */
    @Transactional(readOnly = true)
    public List<MasterDataResponse> list(boolean includeInactive) {
        List<Category> categories = includeInactive
                ? categoryRepository.findAllByOrderByNameAsc()
                : categoryRepository.findByActiveTrueOrderByNameAsc();
        return categories.stream().map(MasterDataResponse::from).toList();
    }

    public MasterDataResponse create(MasterDataRequest request) {
        String name = request.name().trim();
        if (categoryRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new ConflictException("A category named '" + name + "' already exists");
        }
        Category category = new Category();
        category.setName(name);
        category.setDescription(blankToNull(request.description()));
        category.setActive(request.active() == null || request.active());
        return MasterDataResponse.from(categoryRepository.save(category));
    }

    public MasterDataResponse update(Long id, MasterDataRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        String name = request.name().trim();
        categoryRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ConflictException("A category named '" + name + "' already exists");
            }
        });
        category.setName(name);
        category.setDescription(blankToNull(request.description()));
        if (request.active() != null) {
            category.setActive(request.active());
        }
        return MasterDataResponse.from(categoryRepository.save(category));
    }

    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        if (complaintRepository.existsByCategoryId(id)) {
            throw new ConflictException("This category is used by existing complaints. Deactivate it instead of deleting it.");
        }
        categoryRepository.delete(category);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
