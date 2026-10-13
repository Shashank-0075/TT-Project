package com.campusfix.repository;

import com.campusfix.entity.Location;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByActiveTrueOrderByNameAsc();

    List<Location> findAllByOrderByNameAsc();

    Optional<Location> findByNameIgnoreCase(String name);
}
