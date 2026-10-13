# CampusFix – Smart College Complaint and Maintenance Management System

> **B.Tech Computer Science & Engineering Major Project**  
> **Architecture:** React.js (Vite) + Java Spring Boot 3.5 + Spring Security (JWT) + Spring Data JPA (Hibernate) + MySQL 8.0

---

## 1. Project Overview & Abstract

In educational institutions, students, faculty, and staff frequently encounter infrastructure failures such as electrical faults, non-functioning classroom projectors, Wi-Fi outages, plumbing leaks, broken benches, and sanitation issues. Historically, these problems are reported verbally or through informal messaging channels (e.g., WhatsApp, personal emails), leading to missed complaints, lack of accountability, zero resolution audit trails, and neglected aging issues.

**CampusFix** is an enterprise-grade, full-stack college complaint and maintenance management web platform. It digitizes the entire lifecycle of campus complaints:
- Students and staff log in securely to report issues with titles, detailed descriptions, category classification, exact campus locations, priority levels, and optional photo attachments.
- Maintenance staff access a unified operational queue of available complaints, initiate work (`PENDING` &rarr; `IN PROGRESS`), add progressive maintenance remarks, and formally close issues with resolution descriptions and completion proof images (`IN PROGRESS` &rarr; `RESOLVED`).
- Administrators oversee campus operations via real-time statistical dashboards with multi-dimensional chart visualizations, manage users, categories, and campus locations, and monitor aging issues.
- **Special Feature – Automatic Priority Escalation (Option A):** An automated background scheduler monitors unresolved tickets. If a complaint remains unresolved beyond configured SLA thresholds (e.g., Low &rarr; Medium after 3 days; Medium &rarr; High after 4 additional days), the system automatically promotes its priority, increments the escalation counter, logs an immutable audit entry, and flags it on administrative alerts.

---

## 2. Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, React Router DOM v6, Axios, Recharts (Data Visualization), Lucide React (Icons), Pure Modern CSS Design System |
| **Backend** | Java 17/25, Spring Boot 3.5.16, Spring MVC (REST APIs), Spring Security 6, JJWT (HMAC-SHA512), Spring Data JPA, Hibernate ORM, Maven 3.9 |
| **Database** | MySQL 8.0 (InnoDB, ACID compliant, Normalized 3NF Schema with Foreign Keys, Cascades & Strategic Indexes) |
| **Storage** | Local Secure Disk Storage with MIME magic-byte validation and UUID filename isolation |
| **Testing** | JUnit 5, Mockito, Spring Boot Test, Maven Surefire |

---

## 3. Architecture & Data Flow

```text
+------------------------------------------------------------------------+
|                          REACT FRONTEND                                |
|   (Vite SPA, Lucide Icons, Recharts Analytics, Axios JWT Interceptor)  |
+-----------------------------------+------------------------------------+
                                    | RESTful JSON (over HTTPS/HTTP)
                                    v
+-----------------------------------+------------------------------------+
|                       JAVA SPRING BOOT BACKEND                         |
|                                                                        |
|  [Security Filter Chain]  --->  [JwtAuthenticationFilter]               |
|                                         |                              |
|  [Spring MVC Controllers] <-------------+ (Role-Based Authorization)   |
|   - AuthController           - ComplaintController                     |
|   - AdminController          - MaintenanceController                   |
|   - MasterDataControllers    - FileController                          |
|                                                                        |
|  [Service Business Logic Layer]                                        |
|   - ComplaintService         - MaintenanceService                      |
|   - EscalationService        - EscalationScheduler (@Scheduled)        |
|   - FileStorageService       - DashboardService                        |
|                                                                        |
|  [Data Access Layer]                                                   |
|   - Spring Data JPA Repositories                                       |
|   - JPA Dynamic Criteria Specifications                                |
|   - Hibernate Object-Relational Mapping (ORM)                          |
+-----------------------------------+------------------------------------+
                                    | JDBC (HikariCP Connection Pool)
                                    v
+-----------------------------------+------------------------------------+
|                         MYSQL 8.0 DATABASE                             |
|   (roles, users, categories, locations, complaints, status_history,    |
|    resolutions, escalation_logs, escalation_config)                    |
+------------------------------------------------------------------------+
```

---

## 4. User Roles & Dedicated Portals

### Role 1: Student (`STUDENT`) — Dedicated Student Portal (`/student/dashboard`)
- **Self-registration**: Sign up as an "Enrolled Student" with university email, department, and phone.
- **Student Dashboard**: Tailored view with student-specific status cards, active complaints table, and quick shortcuts for campus amenities (Classroom Projectors, Hostel Water/Plumbing, Campus Wi-Fi & LAN, Broken Benches).
- **Complaint Submission**: Select category, campus location (academic blocks, hostels, labs), priority, title, detailed description, and upload photo attachments.
- **Live Status Tracking**: View real-time status (`PENDING` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`), priority badges, and transparent escalation notifications.
- **Timeline & Audit**: Complete immutable event history and resolution remarks with proof photos.

### Role 2: Faculty / Staff (`STAFF`) — Dedicated Faculty & Staff Portal (`/staff/dashboard`)
- **Self-registration**: Sign up as "Faculty / Staff" with university designation and academic department.
- **Staff Dashboard**: Tailored academic workspace featuring department-oriented KPIs, urgent pending classroom issues, and quick report shortcuts for faculty cabins, lecture halls, department labs, and floor facilities.
- **Academic Priority Guidelines**: Clear operational reminders regarding lecture hall acoustics, projector uptime, lab safety, and air conditioning.
- **Complaint History & Filter**: Full search and multi-criteria filtering across personal complaints.

### Role 3: Maintenance Staff (`MAINTENANCE`) — Operational Work Center (`/maintenance/dashboard`)
- **Shared Operational Queue**: Access all open campus complaints across all departments (avoids manual dispatch bottleneck).
- **Work Order Progression**: Move tickets from `PENDING` &rarr; `IN_PROGRESS` ("Start Work").
- **Work Notes**: Add incremental progress remarks during active repair.
- **Formal Resolution**: Close work orders (`IN_PROGRESS` &rarr; `RESOLVED`) with mandatory completion remarks and optional proof photo upload.
- **Resolution History**: Filter and inspect previously resolved work orders and uploaded proof photos.

### Role 4: Administrator (`ADMIN`) — Institutional Management Console (`/admin/dashboard`)
- **Institutional Analytics**:
  - Real-time KPI summary (Total, Pending, In Progress, Resolved, Escalated, High Priority).
  - Multi-dimensional Recharts analytics: Complaints by Category bar chart, Top Locations breakdown, Priority distribution pie chart, and 6-month monthly trend lines.
  - Urgent Escalation Alert Banner with 1-click drill-down.
- **Cross-Campus Complaints Directory**: Search, multi-criteria filter, inspect details, and update status when required.
- **Dedicated Escalated Complaints Portal**: Review tickets automatically promoted due to SLA breaches.
- **User Management**: Inspect users, create accounts, edit roles, and toggle account activation.
- **Master Data Management**: Category and Campus Location administration (Create, Edit, Toggle Active, Delete).
- **Escalation Policy Management**: Dynamically configure Low-to-Medium and Medium-to-High SLA day thresholds, enable/disable background scheduler, and trigger on-demand scan.

---

## 5. Explicit Scope Constraints (Deliberately Excluded)
Per the system design specification:
1. **NO Email notifications** (No external SMTP dependencies or spam).
2. **NO User feedback or rating star system** (Focused purely on complaint management).
3. **NO Manual individual assignment** (Complaints belong to a transparent, shared maintenance pool).

---

## 6. Pre-Configured Demo Accounts (Ready for Viva & Evaluation)

The login page includes convenient **1-Click Demo Login** buttons for instant access to each portal without typing:

| Role | Portal / Dashboard | Email | Password | Pre-loaded Sample Data |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `/admin/dashboard` | `admin@campusfix.edu` | `Admin@123` | Institutional oversight & policy controls |
| **Maintenance Staff** | `/maintenance/dashboard` | `maintenance1@campusfix.edu` | `Maint@123` | 18 work orders across campus |
| **Maintenance Staff** | `/maintenance/dashboard` | `maintenance2@campusfix.edu` | `Maint@123` | Civil & Plumbing work orders |
| **Student** | `/student/dashboard` | `student1@campusfix.edu` | `Student@123` | 5 student complaints (1 escalated) |
| **Student** | `/student/dashboard` | `student2@campusfix.edu` | `Student@123` | Lab equipment & Wi-Fi complaints |
| **Faculty / Staff** | `/staff/dashboard` | `staff1@campusfix.edu` | `Student@123` | Faculty cabin AC & lab complaints |

---

## 7. Database Structure & Seed Data

The database schema is fully normalized in 3NF and consists of 9 core tables:
1. `roles`: Role definitions (`STUDENT`, `STAFF`, `STUDENT_STAFF`, `ADMIN`, `MAINTENANCE`).
2. `users`: Credentials, BCrypt hash, department, phone, status.
3. `categories`: Complaint categories (Electrical, Plumbing, Wi-Fi, Furniture, etc.).
4. `locations`: Campus buildings, classrooms, labs, and hostel blocks.
5. `complaints`: Core complaint entity with category, location, priority, status, submitter.
6. `complaint_status_history`: Immutable transition log for every status change with actor and remarks.
7. `resolutions`: Maintenance closure records with completion remarks and proof images.
8. `escalation_logs`: Immutable audit trail of automatic priority bumps.
9. `escalation_config`: Dynamic day thresholds and scheduler toggle.

---

## 8. Quick Start Guide

### Prerequisites
- **Java Development Kit (JDK 17 or higher)**
- **Apache Maven 3.9+**
- **Node.js (v18+) & npm**
- **MySQL Server 8.0** running on `localhost:3306`

### Step 1: Database Setup
1. Log into your MySQL console:
   ```bash
   mysql -u root -p
   ```
2. Execute the schema script:
   ```sql
   source database/schema.sql;
   ```
3. Execute the seed data script:
   ```sql
   source database/seed.sql;
   ```

### Step 2: Backend Configuration & Launch
1. Open `backend/.env` or `backend/src/main/resources/application.properties` and verify your MySQL password:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/campusfix?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=root
   ```
2. Compile and run the Spring Boot application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *Or run the pre-built JAR:*
   ```bash
   java -jar target/campusfix-backend-1.0.0.jar
   ```
3. Backend starts at `http://localhost:8080`.

### Step 3: Frontend Launch
1. In a separate terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.

---

## 9. Verification & Automated Test Suite

Run backend unit and integration tests covering JWT authentication, complaint lifecycles, and priority escalation:
```bash
cd backend
mvn test
```
**Test Results:** `9 tests run, 0 failures, 0 errors, BUILD SUCCESS`.

---

## 10. Project Directory Layout

```text
CampusFix/
|-- backend/
|   |-- src/main/java/com/campusfix/
|   |   |-- config/              # SecurityConfig, CorsConfig
|   |   |-- controller/          # REST Controllers
|   |   |-- dto/                 # Request & Response Records
|   |   |-- entity/              # JPA Entities & Enums
|   |   |-- exception/           # Global Exception Handlers
|   |   |-- repository/          # Spring Data JPA Repositories
|   |   |-- security/            # JWT Token Provider & Filters
|   |   |-- service/             # Business Logic & Escalation Engine
|   |   +-- CampusFixApplication.java
|   |-- src/main/resources/      # application.properties
|   |-- src/test/java/           # JUnit5 & Mockito test suite
|   +-- pom.xml
|-- database/
|   |-- schema.sql               # Clean MySQL DDL
|   |-- seed.sql                 # Comprehensive demo dataset
|   +-- README.md
|-- docs/
|   |-- architecture.md          # In-depth system architecture
|   |-- api-documentation.md     # REST API specification
|   |-- setup.md                 # STS & IDE setup guide
|   +-- viva-questions.md        # Comprehensive viva preparation
|-- frontend/
|   |-- src/
|   |   |-- api/                 # Axios clients
|   |   |-- components/          # Reusable UI widgets
|   |   |-- context/             # AuthContext (JWT state)
|   |   |-- layouts/             # MainLayout & PublicLayout
|   |   |-- pages/               # Student, Admin & Maintenance views
|   |   |-- styles/              # Design system CSS
|   |   |-- App.jsx              # Role-guarded routing
|   |   +-- main.jsx
|   |-- index.html
|   |-- package.json
|   +-- vite.config.js
+-- README.md
```
