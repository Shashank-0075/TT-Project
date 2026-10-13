package com.campusfix;

import com.campusfix.dto.ComplaintDetailResponse;
import com.campusfix.dto.ComplaintForm;
import com.campusfix.entity.*;
import org.springframework.security.access.AccessDeniedException;
import com.campusfix.repository.*;
import com.campusfix.security.UserPrincipal;
import com.campusfix.service.ComplaintService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ComplaintOwnershipSecurityTest {

    @Autowired
    private ComplaintService complaintService;

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

    private User studentA;
    private User studentB;
    private User staffUser;
    private User adminUser;
    private User maintenanceUser;
    private Category category;
    private Location location;

    @BeforeEach
    void setUp() {
        Role studentRole = roleRepository.findByName(RoleName.STUDENT)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.STUDENT)));
        Role staffRole = roleRepository.findByName(RoleName.STAFF)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.STAFF)));
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ADMIN)));
        Role maintRole = roleRepository.findByName(RoleName.MAINTENANCE)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.MAINTENANCE)));

        studentA = new User();
        studentA.setFullName("Student Alice");
        studentA.setEmail("alice@campusfix.edu");
        studentA.setPassword(passwordEncoder.encode("Pass1234"));
        studentA.setRole(studentRole);
        studentA = userRepository.save(studentA);

        studentB = new User();
        studentB.setFullName("Student Bob");
        studentB.setEmail("bob@campusfix.edu");
        studentB.setPassword(passwordEncoder.encode("Pass1234"));
        studentB.setRole(studentRole);
        studentB = userRepository.save(studentB);

        staffUser = new User();
        staffUser.setFullName("Faculty Member");
        staffUser.setEmail("faculty@campusfix.edu");
        staffUser.setPassword(passwordEncoder.encode("Pass1234"));
        staffUser.setRole(staffRole);
        staffUser = userRepository.save(staffUser);

        adminUser = new User();
        adminUser.setFullName("Admin User");
        adminUser.setEmail("admin@campusfix.edu");
        adminUser.setPassword(passwordEncoder.encode("Pass1234"));
        adminUser.setRole(adminRole);
        adminUser = userRepository.save(adminUser);

        maintenanceUser = new User();
        maintenanceUser.setFullName("Maint Tech");
        maintenanceUser.setEmail("tech@campusfix.edu");
        maintenanceUser.setPassword(passwordEncoder.encode("Pass1234"));
        maintenanceUser.setRole(maintRole);
        maintenanceUser = userRepository.save(maintenanceUser);

        category = new Category();
        category.setName("Hostel Wi-Fi");
        category.setActive(true);
        category = categoryRepository.save(category);

        location = new Location();
        location.setName("Hostel A");
        location.setActive(true);
        location = locationRepository.save(location);
    }

    @Test
    void testStudentCanViewOwnComplaint() {
        ComplaintForm form = new ComplaintForm();
        form.setTitle("Alice's Wi-Fi issue");
        form.setDescription("Cannot connect to Wi-Fi access point in room 101.");
        form.setCategoryId(category.getId());
        form.setLocationId(location.getId());
        form.setPriority(Priority.MEDIUM);

        ComplaintDetailResponse created = complaintService.create(form, new UserPrincipal(studentA));
        assertNotNull(created);

        // Alice viewing her own complaint
        ComplaintDetailResponse view = complaintService.getDetails(created.id(), new UserPrincipal(studentA));
        assertEquals(created.id(), view.id());
    }

    @Test
    void testStudentCannotViewAnotherStudentsComplaintThrowsAccessDenied() {
        ComplaintForm form = new ComplaintForm();
        form.setTitle("Alice's Wi-Fi issue");
        form.setDescription("Cannot connect to Wi-Fi access point in room 101.");
        form.setCategoryId(category.getId());
        form.setLocationId(location.getId());
        form.setPriority(Priority.MEDIUM);

        ComplaintDetailResponse created = complaintService.create(form, new UserPrincipal(studentA));
        assertNotNull(created);

        // Bob attempting to view Alice's complaint by IDOR
        assertThrows(AccessDeniedException.class, () ->
                complaintService.getDetails(created.id(), new UserPrincipal(studentB)));
    }

    @Test
    void testStaffCannotViewStudentComplaintThrowsAccessDenied() {
        ComplaintForm form = new ComplaintForm();
        form.setTitle("Alice's Wi-Fi issue");
        form.setDescription("Cannot connect to Wi-Fi access point in room 101.");
        form.setCategoryId(category.getId());
        form.setLocationId(location.getId());
        form.setPriority(Priority.MEDIUM);

        ComplaintDetailResponse created = complaintService.create(form, new UserPrincipal(studentA));
        assertNotNull(created);

        // Staff member attempting to view Alice's complaint
        assertThrows(AccessDeniedException.class, () ->
                complaintService.getDetails(created.id(), new UserPrincipal(staffUser)));
    }

    @Test
    void testAdminCanViewAnyComplaint() {
        ComplaintForm form = new ComplaintForm();
        form.setTitle("Alice's Wi-Fi issue");
        form.setDescription("Cannot connect to Wi-Fi access point in room 101.");
        form.setCategoryId(category.getId());
        form.setLocationId(location.getId());
        form.setPriority(Priority.MEDIUM);

        ComplaintDetailResponse created = complaintService.create(form, new UserPrincipal(studentA));
        assertNotNull(created);

        // Admin can view complaint
        ComplaintDetailResponse view = complaintService.getDetails(created.id(), new UserPrincipal(adminUser));
        assertEquals(created.id(), view.id());
    }

    @Test
    void testMaintenanceCanViewAnyComplaint() {
        ComplaintForm form = new ComplaintForm();
        form.setTitle("Alice's Wi-Fi issue");
        form.setDescription("Cannot connect to Wi-Fi access point in room 101.");
        form.setCategoryId(category.getId());
        form.setLocationId(location.getId());
        form.setPriority(Priority.MEDIUM);

        ComplaintDetailResponse created = complaintService.create(form, new UserPrincipal(studentA));
        assertNotNull(created);

        // Maintenance can view complaint
        ComplaintDetailResponse view = complaintService.getDetails(created.id(), new UserPrincipal(maintenanceUser));
        assertEquals(created.id(), view.id());
    }
}
