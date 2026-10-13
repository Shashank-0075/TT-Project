# CampusFix – Technical Architecture & Engineering Design

This document details the software engineering architecture, security design, database patterns, and data flow mechanisms implemented in **CampusFix**.

---

## 1. System Architecture Overview

CampusFix is engineered as a decoupled, multi-tier enterprise web application adhering to the **RESTful Architectural Style** and **Separation of Concerns (SoC)**.

```text
+-------------------------------------------------------------+
|                      PRESENTATION TIER                      |
|                  React 18 Single-Page App                   |
|   - Component-Driven UI (Vite, CSS Design System)           |
|   - Client-side Routing (React Router v6)                   |
|   - Global Authentication State (React Context API)         |
|   - Asynchronous HTTP Data Fetching (Axios Interceptors)    |
+------------------------------+------------------------------+
                               | HTTPS / REST JSON APIs
                               v
+------------------------------+------------------------------+
|                     APPLICATION LOGIC TIER                  |
|                   Java 17/25 Spring Boot 3.5                |
|   - Web Layer: Spring MVC REST Controllers                  |
|   - Security Layer: Spring Security 6 + JJWT Filters        |
|   - Service Layer: Transactional Business Logic & Scheduling|
|   - Data Access Layer: Spring Data JPA + Hibernate ORM      |
+------------------------------+------------------------------+
                               | JDBC / HikariCP
                               v
+------------------------------+------------------------------+
|                       PERSISTENCE TIER                      |
|                     MySQL 8.0 RDBMS Server                  |
|   - InnoDB Engine (ACID Transactional Guarantees)           |
|   - 3NF Normalized Schema                                   |
|   - Cascading Constraints & Foreign Key Enforcement         |
+-------------------------------------------------------------+
```

---

## 2. Authentication & Authorization Security Model

### 2.1 JSON Web Token (JWT) Lifecycle
CampusFix implements stateless authentication using digitally signed JWTs (`HMAC-SHA512` algorithm):
1. **Login Request:** Client posts `{ email, password }` to `/api/auth/login`.
2. **Credential Authentication:** Spring Security's `AuthenticationManager` invokes `CustomUserDetailsService`.
3. **Password Hashing:** Passwords are verified against the salted `BCrypt` hash stored in MySQL.
4. **Token Issuance:** Upon successful verification, `JwtUtil` issues a compact JWT token containing:
   - Subject (`sub`): User email
   - Claim `uid`: Database User ID
   - Claim `role`: String name of user's role (`ROLE_STUDENT`, `ROLE_STAFF`, `ROLE_STUDENT_STAFF`, `ROLE_ADMIN`, `ROLE_MAINTENANCE`)
   - Expiration (`exp`): 24-hour validity timestamp
5. **Request Authorization:** On subsequent calls, the frontend Axios interceptor injects the `Authorization: Bearer <token>` header.
6. **Filter Pipeline:** `JwtAuthenticationFilter` intercepts incoming requests, validates token signature and expiration, constructs a `UsernamePasswordAuthenticationToken`, and populates the `SecurityContextHolder`.
7. **Method-Level Security:** Endpoints enforce `@PreAuthorize("hasRole('ADMIN')")`, `@PreAuthorize("hasAnyRole('MAINTENANCE', 'ADMIN')")`, or `@PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'STUDENT_STAFF')")`.

---

## 3. Automatic Priority Escalation Engine (Option A)

### 3.1 Design Objective
A major flaw of traditional campus complaint workflows is that unresolved complaints sit indefinitely without escalation. CampusFix solves this through an automated escalation mechanism:

### 3.2 Escalation State Machine
```text
           Unresolved >= X Days               Unresolved >= Y Days
 [LOW]  ------------------------->  [MEDIUM] ------------------------>  [HIGH]
   |                                   |                                  |
   |                                   |                                  |
   +-----------------------------------+----------------------------------+
                                       |
                     Maintenance resolves ticket
                                       v
                                  [RESOLVED]
                     (IMMUNE to further escalations)
```

### 3.3 Algorithm Specification
1. Retrieve active configuration from `escalation_config` (defaults: `lowToMediumDays = 3`, `mediumToHighDays = 4`, `enabled = true`).
2. Query candidate tickets where `status != RESOLVED`.
3. For each candidate ticket:
   - If priority is `LOW` and `ChronoUnit.DAYS.between(priorityUpdatedAt, now) >= lowToMediumDays`:
     - Update priority to `MEDIUM`.
     - Increment `escalationCount` by 1.
     - Reset `priorityUpdatedAt = now`.
     - Record immutable entry in `escalation_logs`.
     - Record state history entry in `complaint_status_history`.
   - If priority is `MEDIUM` and `ChronoUnit.DAYS.between(priorityUpdatedAt, now) >= mediumToHighDays`:
     - Update priority to `HIGH`.
     - Increment `escalationCount` by 1.
     - Reset `priorityUpdatedAt = now`.
     - Record immutable entry in `escalation_logs`.
4. Triggering:
   - **Automated:** `@Scheduled(cron = "0 0 0 * * ?")` executes daily at midnight.
   - **Manual:** Admin can invoke `POST /api/admin/escalation/run` on demand.

---

## 4. File Storage & Upload Security Architecture

CampusFix applies defensive coding practices for file uploads:
1. **MIME & Magic-Byte Inspection:** The system does not trust the client-provided file extension or `Content-Type` header. Instead, `FileStorageService` reads the initial bytes of the input stream to identify file signatures (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WEBP `52 49 46 46`).
2. **File Size Enforcement:** Strict limit enforced (5 MB maximum).
3. **Storage Sanitization:** Uploaded files are assigned cryptographically random `UUID.randomUUID()` names, neutralizing path-traversal attacks (`../../etc/passwd`).
4. **Protected File Serving:** Uploaded complaint photos and resolution proofs are not exposed as public static resources. Requests route through `FileController` (`/api/files/{folder}/{filename}`), validating JWT authorization and user identity before streaming the image bytes.

---

## 5. Frontend Architecture & State Management

### 5.1 Architecture Patterns
- **Single Page Application (SPA):** Built with Vite for rapid module resolution and small production bundles.
- **Client-Side Routing:** Managed via React Router v6 using layout wrapping (`MainLayout`, `PublicLayout`).
- **Route Guards (`ProtectedRoute`):** Inspects user authentication and role claims; redirects unauthenticated users to `/login` and unauthorized roles to `/unauthorized`.
- **Global Context (`AuthContext`):** Manages user session, JWT persistence in `localStorage`, login, and logout state across all components.
- **Data Visualization (`Recharts`):** Transforms backend summary datasets into dynamic SVG line charts, donut charts, and bar charts.
- **Defensive Image Loading (`SecureImage`):** Requests protected images via Axios with JWT credentials, generates an in-memory `URL.createObjectURL(blob)`, and revokes the blob on unmount to prevent memory leaks.

### 5.2 Dedicated Role Dashboards & Routing Strategy
To provide tailored user experiences for campus stakeholders without code duplication:
- **Student Dashboard (`/student/dashboard`):**
  - Targets hostel residents and undergraduate/graduate students.
  - Highlights student-relevant facilities (hostel water/plumbing, classroom projectors, campus Wi-Fi, bench repairs).
  - Displays student SLA expectations and quick complaint submission widgets.
- **Faculty / Staff Dashboard (`/staff/dashboard`):**
  - Targets professors, instructors, and departmental administrative staff.
  - Highlights academic infrastructure (faculty cabin HVAC, smart lecture hall AV gear, laboratory computers, departmental floor amenities).
  - Includes academic priority checklists for high-impact classroom disruptions.
- **Dynamic Role Navigation (`Sidebar.jsx`):**
  - Dynamically evaluates user roles and renders dedicated navigation links:
    - `STUDENT` &rarr; Student Dashboard (`/student/dashboard`)
    - `STAFF` &rarr; Faculty & Staff Portal (`/staff/dashboard`)
    - `STUDENT_STAFF` &rarr; Links to both Student and Staff dashboards
    - `MAINTENANCE` &rarr; Maintenance Work Center (`/maintenance/dashboard`)
    - `ADMIN` &rarr; Executive Institutional Console (`/admin/dashboard`)
- **Smart Gateway (`/dashboard`):**
  - Automatically routes users to their role-specific home page upon logging in.

