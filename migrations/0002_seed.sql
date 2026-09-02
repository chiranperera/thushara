-- Seed: settings, availability, services.
-- Values marked PENDING are placeholders per
-- design-brief/12-placeholders-and-asset-manifest.md and are edited
-- by Thushara in /admin — never hard-coded in the pages.

-- ============================================================
-- SETTINGS — shown across every page.
-- mdrt_years increments annually; he updates it himself.
-- ============================================================
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
  ('years_experience', '16',                          datetime('now')),
  ('mdrt_years',       '14',                          datetime('now')),
  ('mdrt_status',      'Lifetime Member',             datetime('now')),
  ('cot_years',        '4',                           datetime('now')),
  ('recognition',      'Top Performer, Regional',     datetime('now')),
  ('phone',            '+94 77 664 7461',             datetime('now')),
  ('whatsapp',         '+94 77 664 7461',             datetime('now')),
  ('email',            'thusharaslic@gmail.com',      datetime('now')),
  ('service_area',     'Island-wide · Colombo & suburbs', datetime('now')),
  ('bookings_paused',  '0',                           datetime('now')),
  ('appointment_minutes', '30',                       datetime('now')),
  ('buffer_minutes',   '15',                          datetime('now')),
  ('max_per_day',      '4',                           datetime('now'));

-- ============================================================
-- AVAILABILITY — evening and weekend slots are ON by default.
-- They convert doctors and engineers better than anything else:
-- a Medical Officer cannot take a call at 2pm.
-- ============================================================
INSERT OR IGNORE INTO availability (id, label, day_of_week, start_time, end_time, active) VALUES
  (1, 'Monday',            1, '09:00', '17:00', 1),
  (2, 'Tuesday',           2, '09:00', '17:00', 1),
  (3, 'Wednesday',         3, '09:00', '17:00', 1),
  (4, 'Thursday',          4, '09:00', '17:00', 1),
  (5, 'Friday',            5, '09:00', '17:00', 1),
  (11, 'Monday evening',    1, '18:00', '20:30', 1),
  (12, 'Tuesday evening',   2, '18:00', '20:30', 1),
  (13, 'Wednesday evening', 3, '18:00', '20:30', 1),
  (14, 'Thursday evening',  4, '18:00', '20:30', 1),
  (15, 'Friday evening',    5, '18:00', '20:30', 1),
  (6, 'Saturday',          6, '09:00', '13:00', 1),
  (7, 'Sunday',            0, '09:00', '13:00', 0);

-- ============================================================
-- SERVICES — canonical copy lives in src/content/services/*.md.
-- These rows exist so /admin/services can override that copy.
-- Segment A's products lead, per the 60% weighting.
-- ============================================================
INSERT OR IGNORE INTO services (slug, title, life_stage, icon, sort_order, published) VALUES
  ('professional-indemnity', 'Professional Indemnity',     'starting-out',    'indemnity', 1, 1),
  ('motor-insurance',        'Motor Insurance',            'starting-out',    'motor',     2, 1),
  ('life-income-protection', 'Life & Income Protection',   'building-family', 'life',      3, 1),
  ('health-insurance',       'Health Insurance',           'building-family', 'health',    4, 1),
  ('children-education',     'Children''s Education Fund', 'building-family', 'education', 5, 1),
  ('retirement-plan',        'Retirement Plan',            'planning-ahead',  'pension',   6, 1),
  ('house-property',         'House & Property',           'planning-ahead',  'house',     7, 1),
  ('travel-insurance',       'Travel Insurance',           'starting-out',    'travel',    8, 1);
