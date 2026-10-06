-- One opening window per day of the week, each with its own start and
-- end time (6 Oct 2026, Chiran: "seven days, and he decides the start
-- and end time each day"). The weekday evening rows are folded into
-- their day: the day now runs from its earliest start to its latest end,
-- and is on if either part was on. He adjusts the times from the admin.
UPDATE availability SET
  start_time = (SELECT min(a.start_time) FROM availability a WHERE a.day_of_week = availability.day_of_week),
  end_time   = (SELECT max(a.end_time)   FROM availability a WHERE a.day_of_week = availability.day_of_week),
  active     = (SELECT max(a.active)     FROM availability a WHERE a.day_of_week = availability.day_of_week)
WHERE id = (SELECT min(a.id) FROM availability a WHERE a.day_of_week = availability.day_of_week);

DELETE FROM availability
WHERE id <> (SELECT min(a.id) FROM availability a WHERE a.day_of_week = availability.day_of_week);

UPDATE availability SET label = CASE day_of_week
  WHEN 0 THEN 'Sunday' WHEN 1 THEN 'Monday' WHEN 2 THEN 'Tuesday' WHEN 3 THEN 'Wednesday'
  WHEN 4 THEN 'Thursday' WHEN 5 THEN 'Friday' ELSE 'Saturday' END;

-- Any day that has no row at all gets one, switched off.
INSERT INTO availability (label, day_of_week, start_time, end_time, active) SELECT 'Sunday', 0, '09:00', '17:00', 0 WHERE NOT EXISTS (SELECT 1 FROM availability WHERE day_of_week = 0);
INSERT INTO availability (label, day_of_week, start_time, end_time, active) SELECT 'Monday', 1, '09:00', '17:00', 0 WHERE NOT EXISTS (SELECT 1 FROM availability WHERE day_of_week = 1);
INSERT INTO availability (label, day_of_week, start_time, end_time, active) SELECT 'Tuesday', 2, '09:00', '17:00', 0 WHERE NOT EXISTS (SELECT 1 FROM availability WHERE day_of_week = 2);
INSERT INTO availability (label, day_of_week, start_time, end_time, active) SELECT 'Wednesday', 3, '09:00', '17:00', 0 WHERE NOT EXISTS (SELECT 1 FROM availability WHERE day_of_week = 3);
INSERT INTO availability (label, day_of_week, start_time, end_time, active) SELECT 'Thursday', 4, '09:00', '17:00', 0 WHERE NOT EXISTS (SELECT 1 FROM availability WHERE day_of_week = 4);
INSERT INTO availability (label, day_of_week, start_time, end_time, active) SELECT 'Friday', 5, '09:00', '17:00', 0 WHERE NOT EXISTS (SELECT 1 FROM availability WHERE day_of_week = 5);
INSERT INTO availability (label, day_of_week, start_time, end_time, active) SELECT 'Saturday', 6, '09:00', '17:00', 0 WHERE NOT EXISTS (SELECT 1 FROM availability WHERE day_of_week = 6);
