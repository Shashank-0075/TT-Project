package com.campusfix.config;

import com.campusfix.entity.Role;
import com.campusfix.entity.RoleName;
import com.campusfix.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Safety net that runs at start-up: makes sure the three roles exist, even if
 * database/seed.sql has not been executed yet. (Demo users come from seed.sql.)
 */
@Component
public class RoleInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public RoleInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        for (RoleName name : RoleName.values()) {
            if (roleRepository.findByName(name).isEmpty()) {
                roleRepository.save(new Role(name));
            }
        }
    }
}
