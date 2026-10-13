package com.campusfix.repository;

import com.campusfix.entity.RoleName;
import com.campusfix.entity.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    /**
     * Admin user search. "keyword" matches name or email (pass "" for everything);
     * "role" and "active" are optional filters (null = any).
     */
    @Query("select u from User u "
            + "where (:role is null or u.role.name = :role) "
            + "and (:active is null or u.active = :active) "
            + "and (lower(u.fullName) like lower(concat('%', :keyword, '%')) "
            + "     or lower(u.email) like lower(concat('%', :keyword, '%')))")
    Page<User> search(@Param("keyword") String keyword,
                      @Param("role") RoleName role,
                      @Param("active") Boolean active,
                      Pageable pageable);
}
