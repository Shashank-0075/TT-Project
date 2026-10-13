package com.campusfix.service;

import com.campusfix.dto.ChangePasswordRequest;
import com.campusfix.dto.PageResponse;
import com.campusfix.dto.ProfileUpdateRequest;
import com.campusfix.dto.UserCreateRequest;
import com.campusfix.dto.UserResponse;
import com.campusfix.dto.UserUpdateRequest;
import com.campusfix.entity.Role;
import com.campusfix.entity.RoleName;
import com.campusfix.entity.User;
import com.campusfix.exception.BadRequestException;
import com.campusfix.exception.ConflictException;
import com.campusfix.exception.ResourceNotFoundException;
import com.campusfix.repository.RoleRepository;
import com.campusfix.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Profile operations for every user and user management for the admin. */
@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ------------------------------------------------------------------
    // Own profile (any logged-in user)
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        return UserResponse.from(findUser(userId));
    }

    public UserResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = findUser(userId);
        user.setFullName(request.fullName().trim());
        user.setPhone(blankToNull(request.phone()));
        user.setDepartment(blankToNull(request.department()));
        return UserResponse.from(userRepository.save(user));
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    // ------------------------------------------------------------------
    // Admin: user management
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> search(String keyword, RoleName role, Boolean active, int page, int size) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(userRepository.search(safeKeyword, role, active, pageable).map(UserResponse::from));
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return UserResponse.from(findUser(id));
    }

    public UserResponse createUser(UserCreateRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this email already exists");
        }
        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(blankToNull(request.phone()));
        user.setDepartment(blankToNull(request.department()));
        user.setRole(findRole(request.role()));
        user.setActive(true);
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse updateUser(Long id, UserUpdateRequest request, Long currentAdminId) {
        User user = findUser(id);

        // An admin must not lock himself out of the system.
        if (id.equals(currentAdminId)) {
            if (!request.active()) {
                throw new BadRequestException("You cannot deactivate your own account");
            }
            if (request.role() != RoleName.ADMIN) {
                throw new BadRequestException("You cannot remove your own admin role");
            }
        }

        user.setFullName(request.fullName().trim());
        user.setPhone(blankToNull(request.phone()));
        user.setDepartment(blankToNull(request.department()));
        user.setRole(findRole(request.role()));
        user.setActive(request.active());
        return UserResponse.from(userRepository.save(user));
    }

    // ------------------------------------------------------------------

    private User findUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private Role findRole(RoleName name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new BadRequestException("Invalid role: " + name));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
