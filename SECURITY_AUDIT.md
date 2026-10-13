# CampusFix – Security Audit & Vulnerability Assessment Report

**Project Title:** CampusFix – Smart College Complaint and Maintenance Management System  
**Repository Visibility:** PUBLIC (`https://github.com/Shashank-0075/TT-Project`)  
**Audit Date:** 2026-10-13  
**Auditor:** Senior Full-Stack Security & Cloud Deployment Specialist  
**Technology Stack:** React 18 (Vite), Java 17/25, Spring Boot 3.5.16, Spring Security 6, JWT (JJWT), Spring Data JPA, Hibernate 6, MySQL 8.0, Render (Web Service & Static Site)

---

## 1. Executive Summary

A comprehensive source code security audit and public repository exposure analysis were performed on **CampusFix**. The objective is to identify security vulnerabilities, verify secret exposure risks given that the GitHub repository is public, and prepare the project for 100% free production deployment on Render, TiDB Cloud, and Cloudinary.

### Overall Security Status
- **Git History Secrets:** **ZERO LIVE CREDENTIALS COMMITTED.** All committed commits (`a1fed48` and `50796c9`) were thoroughly inspected. No active database passwords, production API keys, or private JWT secrets were committed.
- **Local Secrets Isolation:** Real development secrets are isolated in `backend/.env` and `frontend/.env`, which are properly ignored in `.gitignore` and excluded from git tracking.
- **Critical Code Vulnerabilities:** The two critical vulnerabilities (public registration role escalation and IDOR complaint/image access bypass) were patched and verified with 18 automated unit and integration tests.
- **Free Cloud Deployment Readiness:** The backend uses local disk storage for image uploads (`uploads/`), which is ephemeral on Render's free tier. A dual-mode storage strategy (Local Disk for local development + Cloudinary for cloud deployment) is required to ensure persistent image storage without paying anything.

---

## 2. Vulnerability & Findings Matrix

| Finding ID | Severity | Category | Affected File(s) | Impact / Risk | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **CRITICAL** | Authorization / Escalation | `AuthService.java` | Public registration could accept `ADMIN`/`MAINTENANCE` roles. | **REMEDIATED & VERIFIED** |
| **SEC-02** | **CRITICAL** | Broken Object Level Auth (IDOR) | `ComplaintService.java`, `FileController.java` | Students could view other users' complaints and download attachments. | **REMEDIATED & VERIFIED** |
| **SEC-03** | **HIGH** | Ephemeral File Storage (Free Cloud) | `FileStorageService.java`, Render Free Tier | On Render Free Tier, disks are wiped on deploy/sleep; uploaded complaint images will disappear. | **ACTION REQUIRED (PHASE 6)** |
| **SEC-04** | **MEDIUM** | CORS Configuration for Cloud | `application.properties`, `SecurityConfig.java` | CORS origins currently only allow `localhost:5173`. When deployed to Render, the frontend domain must be allowed dynamically. | **ACTION REQUIRED (PHASE 3)** |
| **SEC-05** | **LOW** | Database DDL Auto-Mode | `application.properties` | `spring.jpa.hibernate.ddl-auto=validate` requires manual execution of `schema.sql`. Need seamless cloud initialization guidance. | **DOCUMENTED (PHASE 7)** |
| **SEC-06** | **LOW** | Seed Data Public Exposure | `database/seed.sql` | Demo credentials (`Admin@123`, `Maint@123`, `Student@123`) are public in repository. | **DOCUMENTED (DO NOT USE IN PROD)** |

---

## 3. Public GitHub Repository Secret Audit

Because the GitHub repository is public, git commits, blobs, and history were audited:

### 3.1 Audited Items
1. **Commit History (`git log --stat`, `git log -S`)**:
   - Commit `a1fed48` (checkpoint: pre-audit baseline snapshot): Analyzed. Only `.env.example` files with safe placeholders (`change-me`, `replace-this-with-a-long-random-secret-of-32-plus-chars`) were committed.
   - Commit `50796c9` (security fixes & zip export hardening): Analyzed. Only test files and code logic changes committed.
2. **Current Tracked Files (`git ls-files`)**:
   - `backend/.env` is NOT tracked.
   - `frontend/.env` is NOT tracked.
   - `*.env.local` is NOT tracked.
   - `uploads/` directory is NOT tracked.
3. **Properties Files (`application.properties`)**:
   - All sensitive properties (`spring.datasource.password`, `campusfix.jwt.secret`) utilize environment variable placeholders: `${DATABASE_PASSWORD}`, `${JWT_SECRET}`. No hardcoded production passwords exist in `application.properties`.
4. **Seed Database (`database/seed.sql`)**:
   - Contains hashed passwords for demo accounts (`admin@campusfix.edu`, etc.).
   - **Recommendation:** Production deployments must NEVER load `seed.sql` with demo accounts. Instead, load only `schema.sql` and insert one dedicated administrator account with a unique, secure password.

---

## 4. Free Deployment Strategy & Service Verification

To ensure **zero costs ($0.00)** and preserve all functionality:

### 4.1 Frontend: Render Static Site (100% Free)
- **Service Type:** Static Site (Free tier, unlimited bandwidth within fair use).
- **Build Command:** `npm run build` (inside `frontend`).
- **Publish Directory:** `frontend/dist`.
- **SPA Routing:** Requires a rewrite rule (`/* -> /index.html`) so React Router routes do not 404 on refresh.
- **Environment Variables:** `VITE_API_BASE_URL=https://<your-render-backend-url>/api`.

### 4.2 Backend: Render Web Service (100% Free)
- **Service Type:** Web Service (Free tier, 512 MB RAM, 0.1 CPU).
- **Environment:** Java / Docker / Native Maven.
- **Port Handling:** Render dynamically sets `$PORT`. `server.port=${PORT:8080}` ensures seamless binding.
- **Free Tier Sleep Behavior:** Render free web services spin down after 15 minutes of inactivity. First request takes ~50s to cold start.
  - *Impact on Escalation Scheduler:* The `@Scheduled` escalation check runs while the service is awake. In addition, CampusFix already provides the manual "Trigger Escalation Scan" button in the Admin Dashboard (`POST /api/admin/escalation/run`), ensuring complaints can be escalated anytime on demand even if the service was asleep.

### 4.3 Database: TiDB Cloud Serverless (100% Free, MySQL 8.0 Compatible)
- **Free Tier:** 5 GiB storage, 50 million Request Units/month free forever.
- **No Credit Card Required** for the free Serverless tier.
- **Compatibility:** 100% MySQL 8.0 wire protocol, supports JDBC, Hibernate, HikariCP, and SSL (`useSSL=true`).

### 4.4 Image Storage: Cloudinary (100% Free Tier)
- **Free Tier:** 25 Monthly Credits (~25,000 transformations or 25 GB storage and bandwidth).
- **No Credit Card Required.**
- **Integration Approach:** Support Cloudinary for cloud deployments while preserving local disk storage for local testing when Cloudinary environment variables are absent.

---

## 5. Next Implementation Steps (Phases 3 – 10)

1. **Configuration Hardening (Phase 3):**
   - Update `application.properties` to support Render's `$PORT`, TiDB Cloud connection flags, dynamic CORS origins, and optional Cloudinary credentials.
   - Update `frontend/vite.config.js` and `_redirects` for Render single-page application routing.
2. **Git & Environment Hardening (Phase 4):**
   - Verify `.gitignore` covers all generated and local files.
3. **Cloudinary Integration (Phase 6):**
   - Add Cloudinary Java SDK dependency to `backend/pom.xml`.
   - Update `FileStorageService.java` to dynamically store files to Cloudinary if configured, preserving local storage as fallback.
4. **Verification & Builds (Phase 9):**
   - Run backend `mvn test` and frontend `npm run build`.
5. **Deployment Guide (Phase 10):**
   - Create comprehensive `DEPLOYMENT.md` with step-by-step instructions.
