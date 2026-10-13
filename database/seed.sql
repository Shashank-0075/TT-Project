-- =====================================================================
-- CampusFix - demo / seed data (MySQL 8.0)
--
-- Run AFTER schema.sql:   mysql -u root -p campusfix < database/seed.sql
--
-- DEMO ACCOUNTS (for local development only - change them before real use!)
--   admin@campusfix.edu          / Admin@123     (ADMIN - System Administrator)
--   maintenance1@campusfix.edu   / Maint@123     (MAINTENANCE - Field Staff)
--   maintenance2@campusfix.edu   / Maint@123     (MAINTENANCE - Field Staff)
--   student1@campusfix.edu       / Student@123   (STUDENT - Student Portal)
--   student2@campusfix.edu       / Student@123   (STUDENT - Student Portal)
--   student3@campusfix.edu       / Student@123   (STUDENT - Student Portal)
--   staff1@campusfix.edu         / Student@123   (STAFF - Faculty/Staff Portal)
--
-- Passwords are stored as BCrypt hashes, never as plain text.
-- All complaint dates are relative to the moment this script runs (NOW()),
-- so the demo always looks "fresh".
-- =====================================================================

USE campusfix;

SET @now = NOW();

-- ---------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------
INSERT INTO roles (id, name) VALUES
    (1, 'STUDENT_STAFF'),
    (2, 'ADMIN'),
    (3, 'MAINTENANCE'),
    (4, 'STUDENT'),
    (5, 'STAFF');

-- ---------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------
INSERT INTO users (id, full_name, email, password, phone, department, role_id, active, created_at, updated_at) VALUES
    (1, 'Dr. Rajesh Kumar',  'admin@campusfix.edu',        '$2a$10$9/QMGHlpIfLoZva0HCT2iOWZ01BOfEbN/rssusr72rQq3N4lApDQW', '9876500001', 'Administration',                  2, TRUE, DATE_SUB(@now, INTERVAL 120 DAY), @now),
    (2, 'Suresh Patil',      'maintenance1@campusfix.edu', '$2a$10$C2aKiTtt52YYRqrcpOg/TeVWV7.TbJTiDGtPvnCF.II.0ARYlpH0.', '9876500002', 'Maintenance - Electrical',      3, TRUE, DATE_SUB(@now, INTERVAL 110 DAY), @now),
    (3, 'Anita Verma',       'maintenance2@campusfix.edu', '$2a$10$C2aKiTtt52YYRqrcpOg/TeVWV7.TbJTiDGtPvnCF.II.0ARYlpH0.', '9876500003', 'Maintenance - Civil & Plumbing', 3, TRUE, DATE_SUB(@now, INTERVAL 110 DAY), @now),
    (4, 'Rahul Sharma',      'student1@campusfix.edu',     '$2a$10$fUMOf7CeXYtQrm5ImutwWej1Z1Z7eoZxhIwClj.KkkXgOWVPCYnxm', '9876500004', 'Computer Science Engineering', 4, TRUE, DATE_SUB(@now, INTERVAL 100 DAY), @now),
    (5, 'Priya Nair',        'student2@campusfix.edu',     '$2a$10$fUMOf7CeXYtQrm5ImutwWej1Z1Z7eoZxhIwClj.KkkXgOWVPCYnxm', '9876500005', 'Electronics & Communication', 4, TRUE, DATE_SUB(@now, INTERVAL 100 DAY), @now),
    (6, 'Arjun Mehta',       'student3@campusfix.edu',     '$2a$10$fUMOf7CeXYtQrm5ImutwWej1Z1Z7eoZxhIwClj.KkkXgOWVPCYnxm', '9876500006', 'Mechanical Engineering',      4, TRUE, DATE_SUB(@now, INTERVAL 100 DAY), @now),
    (7, 'Prof. Meena Iyer',  'staff1@campusfix.edu',       '$2a$10$fUMOf7CeXYtQrm5ImutwWej1Z1Z7eoZxhIwClj.KkkXgOWVPCYnxm', '9876500007', 'Computer Science Engineering', 5, TRUE, DATE_SUB(@now, INTERVAL 100 DAY), @now);

-- ---------------------------------------------------------------------
-- Categories and locations
-- ---------------------------------------------------------------------
INSERT INTO categories (id, name, description, active) VALUES
    (1,  'Electrical',            'Lights, fans, power supply, wiring and switches',          TRUE),
    (2,  'Plumbing',              'Water leakage, taps, pipes and drainage',                  TRUE),
    (3,  'Wi-Fi / Network',       'Wi-Fi, LAN, routers and internet connectivity',            TRUE),
    (4,  'Classroom Equipment',   'Projectors, smart boards, speakers and podiums',           TRUE),
    (5,  'Furniture',             'Benches, desks, chairs, doors and cupboards',              TRUE),
    (6,  'Cleaning / Sanitation', 'Washrooms, dustbins, corridors and general cleanliness',   TRUE),
    (7,  'Water Supply',          'Drinking water, water coolers and water tanks',            TRUE),
    (8,  'Security',              'CCTV, gates, locks and campus safety',                     TRUE),
    (9,  'Laboratory Equipment',  'Lab instruments, computers and apparatus',                 TRUE),
    (10, 'Other',                 'Any other maintenance problem',                            TRUE);

INSERT INTO locations (id, name, description, active) VALUES
    (1,  'Block A',                     'Main academic block A',                 TRUE),
    (2,  'Block B',                     'Academic block B',                      TRUE),
    (3,  'Computer Science Department', 'CSE department building and labs',      TRUE),
    (4,  'Library',                     'Central library and reading halls',     TRUE),
    (5,  'Laboratory',                  'Science and engineering laboratories',  TRUE),
    (6,  'Auditorium',                  'Main auditorium and seminar hall',      TRUE),
    (7,  'Classroom',                   'General classrooms',                    TRUE),
    (8,  'Canteen',                     'College canteen and dining area',       TRUE),
    (9,  'Playground',                  'Sports ground and courts',              TRUE),
    (10, 'Hostel',                      'Boys and girls hostel blocks',          TRUE);

-- ---------------------------------------------------------------------
-- Escalation thresholds: LOW -> MEDIUM after 3 days, MEDIUM -> HIGH after 3 more days
-- ---------------------------------------------------------------------
INSERT INTO escalation_config (id, low_to_medium_days, medium_to_high_days, enabled, updated_at, updated_by)
VALUES (1, 3, 3, TRUE, @now, 1);

-- ---------------------------------------------------------------------
-- Complaints
-- Some are old and unresolved on purpose: the escalation scheduler will raise their
-- priority a few seconds after the backend starts (watch the "Escalated Complaints" page).
-- ---------------------------------------------------------------------
INSERT INTO complaints
    (id, title, description, category_id, location_id, priority, status, submitted_by,
     created_at, updated_at, resolved_at, priority_updated_at, escalation_count, last_escalated_at, escalation_reason)
VALUES
    (1,  'Ceiling fan not working in Classroom 204',
         'The ceiling fan at the back of Classroom 204 has stopped working. The room becomes very hot during afternoon lectures and students find it difficult to concentrate.',
         1, 7, 'LOW', 'PENDING', 4,
         DATE_SUB(@now, INTERVAL 10 DAY), DATE_SUB(@now, INTERVAL 10 DAY), NULL, DATE_SUB(@now, INTERVAL 10 DAY), 0, NULL, NULL),

    (2,  'Wi-Fi not working in CS Department lab',
         'Students cannot connect to the department Wi-Fi in the second-floor lab since Monday. The network shows connected but there is no internet access.',
         3, 3, 'MEDIUM', 'IN_PROGRESS', 5,
         DATE_SUB(@now, INTERVAL 5 DAY), DATE_SUB(@now, INTERVAL 2 DAY), NULL, DATE_SUB(@now, INTERVAL 5 DAY), 0, NULL, NULL),

    (3,  'Water leakage near Block A washroom',
         'Water is continuously leaking from a pipe outside the ground floor washroom in Block A. The corridor floor is wet and slippery and there is a risk of accidents.',
         2, 1, 'HIGH', 'IN_PROGRESS', 6,
         DATE_SUB(@now, INTERVAL 2 DAY), DATE_SUB(@now, INTERVAL 1 DAY), NULL, DATE_SUB(@now, INTERVAL 2 DAY), 0, NULL, NULL),

    (4,  'Projector flickering in Auditorium',
         'The projector in the main auditorium flickers and turns off after a few minutes. This disturbed the guest lecture last week and a technician needs to check it before the next event.',
         4, 6, 'MEDIUM', 'PENDING', 7,
         DATE_SUB(@now, INTERVAL 1 DAY), DATE_SUB(@now, INTERVAL 1 DAY), NULL, DATE_SUB(@now, INTERVAL 1 DAY), 0, NULL, NULL),

    (5,  'Broken benches in Library reading hall',
         'Three benches in the main reading hall of the library are broken and unsafe to sit on. Students are crowding on the remaining benches during exam preparation time.',
         5, 4, 'LOW', 'PENDING', 4,
         DATE_SUB(@now, INTERVAL 2 DAY), DATE_SUB(@now, INTERVAL 2 DAY), NULL, DATE_SUB(@now, INTERVAL 2 DAY), 0, NULL, NULL),

    (6,  'Overflowing dustbins at Canteen',
         'The dustbins outside the canteen are overflowing every afternoon and are not cleared until the next morning. There is a bad smell and flies around the dining area.',
         6, 8, 'MEDIUM', 'RESOLVED', 5,
         DATE_SUB(@now, INTERVAL 12 DAY), DATE_SUB(@now, INTERVAL 9 DAY), DATE_SUB(@now, INTERVAL 9 DAY), DATE_SUB(@now, INTERVAL 12 DAY), 0, NULL, NULL),

    (7,  'No water supply in Hostel block C',
         'There has been no water supply on the second and third floors of hostel block C since yesterday evening. Students are carrying buckets from the ground floor.',
         7, 10, 'HIGH', 'RESOLVED', 6,
         DATE_SUB(@now, INTERVAL 20 DAY), DATE_SUB(@now, INTERVAL 14 DAY), DATE_SUB(@now, INTERVAL 14 DAY), DATE_SUB(@now, INTERVAL 17 DAY), 1, DATE_SUB(@now, INTERVAL 17 DAY),
         'Unresolved for 3 day(s) since submission. MEDIUM priority exceeded the limit of 3 day(s), so the priority was raised automatically from MEDIUM to HIGH.'),

    (8,  'CCTV camera not working near Block B entrance',
         'The CCTV camera at the Block B main entrance shows a black screen on the security monitor. Entry monitoring is not possible until it is repaired.',
         8, 2, 'LOW', 'RESOLVED', 7,
         DATE_SUB(@now, INTERVAL 30 DAY), DATE_SUB(@now, INTERVAL 25 DAY), DATE_SUB(@now, INTERVAL 25 DAY), DATE_SUB(@now, INTERVAL 30 DAY), 0, NULL, NULL),

    (9,  'Microscopes damaged in Biology Laboratory',
         'Two microscopes in the laboratory have cracked lenses and cannot focus. Practical classes are being delayed because students have to share the remaining microscopes.',
         9, 5, 'MEDIUM', 'IN_PROGRESS', 4,
         DATE_SUB(@now, INTERVAL 8 DAY), DATE_SUB(@now, INTERVAL 6 DAY), NULL, DATE_SUB(@now, INTERVAL 8 DAY), 0, NULL, NULL),

    (10, 'Street light not working near Playground',
         'The street light near the playground entrance has not been working for a week. The area is completely dark after 6 PM which is unsafe for students leaving the sports practice.',
         1, 9, 'HIGH', 'PENDING', 6,
         DATE_SUB(@now, INTERVAL 8 DAY), DATE_SUB(@now, INTERVAL 5 DAY), NULL, DATE_SUB(@now, INTERVAL 5 DAY), 1, DATE_SUB(@now, INTERVAL 5 DAY),
         'Unresolved for 3 day(s) since submission. MEDIUM priority exceeded the limit of 3 day(s), so the priority was raised automatically from MEDIUM to HIGH.'),

    (11, 'Frequent power cuts in Computer Lab',
         'The computer lab loses power several times a day. Systems shut down suddenly and students lose their unsaved work. The problem started after the recent wiring work.',
         1, 3, 'HIGH', 'IN_PROGRESS', 5,
         DATE_SUB(@now, INTERVAL 9 DAY), DATE_SUB(@now, INTERVAL 2 DAY), NULL, DATE_SUB(@now, INTERVAL 3 DAY), 2, DATE_SUB(@now, INTERVAL 3 DAY),
         'Unresolved for 6 day(s) since submission. MEDIUM priority exceeded the limit of 3 day(s), so the priority was raised automatically from MEDIUM to HIGH.'),

    (12, 'Water cooler not working on first floor of Block B',
         'The water cooler on the first floor of Block B is not cooling and the tap is leaking. Students have to go to another floor to get drinking water.',
         7, 2, 'LOW', 'PENDING', 6,
         DATE_SUB(@now, INTERVAL 1 DAY), DATE_SUB(@now, INTERVAL 1 DAY), NULL, DATE_SUB(@now, INTERVAL 1 DAY), 0, NULL, NULL),

    (13, 'Door lock broken in Classroom 112',
         'The lock of the Classroom 112 door is broken and the door cannot be locked after classes. Expensive equipment such as the smart board is at risk.',
         5, 7, 'MEDIUM', 'PENDING', 4,
         DATE_SUB(@now, INTERVAL 6 HOUR), DATE_SUB(@now, INTERVAL 6 HOUR), NULL, DATE_SUB(@now, INTERVAL 6 HOUR), 0, NULL, NULL),

    (14, 'Washroom cleaning needed in Block A second floor',
         'The washrooms on the second floor of Block A have not been cleaned for two days. There is no water in the flush tanks and the smell is spreading into the corridor.',
         6, 1, 'LOW', 'RESOLVED', 5,
         DATE_SUB(@now, INTERVAL 45 DAY), DATE_SUB(@now, INTERVAL 43 DAY), DATE_SUB(@now, INTERVAL 43 DAY), DATE_SUB(@now, INTERVAL 45 DAY), 0, NULL, NULL),

    (15, 'Hostel Wi-Fi router is down',
         'The Wi-Fi router on the first floor of the hostel is not working. Around forty students are unable to access online study material.',
         3, 10, 'HIGH', 'RESOLVED', 6,
         DATE_SUB(@now, INTERVAL 70 DAY), DATE_SUB(@now, INTERVAL 68 DAY), DATE_SUB(@now, INTERVAL 68 DAY), DATE_SUB(@now, INTERVAL 70 DAY), 0, NULL, NULL),

    (16, 'Air conditioner not cooling in Auditorium',
         'The central air conditioning in the auditorium is not cooling properly. It was very uncomfortable during the annual cultural event rehearsal.',
         1, 6, 'MEDIUM', 'RESOLVED', 7,
         DATE_SUB(@now, INTERVAL 55 DAY), DATE_SUB(@now, INTERVAL 50 DAY), DATE_SUB(@now, INTERVAL 50 DAY), DATE_SUB(@now, INTERVAL 55 DAY), 0, NULL, NULL),

    (17, 'Broken window glass in Block B corridor',
         'A window glass in the first floor corridor of Block B is broken. Rain water enters the corridor and broken glass pieces are a danger to people walking there.',
         10, 2, 'MEDIUM', 'IN_PROGRESS', 4,
         DATE_SUB(@now, INTERVAL 2 DAY), DATE_SUB(@now, INTERVAL 1 DAY), NULL, DATE_SUB(@now, INTERVAL 2 DAY), 0, NULL, NULL),

    (18, 'Lab computers not connecting to the network',
         'Five computers in the electronics laboratory cannot connect to the college network, so students cannot save their work on the shared drive.',
         3, 5, 'LOW', 'PENDING', 5,
         DATE_SUB(@now, INTERVAL 5 DAY), DATE_SUB(@now, INTERVAL 5 DAY), NULL, DATE_SUB(@now, INTERVAL 5 DAY), 0, NULL, NULL);

-- ---------------------------------------------------------------------
-- Status history (timeline). NULL old_status = complaint submitted.
-- ---------------------------------------------------------------------
INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, remarks, changed_at) VALUES
    (1,  NULL, 'PENDING', 4, 'Complaint submitted', DATE_SUB(@now, INTERVAL 10 DAY)),

    (2,  NULL, 'PENDING', 5, 'Complaint submitted', DATE_SUB(@now, INTERVAL 5 DAY)),
    (2,  'PENDING', 'IN_PROGRESS', 2, 'Network technician is checking the access points', DATE_SUB(@now, INTERVAL 4 DAY)),
    (2,  'IN_PROGRESS', 'IN_PROGRESS', 2, 'Faulty network switch identified. Replacement has been ordered.', DATE_SUB(@now, INTERVAL 2 DAY)),

    (3,  NULL, 'PENDING', 6, 'Complaint submitted', DATE_SUB(@now, INTERVAL 2 DAY)),
    (3,  'PENDING', 'IN_PROGRESS', 3, 'Plumber has been sent to inspect the leaking pipe', DATE_SUB(@now, INTERVAL 1 DAY)),

    (4,  NULL, 'PENDING', 7, 'Complaint submitted', DATE_SUB(@now, INTERVAL 1 DAY)),

    (5,  NULL, 'PENDING', 4, 'Complaint submitted', DATE_SUB(@now, INTERVAL 2 DAY)),

    (6,  NULL, 'PENDING', 5, 'Complaint submitted', DATE_SUB(@now, INTERVAL 12 DAY)),
    (6,  'PENDING', 'IN_PROGRESS', 3, 'Work started', DATE_SUB(@now, INTERVAL 11 DAY)),
    (6,  'IN_PROGRESS', 'RESOLVED', 3, 'Resolved: Two extra bins placed and a twice-a-day cleaning schedule started.', DATE_SUB(@now, INTERVAL 9 DAY)),

    (7,  NULL, 'PENDING', 6, 'Complaint submitted', DATE_SUB(@now, INTERVAL 20 DAY)),
    (7,  'PENDING', 'IN_PROGRESS', 3, 'Work started', DATE_SUB(@now, INTERVAL 16 DAY)),
    (7,  'IN_PROGRESS', 'RESOLVED', 3, 'Resolved: Water pump motor repaired and the tank refilled.', DATE_SUB(@now, INTERVAL 14 DAY)),

    (8,  NULL, 'PENDING', 7, 'Complaint submitted', DATE_SUB(@now, INTERVAL 30 DAY)),
    (8,  'PENDING', 'IN_PROGRESS', 2, 'Work started', DATE_SUB(@now, INTERVAL 27 DAY)),
    (8,  'IN_PROGRESS', 'RESOLVED', 2, 'Resolved: Camera cable replaced and camera tested on the monitor.', DATE_SUB(@now, INTERVAL 25 DAY)),

    (9,  NULL, 'PENDING', 4, 'Complaint submitted', DATE_SUB(@now, INTERVAL 8 DAY)),
    (9,  'PENDING', 'IN_PROGRESS', 2, 'Replacement lenses have been requested from the supplier', DATE_SUB(@now, INTERVAL 6 DAY)),

    (10, NULL, 'PENDING', 6, 'Complaint submitted', DATE_SUB(@now, INTERVAL 8 DAY)),

    (11, NULL, 'PENDING', 5, 'Complaint submitted', DATE_SUB(@now, INTERVAL 9 DAY)),
    (11, 'PENDING', 'IN_PROGRESS', 2, 'Electrician is inspecting the main distribution board', DATE_SUB(@now, INTERVAL 4 DAY)),
    (11, 'IN_PROGRESS', 'IN_PROGRESS', 2, 'Faulty MCB replaced. Monitoring the power supply for 24 hours.', DATE_SUB(@now, INTERVAL 2 DAY)),

    (12, NULL, 'PENDING', 6, 'Complaint submitted', DATE_SUB(@now, INTERVAL 1 DAY)),

    (13, NULL, 'PENDING', 4, 'Complaint submitted', DATE_SUB(@now, INTERVAL 6 HOUR)),

    (14, NULL, 'PENDING', 5, 'Complaint submitted', DATE_SUB(@now, INTERVAL 45 DAY)),
    (14, 'PENDING', 'IN_PROGRESS', 3, 'Work started', DATE_SUB(@now, INTERVAL 44 DAY)),
    (14, 'IN_PROGRESS', 'RESOLVED', 3, 'Resolved: Washrooms cleaned and flush tanks refilled.', DATE_SUB(@now, INTERVAL 43 DAY)),

    (15, NULL, 'PENDING', 6, 'Complaint submitted', DATE_SUB(@now, INTERVAL 70 DAY)),
    (15, 'PENDING', 'IN_PROGRESS', 2, 'Work started', DATE_SUB(@now, INTERVAL 69 DAY)),
    (15, 'IN_PROGRESS', 'RESOLVED', 2, 'Resolved: Faulty router replaced with a new one.', DATE_SUB(@now, INTERVAL 68 DAY)),

    (16, NULL, 'PENDING', 7, 'Complaint submitted', DATE_SUB(@now, INTERVAL 55 DAY)),
    (16, 'PENDING', 'IN_PROGRESS', 2, 'Work started', DATE_SUB(@now, INTERVAL 53 DAY)),
    (16, 'IN_PROGRESS', 'RESOLVED', 2, 'Resolved: AC gas refilled and filters cleaned.', DATE_SUB(@now, INTERVAL 50 DAY)),

    (17, NULL, 'PENDING', 4, 'Complaint submitted', DATE_SUB(@now, INTERVAL 2 DAY)),
    (17, 'PENDING', 'IN_PROGRESS', 3, 'Glazier has been scheduled for tomorrow morning', DATE_SUB(@now, INTERVAL 1 DAY)),

    (18, NULL, 'PENDING', 5, 'Complaint submitted', DATE_SUB(@now, INTERVAL 5 DAY));

-- ---------------------------------------------------------------------
-- Resolutions of the resolved complaints (seed data has no proof images)
-- ---------------------------------------------------------------------
INSERT INTO resolutions (complaint_id, remarks, proof_image_path, resolved_by, resolved_at) VALUES
    (6,  'Two extra bins placed outside the canteen and a twice-a-day cleaning schedule started.', NULL, 3, DATE_SUB(@now, INTERVAL 9 DAY)),
    (7,  'Water pump motor repaired and the overhead tank refilled. Supply restored on all floors.', NULL, 3, DATE_SUB(@now, INTERVAL 14 DAY)),
    (8,  'Damaged camera cable replaced and the camera tested on the security monitor.', NULL, 2, DATE_SUB(@now, INTERVAL 25 DAY)),
    (14, 'Washrooms cleaned and flush tanks refilled. Housekeeping supervisor informed.', NULL, 3, DATE_SUB(@now, INTERVAL 43 DAY)),
    (15, 'Faulty router replaced with a new one and tested with multiple devices.', NULL, 2, DATE_SUB(@now, INTERVAL 68 DAY)),
    (16, 'AC gas refilled and filters cleaned. Temperature now reaches 22 degrees in 15 minutes.', NULL, 2, DATE_SUB(@now, INTERVAL 50 DAY));

-- ---------------------------------------------------------------------
-- Escalation history of the complaints that were already escalated
-- ---------------------------------------------------------------------
INSERT INTO escalation_logs (complaint_id, from_priority, to_priority, reason, escalated_at) VALUES
    (7,  'MEDIUM', 'HIGH',
         'Unresolved for 3 day(s) since submission. MEDIUM priority exceeded the limit of 3 day(s), so the priority was raised automatically from MEDIUM to HIGH.',
         DATE_SUB(@now, INTERVAL 17 DAY)),
    (10, 'MEDIUM', 'HIGH',
         'Unresolved for 3 day(s) since submission. MEDIUM priority exceeded the limit of 3 day(s), so the priority was raised automatically from MEDIUM to HIGH.',
         DATE_SUB(@now, INTERVAL 5 DAY)),
    (11, 'LOW', 'MEDIUM',
         'Unresolved for 3 day(s) since submission. LOW priority exceeded the limit of 3 day(s), so the priority was raised automatically from LOW to MEDIUM.',
         DATE_SUB(@now, INTERVAL 6 DAY)),
    (11, 'MEDIUM', 'HIGH',
         'Unresolved for 6 day(s) since submission. MEDIUM priority exceeded the limit of 3 day(s), so the priority was raised automatically from MEDIUM to HIGH.',
         DATE_SUB(@now, INTERVAL 3 DAY));
