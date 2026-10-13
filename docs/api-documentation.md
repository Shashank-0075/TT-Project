# CampusFix – RESTful API Specification

Base URL: `http://localhost:8080/api`  
Authentication: HTTP Bearer Token (`Authorization: Bearer <jwt_token>`)  
Payload Format: `application/json` (unless multipart upload is specified)

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method / Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "fullName": "Priya Patel",
    "email": "priya@campusfix.edu",
    "password": "Password@123",
    "phone": "9876543210",
    "department": "Information Technology",
    "role": "STUDENT" 
  }
  ```
  *(Note: `role` can be `"STUDENT"` or `"STAFF"`. Defaults to `STUDENT` if omitted).*
- **Response (`201 Created`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": 10,
      "fullName": "Priya Patel",
      "email": "priya@campusfix.edu",
      "role": "STUDENT"
    }
  }
  ```

### 1.2 Login
- **Method / Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "student1@campusfix.edu",
    "password": "Student@123"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": 4,
      "fullName": "Rahul Sharma",
      "email": "student1@campusfix.edu",
      "role": "STUDENT_STAFF"
    }
  }
  ```

### 1.3 Current User Info
- **Method / Endpoint:** `GET /api/auth/me`
- **Access:** Any authenticated user
- **Response (`200 OK`):** Returns authenticated user profile details.

---

## 2. Complaint Endpoints (Student / Faculty & Staff)

### 2.1 Submit New Complaint
- **Method / Endpoint:** `POST /api/complaints`
- **Access:** `STUDENT`, `STAFF`, or `STUDENT_STAFF`
- **Content-Type:** `multipart/form-data`
- **Form Parameters:**
  - `title` (string, 3–150 chars)
  - `description` (string, 10–3000 chars)
  - `categoryId` (long)
  - `locationId` (long)
  - `priority` (string: `LOW`, `MEDIUM`, `HIGH`)
  - `image` (file, optional, JPG/PNG/WEBP <= 5MB)
- **Response (`201 Created`):** Full complaint details object.

### 2.2 Get My Complaints
- **Method / Endpoint:** `GET /api/complaints/my`
- **Access:** `STUDENT`, `STAFF`, or `STUDENT_STAFF`
- **Query Params:** `page`, `size`, `status`, `priority`, `search`, `sortBy`, `sortDir`
- **Response (`200 OK`):** `PageResponse<ComplaintSummaryResponse>`

### 2.3 Get My Activity History
- **Method / Endpoint:** `GET /api/complaints/my/history`
- **Access:** `STUDENT`, `STAFF`, or `STUDENT_STAFF`
- **Response (`200 OK`):** `PageResponse<StatusHistoryResponse>`

### 2.4 Get User Dashboard Statistics
- **Method / Endpoint:** `GET /api/complaints/my/dashboard`
- **Access:** `STUDENT`, `STAFF`, or `STUDENT_STAFF`
- **Response (`200 OK`):**
  ```json
  {
    "total": 5,
    "pending": 3,
    "inProgress": 2,
    "resolved": 0,
    "highPriority": 2,
    "escalated": 2,
    "byCategory": [...],
    "byStatus": [...],
    "byPriority": [...],
    "byLocation": [...],
    "monthlyTrend": [...]
  }
  ```

### 2.5 Get Complaint Details
- **Method / Endpoint:** `GET /api/complaints/{id}`
- **Access:** Owner (`STUDENT`, `STAFF`, `STUDENT_STAFF`), or `ADMIN`, or `MAINTENANCE`
- **Response (`200 OK`):** Detailed complaint response with history logs, resolution info, and escalation details.

### 2.6 Edit Pending Complaint
- **Method / Endpoint:** `PUT /api/complaints/{id}`
- **Access:** Owner (`STUDENT`, `STAFF`, `STUDENT_STAFF`) while status is `PENDING`
- **Request Body:** `{ "title": "...", "description": "...", "categoryId": 1, "locationId": 2, "priority": "MEDIUM" }`

---

## 3. Maintenance Endpoints

### 3.1 Maintenance Dashboard
- **Method / Endpoint:** `GET /api/maintenance/dashboard`
- **Access:** `MAINTENANCE`, `ADMIN`
- **Response (`200 OK`):** Global campus metrics and chart aggregations.

### 3.2 View Available Complaints Queue
- **Method / Endpoint:** `GET /api/maintenance/complaints`
- **Access:** `MAINTENANCE`, `ADMIN`
- **Query Params:** `status`, `priority`, `categoryId`, `locationId`, `search`, `unresolvedOnly`, `page`, `size`
- **Response (`200 OK`):** `PageResponse<ComplaintSummaryResponse>`

### 3.3 Start Work (`PENDING` -> `IN_PROGRESS`)
- **Method / Endpoint:** `PUT /api/maintenance/complaints/{id}/status`
- **Access:** `MAINTENANCE`, `ADMIN`
- **Request Body:**
  ```json
  {
    "status": "IN_PROGRESS",
    "remarks": "Assigned to electric maintenance crew; multimeter diagnostic underway."
  }
  ```
- **Response (`200 OK`):** Updated complaint detail object.

### 3.4 Add Progress Note
- **Method / Endpoint:** `POST /api/maintenance/complaints/{id}/progress`
- **Access:** `MAINTENANCE`, `ADMIN`
- **Request Body:**
  ```json
  {
    "remarks": "Replacement power relay ordered from central depot."
  }
  ```

### 3.5 Resolve Complaint (`IN_PROGRESS` -> `RESOLVED`)
- **Method / Endpoint:** `POST /api/maintenance/complaints/{id}/resolve`
- **Access:** `MAINTENANCE`, `ADMIN`
- **Content-Type:** `multipart/form-data`
- **Form Parameters:**
  - `remarks` (string, required, 5–2000 chars)
  - `proofImage` (file, optional, JPG/PNG/WEBP <= 5MB)
- **Response (`200 OK`):** Resolved complaint detail object.

### 3.6 Completed Resolution History
- **Method / Endpoint:** `GET /api/maintenance/resolutions`
- **Access:** `MAINTENANCE`, `ADMIN`
- **Query Params:** `search`, `page`, `size`
- **Response (`200 OK`):** `PageResponse<ResolutionResponse>`

---

## 4. Admin Management Endpoints

### 4.1 Admin Dashboard Analytics
- **Method / Endpoint:** `GET /api/admin/dashboard`
- **Access:** `ADMIN`

### 4.2 All Complaints Directory
- **Method / Endpoint:** `GET /api/admin/complaints`
- **Access:** `ADMIN`

### 4.3 Escalated Complaints Directory
- **Method / Endpoint:** `GET /api/admin/complaints/escalated`
- **Access:** `ADMIN`

### 4.4 Get Escalation Configuration
- **Method / Endpoint:** `GET /api/admin/escalation-config`
- **Access:** `ADMIN`
- **Response (`200 OK`):**
  ```json
  {
    "lowToMediumDays": 3,
    "mediumToHighDays": 4,
    "enabled": true,
    "updatedAt": "2026-10-06T12:00:00",
    "updatedByName": "Dr. Rajesh Kumar"
  }
  ```

### 4.5 Update Escalation Configuration
- **Method / Endpoint:** `PUT /api/admin/escalation-config`
- **Access:** `ADMIN`
- **Request Body:**
  ```json
  {
    "lowToMediumDays": 2,
    "mediumToHighDays": 3,
    "enabled": true
  }
  ```

### 4.6 Trigger On-Demand Escalation Scan
- **Method / Endpoint:** `POST /api/admin/escalation/run`
- **Access:** `ADMIN`
- **Response (`200 OK`):**
  ```json
  {
    "message": "Escalation check completed. 2 priority increase(s) applied."
  }
  ```

### 4.7 User Account Management
- `GET /api/admin/users`: Search and filter users by keyword, role, or active status.
- `POST /api/admin/users`: Create new user credentials.
- `PUT /api/admin/users/{id}`: Update user profile, role, or active status.

---

## 5. Master Data Endpoints (Categories & Locations)

- `GET /api/categories?includeInactive={bool}`: List complaint categories.
- `POST /api/categories`: Create category (`ADMIN` only).
- `PUT /api/categories/{id}`: Update category (`ADMIN` only).
- `DELETE /api/categories/{id}`: Delete category if unreferenced (`ADMIN` only).
- `GET /api/locations?includeInactive={bool}`: List campus locations.
- `POST /api/locations`: Create location (`ADMIN` only).
- `PUT /api/locations/{id}`: Update location (`ADMIN` only).
- `DELETE /api/locations/{id}`: Delete location if unreferenced (`ADMIN` only).

---

## 6. Protected File Streaming Endpoint

- **Method / Endpoint:** `GET /api/files/{folder}/{filename}`
- **Access:** Authenticated user with permission to view the complaint or resolution photo.
- **Response:** Raw binary image stream (`image/jpeg`, `image/png`, or `image/webp`).
