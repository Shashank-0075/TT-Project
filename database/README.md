# CampusFix Database Architecture & Data Dictionary

This document details the relational database design, table schemas, entity relationships, constraints, and seed data for the **CampusFix – Smart College Complaint and Maintenance Management System**.

---

## 1. Relational Database Overview

- **Engine:** MySQL 8.0 (InnoDB Storage Engine)
- **Character Set / Collation:** `utf8mb4` / `utf8mb4_unicode_ci` (Full Unicode support for emojis, special characters, and international names)
- **Normalization Level:** Third Normal Form (3NF)
- **Integrity:** Declarative Foreign Keys with `ON DELETE RESTRICT` on master lookups and `ON DELETE CASCADE` on transient logs.

---

## 2. Entity-Relationship Diagram (ERD)

```text
       +-------------+
       |    ROLES    |
       +------+------+
              | 1
              |
              | *
       +------+------+             +--------------+             +--------------+
       |    USERS    |             |  CATEGORIES  |             |  LOCATIONS   |
       +------+------+             +------+-------+             +------+-------+
              | 1                         | 1                          | 1
              |                           |                            |
              | *                         | *                          | *
       +------+---------------------------+----------------------------+-------+
       |                              COMPLAINTS                               |
       +------+---------------------------+----------------------------+-------+
              | 1                         | 1                          | 1
              |                           |                            |
              | *                         | 1                          | *
+-------------+--------------+     +------+-------+             +------+-------+
|  COMPLAINT_STATUS_HISTORY  |     | RESOLUTIONS  |             |ESCALATION_LOGS|
+----------------------------+     +--------------+             +--------------+

                             +-------------------+
                             | ESCALATION_CONFIG |
                             +-------------------+
```

---

## 3. Data Dictionary

### Table 1: `roles`
Stores application user authority levels.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique role ID |
| `name` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Role identifier (`STUDENT`, `STAFF`, `STUDENT_STAFF`, `ADMIN`, `MAINTENANCE`) |
| `description` | `VARCHAR(255)` | `NULL` | Human-readable description |

---

### Table 2: `users`
Registered student, staff, admin, and maintenance accounts.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique user ID |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | User full name |
| `email` | `VARCHAR(150)` | `NOT NULL, UNIQUE` | University email login |
| `password` | `VARCHAR(255)` | `NOT NULL` | BCrypt salted hash (strength 12) |
| `phone` | `VARCHAR(20)` | `NULL` | Contact phone number |
| `department` | `VARCHAR(100)` | `NULL` | Academic or administrative department |
| `role_id` | `BIGINT` | `NOT NULL, FK -> roles(id)` | User role reference |
| `active` | `TINYINT(1)` | `NOT NULL, DEFAULT 1` | 1 = Active, 0 = Disabled |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Registration timestamp |
| `updated_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Last update timestamp |

---

### Table 3: `categories`
Classifications of maintenance issues.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique category ID |
| `name` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | Category title (Electrical, Wi-Fi, etc.) |
| `description` | `VARCHAR(255)` | `NULL` | Details of issues covered |
| `active` | `TINYINT(1)` | `NOT NULL, DEFAULT 1` | Whether active in complaint dropdown |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Update timestamp |

---

### Table 4: `locations`
Campus facilities, academic blocks, labs, and hostel rooms.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique location ID |
| `name` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | Location identifier |
| `description` | `VARCHAR(255)` | `NULL` | Landmarks or directions |
| `active` | `TINYINT(1)` | `NOT NULL, DEFAULT 1` | Whether active for new complaints |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Update timestamp |

---

### Table 5: `complaints`
Primary complaint work order entity.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique complaint tracking ID |
| `title` | `VARCHAR(150)` | `NOT NULL` | Concise issue summary |
| `description` | `TEXT` | `NOT NULL` | Detailed technical description |
| `category_id` | `BIGINT` | `NOT NULL, FK -> categories(id)` | Linked category |
| `location_id` | `BIGINT` | `NOT NULL, FK -> locations(id)` | Linked location |
| `priority` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'LOW'` | `LOW`, `MEDIUM`, or `HIGH` |
| `status` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'PENDING'`| `PENDING`, `IN_PROGRESS`, `RESOLVED` |
| `submitted_by` | `BIGINT` | `NOT NULL, FK -> users(id)` | Submitter reference |
| `image_path` | `VARCHAR(255)` | `NULL` | Relative storage path for attached image |
| `escalation_count`| `INT` | `NOT NULL, DEFAULT 0` | Times priority was auto-escalated |
| `priority_updated_at`|`DATETIME`| `NOT NULL, DEFAULT NOW()`| Timestamp used for calculating SLA elapsed days |
| `last_escalated_at`| `DATETIME`| `NULL` | Last automated bump timestamp |
| `resolved_at` | `DATETIME` | `NULL` | Formal completion timestamp |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Submission timestamp |
| `updated_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Last modification timestamp |

---

### Table 6: `complaint_status_history`
Append-only audit trail capturing every state transition.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique history record ID |
| `complaint_id` | `BIGINT` | `NOT NULL, FK -> complaints(id) ON DELETE CASCADE` | Linked complaint |
| `from_status` | `VARCHAR(20)` | `NULL` | Previous status (`NULL` on initial creation) |
| `to_status` | `VARCHAR(20)` | `NOT NULL` | New status |
| `changed_by` | `BIGINT` | `NOT NULL, FK -> users(id)` | User who executed the change |
| `remarks` | `VARCHAR(1000)`| `NULL` | Context remarks or notes |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | State change timestamp |

---

### Table 7: `resolutions`
Completion closure details submitted by maintenance staff.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique resolution ID |
| `complaint_id` | `BIGINT` | `NOT NULL, UNIQUE, FK -> complaints(id) ON DELETE CASCADE` | One-to-one complaint reference |
| `remarks` | `TEXT` | `NOT NULL` | Technical description of work performed |
| `proof_image_path`| `VARCHAR(255)`| `NULL` | Verification photo path |
| `resolved_by` | `BIGINT` | `NOT NULL, FK -> users(id)` | Maintenance technician ID |
| `resolved_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Resolution timestamp |

---

### Table 8: `escalation_logs`
Immutable audit log recording every automated priority increase.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique log ID |
| `complaint_id` | `BIGINT` | `NOT NULL, FK -> complaints(id) ON DELETE CASCADE` | Escalated complaint reference |
| `old_priority` | `VARCHAR(20)` | `NOT NULL` | Previous priority (`LOW` or `MEDIUM`) |
| `new_priority` | `VARCHAR(20)` | `NOT NULL` | New priority (`MEDIUM` or `HIGH`) |
| `reason` | `VARCHAR(500)` | `NOT NULL` | Threshold explanation string |
| `escalated_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Escalation execution timestamp |

---

### Table 9: `escalation_config`
Global configuration settings for SLA escalation periods.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Singleton ID (row 1) |
| `low_to_medium_days`| `INT` | `NOT NULL, DEFAULT 3` | Overdue days to promote Low &rarr; Medium |
| `medium_to_high_days`| `INT` | `NOT NULL, DEFAULT 4` | Overdue days to promote Medium &rarr; High |
| `enabled` | `TINYINT(1)` | `NOT NULL, DEFAULT 1` | 1 = Scheduler enabled, 0 = Suspended |
| `updated_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | Last configuration update |
| `updated_by` | `BIGINT` | `NULL, FK -> users(id)` | Admin who updated configuration |

---

## 4. Database Setup & Reseed Instructions

To rebuild the database from scratch:

```bash
# 1. Connect to MySQL CLI
mysql -u root -p

# 2. Re-create and load schema
mysql> source d:/Smart College Complaint and Maintenance Management System/database/schema.sql;

# 3. Load realistic seed data
mysql> source d:/Smart College Complaint and Maintenance Management System/database/seed.sql;
```

---

## 5. Seed Accounts & Roles

| Role | Email | Password | Role ID | Dashboard Portal |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@campusfix.edu` | `Admin@123` | 2 | `/admin/dashboard` |
| **MAINTENANCE** | `maintenance1@campusfix.edu` | `Maint@123` | 3 | `/maintenance/dashboard` |
| **MAINTENANCE** | `maintenance2@campusfix.edu` | `Maint@123` | 3 | `/maintenance/dashboard` |
| **STUDENT** | `student1@campusfix.edu` | `Student@123` | 4 | `/student/dashboard` |
| **STUDENT** | `student2@campusfix.edu` | `Student@123` | 4 | `/student/dashboard` |
| **STUDENT** | `student3@campusfix.edu` | `Student@123` | 4 | `/student/dashboard` |
| **STAFF** | `staff1@campusfix.edu` | `Student@123` | 5 | `/staff/dashboard` |

