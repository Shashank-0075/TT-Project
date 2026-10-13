# CampusFix – Free Production Deployment Guide

This guide provides step-by-step instructions for deploying **CampusFix** completely **FREE ($0.00)** to the cloud without entering credit card information or incurring any cloud hosting charges.

---

## 1. Cloud Architecture Overview

| Component | Cloud Provider | Free Tier Specification | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend** | [Render](https://render.com) (Static Site) | 100 GB bandwidth/month, Global CDN, SSL | **$0.00** |
| **Backend** | [Render](https://render.com) (Web Service) | 512 MB RAM, 0.1 CPU, Native Java / Maven | **$0.00** |
| **Database** | [TiDB Cloud](https://tidbcloud.com) (Serverless) | 5 GiB Storage, 50M Request Units/mo (MySQL 8.0) | **$0.00** |
| **Image Storage** | [Cloudinary](https://cloudinary.com) | 25 GB Storage & Bandwidth / 25 Monthly Credits | **$0.00** |

---

## 2. Step 1: Set Up Free Cloud Database (TiDB Cloud)

1. Sign up for free at [tidbcloud.com](https://tidbcloud.com) (No credit card required).
2. Click **Create Cluster** &rarr; select **Serverless** (Free forever).
3. Choose the region closest to your users (e.g. `Singapore (ap-southeast-1)` or `US East`).
4. Once the cluster is created:
   - Click **Connect** &rarr; select **Connect with General Client** or **Web SQL Editor**.
   - Note down:
     - **Host** (e.g., `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
     - **Port** (usually `4000`)
     - **User** (e.g., `xxxxxx.root`)
     - **Password** (generated during creation)
5. Open the **SQL Editor** in TiDB Cloud web console:
   - Run the schema DDL from [`database/schema.sql`](file:///d:/Smart%20College%20Complaint%20and%20Maintenance%20Management%20System/database/schema.sql):
     ```sql
     USE campusfix;
     -- (Paste contents of database/schema.sql)
     ```
   - Insert the default roles:
     ```sql
     INSERT INTO roles (id, name) VALUES
         (1, 'STUDENT_STAFF'),
         (2, 'ADMIN'),
         (3, 'MAINTENANCE'),
         (4, 'STUDENT'),
         (5, 'STAFF');
     ```
   - Insert standard categories & locations (from the top of `database/seed.sql`).
   - Create your primary production Administrator user:
     ```sql
     -- Use BCrypt hash generator to create your strong password
     INSERT INTO users (full_name, email, password, phone, department, role_id, active, created_at, updated_at)
     VALUES ('CampusFix Admin', 'admin@yourcollege.edu', '$2a$10$9/QMGHlpIfLoZva0HCT2iOWZ01BOfEbN/rssusr72rQq3N4lApDQW', '9876543210', 'IT Administration', 2, TRUE, NOW(), NOW());
     ```
   - *(Note: Do NOT load demo student/complaint seed data into production).*

---

## 3. Step 2: Set Up Free Image Storage (Cloudinary)

1. Sign up for free at [cloudinary.com](https://cloudinary.com) (No credit card required).
2. Go to your **Dashboard**.
3. Copy the following credentials:
   - **Cloud Name** (e.g., `dxyabc123`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `AbCdEfGhIjKlMnOpQrStUvWxYz`)

---

## 4. Step 3: Deploy Backend to Render (Web Service)

1. Sign up at [render.com](https://render.com) using your GitHub account.
2. In the Render Dashboard, click **New +** &rarr; **Web Service**.
3. Select your GitHub repository: `Shashank-0075/TT-Project`.
4. Configure the Web Service settings:
   - **Name:** `campusfix-backend`
   - **Region:** Closest region to TiDB (e.g., Singapore or Oregon).
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Java`
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/campusfix-backend-1.0.0.jar`
   - **Instance Type:** `Free` (512 MB RAM)
5. Scroll down to **Environment Variables** and add the following keys:

| Environment Variable | Value Example | Description |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/campusfix?sslMode=VERIFY_IDENTITY` | TiDB Cloud JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `xxxxxx.root` | TiDB Database Username |
| `SPRING_DATASOURCE_PASSWORD` | `your-secure-tidb-password` | TiDB Database Password |
| `JWT_SECRET` | `MySecretSigningKeyWithMoreThan32CharactersLengthForCampusFix1234` | Minimum 32-character secret |
| `JWT_EXPIRATION` | `86400000` | 24 Hours in milliseconds |
| `CLOUDINARY_CLOUD_NAME` | `your_cloudinary_cloud_name` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | `your_cloudinary_api_key` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `your_cloudinary_api_secret` | Cloudinary API Secret |
| `CORS_ALLOWED_ORIGINS` | `https://campusfix-frontend.onrender.com,http://localhost:5173` | Allowed Frontend Domains |
| `DDL_AUTO` | `validate` | Validates tables without dropping |

6. Click **Create Web Service**. Render will clone, build with Maven, and start your backend.
7. Once deployed, copy your backend URL (e.g., `https://campusfix-backend.onrender.com`).

---

## 5. Step 4: Deploy Frontend to Render (Static Site)

1. In the Render Dashboard, click **New +** &rarr; **Static Site**.
2. Select your GitHub repository: `Shashank-0075/TT-Project`.
3. Configure the Static Site settings:
   - **Name:** `campusfix-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://campusfix-backend.onrender.com/api` *(use your actual backend URL from Step 3)*
5. Click **Create Static Site**.
6. Render will install dependencies, compile with Vite, and serve the site.
7. React Router single-page navigation is automatically preserved by the committed [`frontend/public/_redirects`](file:///d:/Smart%20College%20Complaint%20and%20Maintenance%20Management%20System/frontend/public/_redirects) file.

---

## 6. Understanding Free Tier Sleep Behavior & Escalation Scheduler

- **Render Web Service Inactivity Spin-Down:**
  On Render's free tier, the backend web service spins down after 15 minutes of zero traffic.
  - The first HTTP request after sleep will take ~40–50 seconds to boot up (Cold Start).
  - Subsequent requests respond in normal millisecond latency.
- **Priority Escalation Behavior:**
  - The `@Scheduled` escalation check runs while the application is active.
  - To guarantee tickets are escalated even if the application slept overnight, administrators can click the **"Trigger Escalation Scan"** button located on the **Admin Dashboard** (`POST /api/admin/escalation/run`).
  - Alternatively, free external pingers (such as UptimeRobot or Cron-Job.org) can send a lightweight GET request every 14 minutes to keep the backend warm for Viva presentations.

---

## 7. Post-Deployment Verification Checklist

- [ ] Visit frontend URL: `https://campusfix-frontend.onrender.com`.
- [ ] Register a new student account at `/register`. Verify account is created as `STUDENT`.
- [ ] Log in as the student and submit a complaint with a photo. Verify photo uploads to Cloudinary.
- [ ] Log in as Admin and verify the complaint displays on the Admin Dashboard with photo visible.
- [ ] Attempt IDOR: Verify that a student cannot view another student's complaint by ID.
- [ ] Test status progression: Move complaint from `PENDING` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`.
