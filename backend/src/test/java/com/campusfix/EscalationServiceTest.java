package com.campusfix;

import com.campusfix.entity.*;
import com.campusfix.repository.*;
import com.campusfix.service.EscalationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class EscalationServiceTest {

    @Autowired
    private EscalationService escalationService;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EscalationConfigRepository configRepository;

    @Autowired
    private EscalationLogRepository logRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User student;
    private Category category;
    private Location location;

    @BeforeEach
    void setUp() {
        Role studentRole = roleRepository.findByName(RoleName.STUDENT_STAFF)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.STUDENT_STAFF)));

        student = new User();
        student.setFullName("Escalation Student");
        student.setEmail("escalation_student@campusfix.edu");
        student.setPassword(passwordEncoder.encode("Pass1234"));
        student.setRole(studentRole);
        student = userRepository.save(student);

        category = new Category();
        category.setName("Escalation Category");
        category.setActive(true);
        category = categoryRepository.save(category);

        location = new Location();
        location.setName("Escalation Location");
        location.setActive(true);
        location = locationRepository.save(location);

        // Ensure config has thresholds: 3 days for LOW -> MEDIUM, 3 days for MEDIUM -> HIGH
        EscalationConfig config = escalationService.getOrCreateConfig();
        config.setLowToMediumDays(3);
        config.setMediumToHighDays(3);
        config.setEnabled(true);
        configRepository.save(config);
    }

    @Test
    void testLowToMediumEscalationAfterThreshold() {
        LocalDateTime baseTime = LocalDateTime.now().minusDays(4);

        Complaint c = new Complaint();
        c.setTitle("Unresolved Low Complaint");
        c.setDescription("Pending for 4 days.");
        c.setCategory(category);
        c.setLocation(location);
        c.setPriority(Priority.LOW);
        c.setStatus(ComplaintStatus.PENDING);
        c.setSubmittedBy(student);
        c.setCreatedAt(baseTime);
        c.setPriorityUpdatedAt(baseTime);
        c = complaintRepository.save(c);

        int count = escalationService.runEscalation(LocalDateTime.now());
        assertTrue(count >= 1);

        Complaint updated = complaintRepository.findById(c.getId()).orElseThrow();
        assertEquals(Priority.MEDIUM, updated.getPriority());
        assertEquals(1, updated.getEscalationCount());
        assertNotNull(updated.getLastEscalatedAt());
        assertNotNull(updated.getEscalationReason());

        List<EscalationLog> logs = logRepository.findByComplaintIdOrderByEscalatedAtAscIdAsc(c.getId());
        assertEquals(1, logs.size());
        assertEquals(Priority.LOW, logs.get(0).getFromPriority());
        assertEquals(Priority.MEDIUM, logs.get(0).getToPriority());
    }

    @Test
    void testLowToHighMultiStepEscalationWhenVeryOld() {
        // Created 8 days ago: passes both 3 days (LOW->MED) and +3 days (MED->HIGH)
        LocalDateTime baseTime = LocalDateTime.now().minusDays(8);

        Complaint c = new Complaint();
        c.setTitle("Old Forgotten Complaint");
        c.setDescription("Pending for 8 days.");
        c.setCategory(category);
        c.setLocation(location);
        c.setPriority(Priority.LOW);
        c.setStatus(ComplaintStatus.PENDING);
        c.setSubmittedBy(student);
        c.setCreatedAt(baseTime);
        c.setPriorityUpdatedAt(baseTime);
        c = complaintRepository.save(c);

        int count = escalationService.runEscalation(LocalDateTime.now());
        assertTrue(count >= 2);

        Complaint updated = complaintRepository.findById(c.getId()).orElseThrow();
        assertEquals(Priority.HIGH, updated.getPriority());
        assertEquals(2, updated.getEscalationCount());

        List<EscalationLog> logs = logRepository.findByComplaintIdOrderByEscalatedAtAscIdAsc(c.getId());
        assertEquals(2, logs.size());
        assertEquals(Priority.LOW, logs.get(0).getFromPriority());
        assertEquals(Priority.MEDIUM, logs.get(0).getToPriority());
        assertEquals(Priority.MEDIUM, logs.get(1).getFromPriority());
        assertEquals(Priority.HIGH, logs.get(1).getToPriority());
    }

    @Test
    void testResolvedComplaintsAreNeverEscalated() {
        LocalDateTime baseTime = LocalDateTime.now().minusDays(10);

        Complaint c = new Complaint();
        c.setTitle("Resolved Long Ago");
        c.setDescription("Resolved 9 days ago.");
        c.setCategory(category);
        c.setLocation(location);
        c.setPriority(Priority.LOW);
        c.setStatus(ComplaintStatus.RESOLVED);
        c.setSubmittedBy(student);
        c.setCreatedAt(baseTime);
        c.setPriorityUpdatedAt(baseTime);
        c.setResolvedAt(baseTime.plusDays(1));
        c = complaintRepository.save(c);

        escalationService.runEscalation(LocalDateTime.now());

        Complaint reloaded = complaintRepository.findById(c.getId()).orElseThrow();
        assertEquals(Priority.LOW, reloaded.getPriority());
        assertEquals(0, reloaded.getEscalationCount());
        assertTrue(logRepository.findByComplaintIdOrderByEscalatedAtAscIdAsc(c.getId()).isEmpty());
    }
}
