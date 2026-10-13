package com.campusfix.repository;

import com.campusfix.entity.EscalationLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EscalationLogRepository extends JpaRepository<EscalationLog, Long> {

    List<EscalationLog> findByComplaintIdOrderByEscalatedAtAscIdAsc(Long complaintId);
}
