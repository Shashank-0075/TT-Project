-- =====================================================================
-- CampusFix - Smart College Complaint and Maintenance Management System
-- MySQL 8.0 schema
--
-- Run:  mysql -u root -p < database/schema.sql
-- WARNING: this script DROPS and re-creates the "campusfix" database.
--          Use it only for first-time setup or to reset local demo data.
-- =====================================================================

DROP DATABASE IF EXISTS campusfix;
CREATE DATABASE campusfix
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE campusfix;

-- ---------------------------------------------------------------------
-- ROLES : STUDENT_STAFF, ADMIN, MAINTENANCE
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id   BIGINT       NOT NULL AUTO_INCREMENT,
    name VARCHAR(30)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_roles_name UNIQUE (name),
    CONSTRAINT ck_roles_name CHECK (name IN ('STUDENT_STAFF', 'STUDENT', 'STAFF', 'ADMIN', 'MAINTENANCE'))
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- USERS : one row per person who can log in. Passwords are BCrypt hashes.
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    password    VARCHAR(100) NOT NULL,
    phone       VARCHAR(20)  NULL,
    department  VARCHAR(100) NULL,
    role_id     BIGINT       NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id),
    INDEX idx_users_role (role_id)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- CATEGORIES and LOCATIONS : master data managed by the admin
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT uk_categories_name UNIQUE (name)
) ENGINE = InnoDB;

CREATE TABLE locations (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    CONSTRAINT uk_locations_name UNIQUE (name)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- COMPLAINTS : the central table
--   priority_updated_at = moment the current priority started to apply.
--                         The escalation scheduler measures time from here.
--   escalation_*        = summary of the latest automatic escalation
--                         (full history is in escalation_logs)
-- ---------------------------------------------------------------------
CREATE TABLE complaints (
    id                  BIGINT        NOT NULL AUTO_INCREMENT,
    title               VARCHAR(150)  NOT NULL,
    description         VARCHAR(2000) NOT NULL,
    category_id         BIGINT        NOT NULL,
    location_id         BIGINT        NOT NULL,
    priority            VARCHAR(10)   NOT NULL,
    status              VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    submitted_by        BIGINT        NOT NULL,
    image_path          VARCHAR(255)  NULL,
    created_at          DATETIME(6)   NOT NULL,
    updated_at          DATETIME(6)   NOT NULL,
    resolved_at         DATETIME(6)   NULL,
    priority_updated_at DATETIME(6)   NOT NULL,
    escalation_count    INT           NOT NULL DEFAULT 0,
    last_escalated_at   DATETIME(6)   NULL,
    escalation_reason   VARCHAR(500)  NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_complaints_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_complaints_location FOREIGN KEY (location_id) REFERENCES locations (id),
    CONSTRAINT fk_complaints_user     FOREIGN KEY (submitted_by) REFERENCES users (id),
    CONSTRAINT ck_complaints_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT ck_complaints_status   CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
    INDEX idx_complaints_status     (status),
    INDEX idx_complaints_priority   (priority),
    INDEX idx_complaints_created_at (created_at),
    INDEX idx_complaints_user       (submitted_by),
    INDEX idx_complaints_category   (category_id),
    INDEX idx_complaints_location   (location_id),
    INDEX idx_complaints_escalation (status, priority, priority_updated_at)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- COMPLAINT_STATUS_HISTORY : every status change / progress note.
--   changed_by is NULL when the system itself made the change.
--   old_status is NULL for the first row (complaint submitted).
-- ---------------------------------------------------------------------
CREATE TABLE complaint_status_history (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    complaint_id BIGINT        NOT NULL,
    old_status   VARCHAR(20)   NULL,
    new_status   VARCHAR(20)   NOT NULL,
    changed_by   BIGINT        NULL,
    remarks      VARCHAR(1000) NULL,
    changed_at   DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user      FOREIGN KEY (changed_by)   REFERENCES users (id),
    INDEX idx_history_complaint (complaint_id, changed_at)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- RESOLUTIONS : maintenance details when a complaint is resolved
--   (one resolution per complaint). Proof image is stored on disk, only
--   its relative path is saved here.
-- ---------------------------------------------------------------------
CREATE TABLE resolutions (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    complaint_id     BIGINT        NOT NULL,
    remarks          VARCHAR(2000) NOT NULL,
    proof_image_path VARCHAR(255)  NULL,
    resolved_by      BIGINT        NOT NULL,
    resolved_at      DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_resolutions_complaint UNIQUE (complaint_id),
    CONSTRAINT fk_resolutions_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_resolutions_user      FOREIGN KEY (resolved_by)  REFERENCES users (id)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- ESCALATION_LOGS : one row for every automatic priority increase
-- ---------------------------------------------------------------------
CREATE TABLE escalation_logs (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    complaint_id  BIGINT       NOT NULL,
    from_priority VARCHAR(10)  NOT NULL,
    to_priority   VARCHAR(10)  NOT NULL,
    reason        VARCHAR(500) NOT NULL,
    escalated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_escalation_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    INDEX idx_escalation_complaint (complaint_id, escalated_at)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- ESCALATION_CONFIG : a single row holding the configurable thresholds
-- ---------------------------------------------------------------------
CREATE TABLE escalation_config (
    id                    BIGINT      NOT NULL AUTO_INCREMENT,
    low_to_medium_days    INT         NOT NULL,
    medium_to_high_days   INT         NOT NULL,
    enabled               BOOLEAN     NOT NULL DEFAULT TRUE,
    updated_at            DATETIME(6) NOT NULL,
    updated_by            BIGINT      NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_escalation_config_user FOREIGN KEY (updated_by) REFERENCES users (id),
    CONSTRAINT ck_escalation_low  CHECK (low_to_medium_days  >= 1),
    CONSTRAINT ck_escalation_high CHECK (medium_to_high_days >= 1)
) ENGINE = InnoDB;
