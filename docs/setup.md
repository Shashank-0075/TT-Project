# CampusFix – Setup, Deployment & Troubleshooting Guide

This guide walks you through setting up and running **CampusFix** in both development and production environments, including Spring Tool Suite (STS) configuration.

---

## 1. System Requirements

- **Operating System:** Windows 10/11, macOS, or Ubuntu Linux
- **Java:** JDK 17, 21, or 25 (Standard Oracle OpenJDK or Eclipse Temurin)
- **Maven:** Version 3.8 or 3.9+
- **Node.js:** v18.0.0 or higher (with npm 9+)
- **Database:** MySQL Server 8.0+ running on port 3306

---

## 2. Database Initialization

1. Start your local MySQL service:
   - **Windows:** Ensure the MySQL service is Running via Services (`services.msc`).
   - **Linux / macOS:** `sudo systemctl start mysql` or `brew services start mysql`.
2. Connect to the MySQL shell:
   ```bash
   mysql -u root -p
   ```
3. Load the schema DDL:
   ```sql
   source d:/Smart College Complaint and Maintenance Management System/database/schema.sql;
   ```
4. Load seed dataset (demo users, complaints, resolutions):
   ```sql
   source d:/Smart College Complaint and Maintenance Management System/database/seed.sql;
   ```
5. Confirm row counts:
   ```sql
   USE campusfix;
   SELECT 'users' AS tbl, COUNT(*) FROM users
   UNION ALL
   SELECT 'complaints', COUNT(*) FROM complaints;
   ```
   *(Expected: 7 users, 18 complaints)*

---

## 3. Backend Setup

### Option A: Running with Maven CLI
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```
2. Verify database settings in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/campusfix?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=root
   ```
3. Start the application:
   ```bash
   mvn spring-boot:run
   ```
4. Or build and launch the executable JAR:
   ```bash
   mvn clean package -DskipTests
   java -jar target/campusfix-backend-1.0.0.jar
   ```

### Option B: Importing into Spring Tool Suite (STS) / Eclipse
1. Launch **Spring Tool Suite (STS)**.
2. Select **File &rarr; Import... &rarr; Maven &rarr; Existing Maven Projects**.
3. Browse to the root folder: `d:\Smart College Complaint and Maintenance Management System\backend`.
4. Check `pom.xml` and click **Finish**.
5. Wait for STS to download Maven dependencies.
6. Right-click the project &rarr; **Run As &rarr; Spring Boot App**.
7. Observe the STS Console output:
   ```text
   Tomcat started on port 8080 (http) with context path '/'
   Started CampusFixApplication in X.XXX seconds
   ```

---

## 4. Frontend Setup

1. Open a new terminal in `frontend/`:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Verify environment configuration in `frontend/.env`:
   ```properties
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your web browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 5. Production Build & Verification

To verify the production build of both projects:

### 1. Build Backend
```bash
cd backend
mvn clean package
```
*Executes all unit and integration tests and produces `target/campusfix-backend-1.0.0.jar`.*

### 2. Build Frontend
```bash
cd frontend
npm run build
```
*Generates minified static bundles in `frontend/dist/`.*

---

## 6. Troubleshooting Common Issues

### Issue 1: `Access denied for user 'root'@'localhost'`
- **Fix:** Your MySQL root password differs from the default `root`. Update `spring.datasource.password` in `backend/src/main/resources/application.properties` to match your local password.

### Issue 2: `Port 8080 is already in use`
- **Fix (Windows):** Run in PowerShell:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
  ```
- **Fix (Linux/macOS):** `lsof -ti:8080 | xargs kill -9`

### Issue 3: CORS errors in browser console
- **Fix:** CampusFix configures CORS in `backend/src/main/java/com/campusfix/config/SecurityConfig.java` to permit origins `http://localhost:5173`, `http://localhost:3000`, and `http://127.0.0.1:5173`. Ensure your browser URL matches these allowed origins.

### Issue 4: `MaxUploadSizeExceededException`
- **Fix:** The application limits uploads to 5 MB per file. Photos must be compressed if taken directly with high-resolution mobile cameras.
