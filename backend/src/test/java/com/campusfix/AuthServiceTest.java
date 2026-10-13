package com.campusfix;

import com.campusfix.dto.AuthResponse;
import com.campusfix.dto.LoginRequest;
import com.campusfix.dto.RegisterRequest;
import com.campusfix.dto.UserResponse;
import com.campusfix.entity.Role;
import com.campusfix.entity.RoleName;
import com.campusfix.exception.BadRequestException;
import com.campusfix.exception.ConflictException;
import com.campusfix.repository.RoleRepository;
import com.campusfix.repository.UserRepository;
import com.campusfix.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @BeforeEach
    void setUp() {
        if (roleRepository.findByName(RoleName.STUDENT).isEmpty()) {
            roleRepository.save(new Role(RoleName.STUDENT));
        }
        if (roleRepository.findByName(RoleName.STAFF).isEmpty()) {
            roleRepository.save(new Role(RoleName.STAFF));
        }
        if (roleRepository.findByName(RoleName.STUDENT_STAFF).isEmpty()) {
            roleRepository.save(new Role(RoleName.STUDENT_STAFF));
        }
        if (roleRepository.findByName(RoleName.ADMIN).isEmpty()) {
            roleRepository.save(new Role(RoleName.ADMIN));
        }
        if (roleRepository.findByName(RoleName.MAINTENANCE).isEmpty()) {
            roleRepository.save(new Role(RoleName.MAINTENANCE));
        }
    }

    @Test
    void testRegisterSuccessDefaultRoleStudent() {
        RegisterRequest req = new RegisterRequest(
                "Test Student",
                "teststudent@campusfix.edu",
                "Pass12345",
                "9876543210",
                "Computer Science"
        );

        UserResponse response = authService.register(req);
        assertNotNull(response);
        assertEquals("teststudent@campusfix.edu", response.email());
        assertEquals("STUDENT", response.role());
        assertTrue(response.active());
        assertTrue(userRepository.existsByEmailIgnoreCase("teststudent@campusfix.edu"));
    }

    @Test
    void testRegisterSuccessWithStaffRole() {
        RegisterRequest req = new RegisterRequest(
                "Prof Sharma",
                "sharma@campusfix.edu",
                "Pass12345",
                "9876543210",
                "Computer Science",
                RoleName.STAFF
        );

        UserResponse response = authService.register(req);
        assertNotNull(response);
        assertEquals("sharma@campusfix.edu", response.email());
        assertEquals("STAFF", response.role());
        assertTrue(response.active());
    }

    @Test
    void testRegisterForbiddenRoleAdminThrowsBadRequest() {
        RegisterRequest req = new RegisterRequest(
                "Hacker Admin",
                "hacker@campusfix.edu",
                "Pass12345",
                "9876543210",
                "IT",
                RoleName.ADMIN
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("only permitted for STUDENT or STAFF"));
    }

    @Test
    void testRegisterForbiddenRoleMaintenanceThrowsBadRequest() {
        RegisterRequest req = new RegisterRequest(
                "Hacker Maint",
                "hackermaint@campusfix.edu",
                "Pass12345",
                "9876543210",
                "Maintenance",
                RoleName.MAINTENANCE
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("only permitted for STUDENT or STAFF"));
    }

    @Test
    void testRegisterForbiddenRoleStudentStaffThrowsBadRequest() {
        RegisterRequest req = new RegisterRequest(
                "Legacy Role User",
                "legacy@campusfix.edu",
                "Pass12345",
                "9876543210",
                "CSE",
                RoleName.STUDENT_STAFF
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("only permitted for STUDENT or STAFF"));
    }

    @Test
    void testRegisterDuplicateEmailThrowsConflict() {
        RegisterRequest req1 = new RegisterRequest(
                "Test Student 1",
                "duplicate@campusfix.edu",
                "Pass12345",
                "9876543210",
                "CSE"
        );
        authService.register(req1);

        RegisterRequest req2 = new RegisterRequest(
                "Test Student 2",
                "duplicate@campusfix.edu",
                "Pass12345",
                "9876543211",
                "ECE"
        );

        assertThrows(ConflictException.class, () -> authService.register(req2));
    }

    @Test
    void testLoginSuccess() {
        RegisterRequest regReq = new RegisterRequest(
                "Login User",
                "loginuser@campusfix.edu",
                "Password123",
                "9876543210",
                "IT"
        );
        authService.register(regReq);

        LoginRequest loginReq = new LoginRequest("loginuser@campusfix.edu", "Password123");
        AuthResponse auth = authService.login(loginReq);

        assertNotNull(auth);
        assertNotNull(auth.token());
        assertEquals("Bearer", auth.tokenType());
        assertEquals("loginuser@campusfix.edu", auth.user().email());
    }

    @Test
    void testLoginInvalidPasswordThrowsBadCredentials() {
        RegisterRequest regReq = new RegisterRequest(
                "Bad Password User",
                "badpass@campusfix.edu",
                "Password123",
                "9876543210",
                "IT"
        );
        authService.register(regReq);

        LoginRequest loginReq = new LoginRequest("badpass@campusfix.edu", "WrongPassword999");
        assertThrows(BadCredentialsException.class, () -> authService.login(loginReq));
    }
}
