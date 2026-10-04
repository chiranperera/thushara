-- Court of the Table becomes the list of years rather than a bare count,
-- so the number and the years written beside it on the About page come
-- from the same place. Seeded with his confirmed years.
INSERT INTO settings (key, value) VALUES ('cot_year_list', '2020, 2024, 2025, 2026')
  ON CONFLICT(key) DO NOTHING;
