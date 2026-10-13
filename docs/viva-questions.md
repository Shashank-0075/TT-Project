# CampusFix – B.Tech CSE Viva / Defense Preparation Guide

This guide contains the most critical viva-voce questions and comprehensive technical answers to help students confidently defend **CampusFix** in front of external faculty examiners.

---

## Category 1: System Design & Architecture

### Q1. What is the core problem CampusFix solves?
**Answer:** In educational institutions, maintenance problems (electrical faults, broken furniture, plumbing leaks, Wi-Fi outages) are traditionally communicated verbally or over informal WhatsApp groups. This causes issues to be forgotten, leaves students without status tracking, provides administrators with zero visibility or accountability, and allows neglected issues to age indefinitely. CampusFix replaces this informal process with a centralized, transparent, role-based web platform with automated SLA tracking and priority escalation.

### Q2. Why did you choose a decoupled React.js + Spring Boot architecture over a monolithic Spring MVC with Thymeleaf?
**Answer:**
1. **Separation of Concerns:** Frontend engineers focus on user experience and reactive UI rendering; backend engineers focus on transactional integrity, business logic, and security.
2. **Independent Scalability & Deployment:** The React SPA compiles into static HTML/CSS/JS that can be hosted on a CDN, while the Spring Boot backend can scale horizontally across multiple instances.
3. **Cross-Platform Reusability:** The RESTful JSON APIs developed in Spring Boot can seamlessly power a future mobile application (React Native or Flutter) without changing any backend business logic.

---

## Category 2: Backend Engineering & Spring Boot

### Q3. Why did you choose Spring Boot over Node.js / Express or Python / Django?
**Answer:**
- **Enterprise-Grade Type Safety:** Java's static typing prevents runtime type bugs common in large JavaScript applications.
- **Declarative Transactions (`@Transactional`):** Spring manages ACID database transactions automatically, rolling back data mutations if runtime exceptions occur.
- **Robust Security Ecosystem:** Spring Security 6 provides battle-tested defenses against CSRF, session fixation, and unauthorized URL access.
- **Dependency Injection (IoC):** Inversion of Control facilitates clean modularization, loose coupling, and straightforward unit testing with Mockito.

### Q4. How is the complaint search and filtering implemented on the backend?
**Answer:** Rather than executing multiple rigid repository query methods, CampusFix utilizes **JPA Criteria Specifications** (`ComplaintSpecification.java`). A `Specification<Complaint>` dynamically constructs SQL `WHERE` predicates at runtime based on which query parameters (`status`, `priority`, `categoryId`, `locationId`, `search`) are provided by the client, combined seamlessly with Spring Data `Pageable` for zero-overhead server-side pagination.

---

## Category 3: Security & JWT Authentication

### Q5. Explain the end-to-end JWT authentication flow in CampusFix.
**Answer:**
1. The user posts credentials to `/api/auth/login`.
2. `AuthenticationManager` authenticates the credentials against the database using BCrypt hashing.
3. Upon success, `JwtUtil` issues an `HMAC-SHA512` signed JWT containing the user ID, email, and role name.
4. The frontend stores this token and includes it in the `Authorization: Bearer <token>` header for all future requests via an Axios interceptor.
5. On the server, `JwtAuthenticationFilter` intercepts each request, validates the cryptographic signature and expiration, constructs a `UserPrincipal`, and registers it in Spring's `SecurityContextHolder`.
6. Controllers enforce role checks using `@PreAuthorize("hasRole('ADMIN')")`.

### Q6. How are passwords stored securely in the database?
**Answer:** Passwords are never stored in plaintext. They are hashed using **BCrypt** with a work factor (salt rounds) of 12. BCrypt automatically generates a cryptographic salt for each password, defending against rainbow table attacks and brute force cracking.

---

## Category 4: Automatic Priority Escalation Mechanism

### Q7. Explain how the Automatic Priority Escalation feature works.
**Answer:**
1. Traditional systems allow tickets to remain forgotten at Low priority. CampusFix implements **Option A: Dynamic Age-based Escalation**.
2. If an unresolved complaint remains in `LOW` priority beyond the configured threshold (`lowToMediumDays`, default: 3 days), its priority is automatically elevated to `MEDIUM`.
3. If it remains unresolved in `MEDIUM` beyond the secondary threshold (`mediumToHighDays`, default: 4 days), it escalates to `HIGH`.
4. **Safety Guarantees:**
   - Only unresolved complaints (`PENDING` or `IN_PROGRESS`) are evaluated.
   - `RESOLVED` complaints are completely immune to escalation.
   - Every priority elevation creates an immutable audit record in `escalation_logs` and increments `escalationCount`.
   - Thresholds are stored in the database (`escalation_config`) and can be changed by the Admin at runtime without recompiling code.

### Q8. How is the escalation job triggered?
**Answer:**
- **Automated:** Configured with Spring's `@Scheduled(cron = "0 0 0 * * ?")`, executing once daily at midnight.
- **Manual / Viva Demonstration:** Admins can click "Trigger Escalation Scan" in the Admin Dashboard, which executes `POST /api/admin/escalation/run` synchronously.

---

## Category 5: Database & ORM

### Q9. What database engine is used, and what level of normalization is achieved?
**Answer:** MySQL 8.0 with the **InnoDB** storage engine is used. The schema is normalized to **Third Normal Form (3NF)**:
- Primary keys identify all records uniquely (1NF).
- No partial dependencies on composite keys (2NF).
- No transitive dependencies; non-key attributes depend solely on primary keys (3NF).
Lookups such as categories, locations, and roles are extracted into independent lookup tables.

### Q10. What indexes were created, and why?
**Answer:**
- Primary keys on all `id` columns.
- `UNIQUE` indexes on `users(email)`, `categories(name)`, and `locations(name)`.
- Foreign key indexes on `complaints(category_id)`, `complaints(location_id)`, and `complaints(submitted_by)`.
- Composite performance indexes on `complaints(status, priority)` and `complaints(created_at)` to support fast sorting and filtering across thousands of records.

---

## Category 6: File Storage & Defensive Programming

### Q11. How do you prevent malicious executable files from being uploaded as images?
**Answer:** CampusFix does not trust user-supplied file extensions or `multipart` MIME headers. In `FileStorageService.java`, the system reads the first 12 bytes of the raw file input stream to verify **Magic Bytes / File Signatures**:
- JPEG: `FF D8 FF`
- PNG: `89 50 4E 47`
- WEBP: `52 49 46 46 ... 57 45 42 50`
Any file failing magic-byte inspection is rejected immediately with a 400 Bad Request error. Furthermore, files are stored on disk with randomly generated UUID filenames to prevent directory traversal attacks.

---

## Category 7: Frontend Engineering

### Q12. How does the React frontend handle route security?
**Answer:** Using the custom `<ProtectedRoute allowedRoles={[...]}>` wrapper component. When a route is accessed:
1. It inspects the JWT stored in `AuthContext`.
2. If unauthenticated, it redirects to `/login` preserving the attempted path in `state.from`.
3. If authenticated but lacking the required role, it redirects to `/unauthorized`.
4. If authorized, it renders the requested component inside `<MainLayout>`.

### Q13. How does the frontend fetch protected images?
**Answer:** Uploaded images are not publicly accessible via static URLs. The `<SecureImage>` component requests the image via an Axios client with the `Authorization: Bearer <token>` header, receives the raw binary blob, and creates a local browser blob URL using `URL.createObjectURL(blob)`. When the component unmounts, it calls `URL.revokeObjectURL()` to prevent memory leaks.

---

## Category 8: Project Scope Constraints

### Q14. Why are Email Notifications, User Ratings, and Manual Staff Assignment NOT in this project?
**Answer:** These were **deliberately excluded from the project scope**:
1. **Email Notifications:** Educational intranets frequently lack reliable outbound SMTP relays or suffer from spam filtering; system dashboards and badge counters provide superior real-time status visibility.
2. **User Ratings:** Campus maintenance is a mandatory institutional operational duty, not a commercial marketplace; administrative SLA audit logs and resolution proof photos provide objective oversight rather than subjective ratings.
3. **Manual Complaint Assignment:** Manual assignment creates an administrative bottleneck where an admin must individually review and dispatch every broken switch. CampusFix implements a transparent, shared maintenance pool where field technicians take ownership directly by starting work orders.

---

## Category 9: User Experience & Role Specialization

### Q15. Why did you implement separate dashboards for Students and Faculty/Staff, and how does the architecture support them?
**Answer:**
1. **Contextual Operational Differences:**
   - **Students** typically report issues related to hostel living, dining, study rooms, and general campus Wi-Fi. Their dashboard highlights SLA transparency, quick amenity problem shortcuts (projectors, hostel taps, Wi-Fi), and clear priority escalation explanations.
   - **Faculty and Staff** report issues impacting classroom teaching continuity, department labs, faculty cabins, and high-stakes examination or lecture schedules. Their dashboard features academic priority checklists, department-filtered metrics, and specialized academic infrastructure report buttons.
2. **Architectural Implementation:**
   - **Distinct Roles & Routes:** `STUDENT` users are routed to `/student/dashboard`, and `STAFF` users are routed to `/staff/dashboard`, with role-specific navigation links populated by `Sidebar.jsx`.
   - **Backend Authorization:** Secured with `@PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'STUDENT_STAFF')")`, ensuring both user types share the robust complaint lifecycle engine without duplicating backend business logic or database tables.
   - **Dual-Role Support:** Users with the unified `STUDENT_STAFF` role can toggle between both specialized dashboard views seamlessly.

