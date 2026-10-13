package com.campusfix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point of the CampusFix backend.
 *
 * @EnableScheduling switches on the @Scheduled methods. We use it for the
 * automatic priority escalation job (see EscalationScheduler).
 */
@SpringBootApplication
@EnableScheduling
public class CampusFixApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusFixApplication.class, args);
    }
}
