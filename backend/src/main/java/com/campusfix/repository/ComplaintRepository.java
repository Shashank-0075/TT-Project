package com.campusfix.repository;

import com.campusfix.entity.Complaint;
import com.campusfix.entity.ComplaintStatus;
import com.campusfix.entity.Priority;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Complaint queries.
 *
 * Searching/filtering uses JpaSpecificationExecutor (see ComplaintSpecification).
 * Dashboard statistics use small JPQL queries. In all statistics queries
 * "userId" is optional: null = all complaints, a value = only that user's complaints.
 */
public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    /** Load category, location and user in the same query to avoid many small queries. */
    @Override
    @EntityGraph(attributePaths = {"category", "location", "submittedBy"})
    Page<Complaint> findAll(Specification<Complaint> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "location", "submittedBy"})
    Optional<Complaint> findWithDetailsById(Long id);

    Optional<Complaint> findByImagePath(String imagePath);

    boolean existsByCategoryId(Long categoryId);

    boolean existsByLocationId(Long locationId);

    /** Complaints the escalation job has to look at (unresolved and not yet HIGH). */
    List<Complaint> findByStatusNotAndPriorityNot(ComplaintStatus status, Priority priority);

    // ------------------------- statistics -------------------------

    @Query("select c.status, count(c) from Complaint c "
            + "where (:userId is null or c.submittedBy.id = :userId) group by c.status")
    List<Object[]> countGroupedByStatus(@Param("userId") Long userId);

    @Query("select c.priority, count(c) from Complaint c "
            + "where (:userId is null or c.submittedBy.id = :userId) group by c.priority")
    List<Object[]> countGroupedByPriority(@Param("userId") Long userId);

    @Query("select c.category.name, count(c) from Complaint c "
            + "where (:userId is null or c.submittedBy.id = :userId) "
            + "group by c.category.name order by count(c) desc")
    List<Object[]> countGroupedByCategory(@Param("userId") Long userId);

    @Query("select c.location.name, count(c) from Complaint c "
            + "where (:userId is null or c.submittedBy.id = :userId) "
            + "group by c.location.name order by count(c) desc")
    List<Object[]> countGroupedByLocation(@Param("userId") Long userId);

    @Query("select year(c.createdAt), month(c.createdAt), count(c) from Complaint c "
            + "where c.createdAt >= :from and (:userId is null or c.submittedBy.id = :userId) "
            + "group by year(c.createdAt), month(c.createdAt)")
    List<Object[]> countGroupedByMonth(@Param("from") LocalDateTime from, @Param("userId") Long userId);

    @Query("select count(c) from Complaint c where c.priority = :priority and c.status <> :excludedStatus "
            + "and (:userId is null or c.submittedBy.id = :userId)")
    long countByPriorityExcludingStatus(@Param("priority") Priority priority,
                                        @Param("excludedStatus") ComplaintStatus excludedStatus,
                                        @Param("userId") Long userId);

    @Query("select count(c) from Complaint c where c.escalationCount > 0 and c.status <> :excludedStatus "
            + "and (:userId is null or c.submittedBy.id = :userId)")
    long countEscalatedExcludingStatus(@Param("excludedStatus") ComplaintStatus excludedStatus,
                                       @Param("userId") Long userId);
}
