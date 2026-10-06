-- MDRT goes back to counting itself (6 Oct 2026, Chiran): one more every
-- 1 January from his first MDRT year, like years of experience. The
-- hand-set number from 0005 is cleared so nothing can hold it back.
UPDATE settings SET value = '' WHERE key = 'mdrt_years';
INSERT INTO settings (key, value) VALUES ('mdrt_since', '2013') ON CONFLICT(key) DO NOTHING;
