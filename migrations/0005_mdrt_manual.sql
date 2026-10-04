-- The MDRT count goes back to being a number he sets himself.
--
-- 0004 derived it from the first MDRT year, which only holds while he
-- qualifies every single year. MDRT counts qualifications, so like
-- Court of the Table only he knows when it changes. Years of experience
-- stays derived — that one really does go up every 1 January.
UPDATE settings SET value = '14' WHERE key = 'mdrt_years' AND (value IS NULL OR value = '' OR value = 'PENDING');
INSERT INTO settings (key, value) VALUES ('mdrt_years', '14') ON CONFLICT(key) DO NOTHING;
