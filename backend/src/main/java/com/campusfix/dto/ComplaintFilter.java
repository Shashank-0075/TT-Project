package com.campusfix.dto;

import com.campusfix.entity.ComplaintStatus;
import com.campusfix.entity.Priority;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

/**
 * Query parameters accepted by the complaint list endpoints, e.g.
 * GET /api/admin/complaints?status=PENDING&priority=HIGH&search=fan&page=0&size=10
 * Every field is optional.
 */
public class ComplaintFilter {

    private ComplaintStatus status;
    private Priority priority;
    private Long categoryId;
    private Long locationId;
    /** Only complaints created on or after this date. */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateFrom;
    /** Only complaints created on or before this date. */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateTo;
    /** Searches complaint id, title and description. */
    private String search;
    /** Only complaints submitted by this user (admin / maintenance use). */
    private Long userId;
    /** Only complaints that were escalated at least once. */
    private Boolean escalatedOnly;
    /** Only complaints that are not RESOLVED. */
    private Boolean unresolvedOnly;

    private int page = 0;
    private int size = 10;
    /** createdAt (default), updatedAt or id. */
    private String sortBy = "createdAt";
    /** asc or desc (default). */
    private String sortDir = "desc";

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public LocalDate getDateFrom() {
        return dateFrom;
    }

    public void setDateFrom(LocalDate dateFrom) {
        this.dateFrom = dateFrom;
    }

    public LocalDate getDateTo() {
        return dateTo;
    }

    public void setDateTo(LocalDate dateTo) {
        this.dateTo = dateTo;
    }

    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Boolean getEscalatedOnly() {
        return escalatedOnly;
    }

    public void setEscalatedOnly(Boolean escalatedOnly) {
        this.escalatedOnly = escalatedOnly;
    }

    public Boolean getUnresolvedOnly() {
        return unresolvedOnly;
    }

    public void setUnresolvedOnly(Boolean unresolvedOnly) {
        this.unresolvedOnly = unresolvedOnly;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDir() {
        return sortDir;
    }

    public void setSortDir(String sortDir) {
        this.sortDir = sortDir;
    }
}
