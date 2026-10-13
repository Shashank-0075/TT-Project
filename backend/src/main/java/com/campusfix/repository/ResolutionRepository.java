package com.campusfix.repository;

import com.campusfix.entity.Resolution;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResolutionRepository extends JpaRepository<Resolution, Long> {

    @Query("select r from Resolution r join fetch r.resolvedBy where r.complaint.id = :complaintId")
    Optional<Resolution> findByComplaintId(@Param("complaintId") Long complaintId);

    Optional<Resolution> findByProofImagePath(String proofImagePath);

    /** Maintenance "resolution history" - search by complaint title, remarks or id. */
    @Query(value = "select r from Resolution r join fetch r.complaint c join fetch c.category "
            + "join fetch c.location join fetch r.resolvedBy "
            + "where lower(c.title) like lower(concat('%', :keyword, '%')) "
            + "or lower(r.remarks) like lower(concat('%', :keyword, '%')) "
            + "or str(c.id) like concat('%', :keyword, '%')",
            countQuery = "select count(r) from Resolution r join r.complaint c "
                    + "where lower(c.title) like lower(concat('%', :keyword, '%')) "
                    + "or lower(r.remarks) like lower(concat('%', :keyword, '%')) "
                    + "or str(c.id) like concat('%', :keyword, '%')")
    Page<Resolution> search(@Param("keyword") String keyword, Pageable pageable);
}
