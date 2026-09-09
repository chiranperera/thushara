-- Years of experience and MDRT count become derived rather than stored.
--
-- They were two numbers someone had to remember to change every
-- January, printed in the hero, the credentials band and the footer of
-- every page. A start year is a fact that never changes; the count is
-- worked out from it, so 1 January takes care of itself.
--
-- Appointed 16 April 2010. First MDRT 2013, every year since.
INSERT INTO settings (key, value) VALUES ('experience_since', '2010')
  ON CONFLICT(key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('mdrt_since', '2013')
  ON CONFLICT(key) DO NOTHING;

-- The old stored counts are cleared so they stop shadowing the derived
-- figures. The keys stay in the table as a deliberate manual override:
-- MDRT counts qualifications, and if a year were ever missed, the
-- derived number would overstate it. Empty means "work it out".
UPDATE settings SET value = '' WHERE key IN ('years_experience', 'mdrt_years');

-- Court of the Table stays a stored number. It does not increment on a
-- schedule — he qualifies for it in some years and not others, so only
-- he knows when it changes.
INSERT INTO settings (key, value) VALUES ('cot_years', '4')
  ON CONFLICT(key) DO NOTHING;

-- The line above the testimonial carousel, in his own words.
INSERT INTO settings (key, value) VALUES (
  'testimonials_intro',
  'More than 1,000 professionals trust me with their cover — among them consultant cardiac surgeons, orthopaedic surgeons, neurosurgeons and specialists across Sri Lankan medicine.'
) ON CONFLICT(key) DO NOTHING;
