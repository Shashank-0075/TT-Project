package com.campusfix.service;

import com.campusfix.dto.AuthResponse;
import com.campusfix.dto.LoginRequest;
import com.campusfix.dto.RegisterRequest;
import com.campusfix.dto.UserResponse;
import com.campusfix.entity.Role;
import com.campusfix.entity.RoleName;
import com.campusfix.entity.User;
import com.campusfix.exception.ConflictException;
import com.campusfix.repository.RoleRepository;
import com.campusfix.repository.UserRepository;
import com.campusfix.security.UserPrincipal;
import com.campusfix.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Registration and login. */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    /** Public registration: always creates a STUDENT_STAFF user. */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this email already exists");
        }

        RoleName targetRole = request.role() != null ? request.role() : RoleName.STUDENT;
        Role role = roleRepository.findByName(targetRole)
                .or(() -> roleRepository.findByName(RoleName.STUDENT_STAFF))
                .orElseThrow(() -> new IllegalStateException("Role is missing in the database"));

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password())); // never store the plain password
        user.setPhone(blankToNull(request.phone()));
        user.setDepartment(blankToNull(request.department()));
        user.setRole(role);
        user.setActive(true);

        return UserResponse.from(userRepository.save(user));
    }

    /** Checks email + password and returns a JWT. Wrong credentials -> BadCredentialsException (401). */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId()).orElseThrow();
        String token = jwtUtil.generateToken(principal);

        return new AuthResponse(token, "Bearer", jwtUtil.getExpirationMs(), UserResponse.from(user));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
