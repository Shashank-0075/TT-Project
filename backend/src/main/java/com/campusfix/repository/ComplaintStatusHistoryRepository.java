package com.campusfix.repository;

import com.campusfix.entity.ComplaintStatusHistory;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintStatusHistoryRepository extends JpaRepository<ComplaintStatusHistory, Long> {

    /** Timeline of one complaint (oldest first). */
    @EntityGraph(attributePaths = {"changedBy"})
    List<ComplaintStatusHistory> findByComplaintIdOrderByChangedAtAscIdAsc(Long complaintId);

    /** Activity feed of all complaints submitted by one user (newest first). */
    @EntityGraph(attributePaths = {"complaint", "changedBy"})
    Page<ComplaintStatusHistory> findByComplaintSubmittedByIdOrderByChangedAtDescIdDesc(Long userId, Pageable pageable);
}
