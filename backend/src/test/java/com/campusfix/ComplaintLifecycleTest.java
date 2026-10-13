package com.campusfix;

import com.campusfix.dto.ComplaintDetailResponse;
import com.campusfix.dto.ComplaintForm;
import com.campusfix.dto.ResolveForm;
import com.campusfix.dto.StatusUpdateRequest;
import com.campusfix.entity.*;
import com.campusfix.exception.InvalidStatusTransitionException;
import com.campusfix.repository.CategoryRepository;
import com.campusfix.repository.ComplaintRepository;
import com.campusfix.repository.LocationRepository;
import com.campusfix.repository.RoleRepository;
import com.campusfix.repository.UserRepository;
import com.campusfix.security.UserPrincipal;
import com.campusfix.service.ComplaintService;
import com.campusfix.service.MaintenanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ComplaintLifecycleTest {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private MaintenanceService maintenanceService;

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
    private PasswordEncoder passwordEncoder;

    private User student;
    private User maintenanceStaff;
    private Category category;
    private Location location;

    @BeforeEach
    void setUp() {
        Role studentRole = roleRepository.findByName(RoleName.STUDENT_STAFF)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.STUDENT_STAFF)));
        Role maintRole = roleRepository.findByName(RoleName.MAINTENANCE)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.MAINTENANCE)));

        student = new User();
        student.setFullName("Student Lifecycle");
        student.setEmail("lifecycle_student@campusfix.edu");
        student.setPassword(passwordEncoder.encode("Pass1234"));
        student.setRole(studentRole);
        student = userRepository.save(student);

        maintenanceStaff = new User();
        maintenanceStaff.setFullName("Staff Lifecycle");
        maintenanceStaff.setEmail("lifecycle_staff@campusfix.edu");
        maintenanceStaff.setPassword(passwordEncoder.encode("Pass1234"));
        maintenanceStaff.setRole(maintRole);
        maintenanceStaff = userRepository.save(maintenanceStaff);

        category = new Category();
        category.setName("Electrical Test");
        category.setActive(true);
        category = categoryRepository.save(category);

        location = new Location();
        location.setName("Block Test");
        location.setActive(true);
        location = locationRepository.save(location);
    }

    @Test
    void testCompleteComplaintLifecycle() {
        // 1. Student creates complaint
        ComplaintForm form = new ComplaintForm();
        form.setTitle("Fan broken in lab");
        form.setDescription("Speed regulator and fan motor are completely silent.");
        form.setCategoryId(category.getId());
        form.setLocationId(location.getId());
        form.setPriority(Priority.LOW);

        UserPrincipal studentPrincipal = new UserPrincipal(student);
        ComplaintDetailResponse created = complaintService.create(form, studentPrincipal);

        assertNotNull(created.id());
        assertEquals(ComplaintStatus.PENDING, created.status());
        assertEquals(Priority.LOW, created.priority());
        assertEquals("Fan broken in lab", created.title());
        assertFalse(created.statusHistory().isEmpty());

        // 2. Maintenance staff starts work: PENDING -> IN_PROGRESS
        UserPrincipal staffPrincipal = new UserPrincipal(maintenanceStaff);
        StatusUpdateRequest statusReq = new StatusUpdateRequest(ComplaintStatus.IN_PROGRESS, "Inspecting motor");
        ComplaintDetailResponse inProgress = maintenanceService.updateStatus(created.id(), statusReq, staffPrincipal);

        assertEquals(ComplaintStatus.IN_PROGRESS, inProgress.status());

        // 3. Maintenance staff finishes work: IN_PROGRESS -> RESOLVED
        ResolveForm resolveForm = new ResolveForm();
        resolveForm.setRemarks("Motor capacitor replaced, fan is working normally now.");
        ComplaintDetailResponse resolved = maintenanceService.resolve(created.id(), resolveForm, staffPrincipal);

        assertEquals(ComplaintStatus.RESOLVED, resolved.status());
        assertNotNull(resolved.resolvedAt());
        assertNotNull(resolved.resolution());
        assertEquals("Motor capacitor replaced, fan is working normally now.", resolved.resolution().remarks());
    }

    @Test
    void testCannotSkipDirectlyToResolvedWithoutInProgress() {
        ComplaintForm form = new ComplaintForm();
        form.setTitle("Leaking water pipe");
        form.setDescription("Continuous water dripping on the floor.");
        form.setCategoryId(category.getId());
        form.setLocationId(location.getId());
        form.setPriority(Priority.HIGH);

        ComplaintDetailResponse created = complaintService.create(form, new UserPrincipal(student));

        ResolveForm resolveForm = new ResolveForm();
        resolveForm.setRemarks("Pipe fixed directly");

        // Attempting to resolve directly from PENDING should throw InvalidStatusTransitionException
        assertThrows(InvalidStatusTransitionException.class, () ->
                maintenanceService.resolve(created.id(), resolveForm, new UserPrincipal(maintenanceStaff)));
    }
}
