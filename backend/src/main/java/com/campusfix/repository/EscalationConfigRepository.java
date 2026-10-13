package com.campusfix.repository;

import com.campusfix.entity.EscalationConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EscalationConfigRepository extends JpaRepository<EscalationConfig, Long> {

    /** The configuration is a single row - we always use the first one. */
    Optional<EscalationConfig> findFirstByOrderByIdAsc();
}
