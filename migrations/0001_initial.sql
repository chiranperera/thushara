-- Thushara Rathnayake — initial schema
-- Source: design-brief/10-tech-stack.md
-- Apply local:  npx wrangler d1 migrations apply thushara-db --local
-- Apply remote: npx wrangler d1 migrations apply thushara-db --remote

-- ============================================================
-- LEADS — the reason the site exists.
-- Written BEFORE any notification is attempted. A notification
-- failure must never cost a lead.
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  name                   TEXT NOT NULL,
  email                  TEXT NOT NULL,
  phone_whatsapp         TEXT NOT NULL,

  -- Step 1: profession. Lets him arrive at the call prepared.
  profession_category    TEXT NOT NULL,   -- doctor | engineer | other_professional | other
  profession_role        TEXT,            -- Medical Officer, Consultant, Chartered Engineer…
  engineering_discipline TEXT,
  profession_other       TEXT,

  -- Step 2: interest. JSON array of service slugs.
  services               TEXT NOT NULL DEFAULT '[]',

  -- Step 3: when
  preferred_date         TEXT,
  preferred_time         TEXT,
  alt_time               TEXT,
  meeting_method         TEXT,            -- phone | whatsapp | video | in_person

  -- Step 4: context
  notes                  TEXT,
  preferred_contact      TEXT DEFAULT 'whatsapp',

  -- Captured automatically. These three are what let him open the
  -- call already knowing what the person needs.
  referring_page         TEXT,
  life_stage             TEXT,
  calculator_data        TEXT,

  consent_at             TEXT NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'new',
                         -- new | contacted | confirmed | met | converted | not_proceeding
  notification_failed    INTEGER NOT NULL DEFAULT 0,
  admin_notes            TEXT,
  created_at             TEXT NOT NULL,
  updated_at             TEXT
);
CREATE INDEX IF NOT EXISTS idx_leads_status  ON leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);

-- ============================================================
-- TESTIMONIALS — moderated, never auto-published.
-- approve_token powers one-tap approval from the notification
-- email, so he rarely needs to open the admin panel.
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  profession    TEXT NOT NULL,
  service       TEXT,
  rating        INTEGER,
  body          TEXT NOT NULL,
  photo_key     TEXT,
  email         TEXT,
  consent_at    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending | published | rejected
  approve_token TEXT,
  featured      INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  reject_reason TEXT,
  created_at    TEXT NOT NULL,
  published_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_testi_status ON testimonials(status, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_testi_token ON testimonials(approve_token);

-- ============================================================
-- GALLERY — awards, MDRT, events. alt_text is NOT NULL:
-- accessibility depends on it.
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key  TEXT NOT NULL,
  thumb_key  TEXT,
  width      INTEGER,
  height     INTEGER,
  caption    TEXT,
  alt_text   TEXT NOT NULL,
  category   TEXT,   -- mdrt_awards | client_events | milestones | community
  visible    INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gallery ON gallery_items(visible, category, sort_order);

-- ============================================================
-- RESOURCES — downloadable guides. page_count and file_size are
-- calculated on upload, never typed.
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  audience       TEXT,
  life_stage     TEXT,
  file_key       TEXT NOT NULL,
  page_count     INTEGER,
  file_size      INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  gated          INTEGER NOT NULL DEFAULT 1,
  published      INTEGER NOT NULL DEFAULT 1,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL
);

-- Soft lead capture. Tagged with which guide was taken, so he
-- knows what they were reading before he calls.
CREATE TABLE IF NOT EXISTS resource_downloads (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_id    INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  phone_whatsapp TEXT NOT NULL,
  email          TEXT,
  consent_at     TEXT NOT NULL,
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_downloads ON resource_downloads(created_at DESC);

-- ============================================================
-- FAQ — also the knowledge base for the phase-2 chatbot.
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  category   TEXT,
  service    TEXT,
  published  INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_faqs ON faqs(published, category, sort_order);

-- ============================================================
-- SERVICES — editable copy. Structure is locked in the admin UI:
-- he edits content within sections but cannot rearrange or delete
-- them, so a page cannot be accidentally broken.
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT UNIQUE NOT NULL,
  title      TEXT NOT NULL,
  promise    TEXT,
  intro      TEXT,
  sections   TEXT,   -- JSON
  life_stage TEXT,
  icon       TEXT,
  published  INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- AVAILABILITY — drives the booking slot picker.
-- Evening and weekend rows matter most: they convert doctors
-- and engineers better than anything else.
-- ============================================================
CREATE TABLE IF NOT EXISTS availability (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  label       TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,  -- 0 Sun … 6 Sat
  start_time  TEXT NOT NULL,
  end_time    TEXT NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  date   TEXT PRIMARY KEY,
  reason TEXT
);

-- ============================================================
-- SETTINGS — the live values shown across every page.
-- NEVER hard-code these: mdrt_years increments annually and he
-- must be able to change it himself.
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TEXT
);

-- ============================================================
-- ADMIN — single user, magic link. No roles, no permissions.
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT UNIQUE NOT NULL,
  created_at    TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS auth_tokens (
  token      TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  purpose    TEXT NOT NULL DEFAULT 'login',
  expires_at TEXT NOT NULL,
  used_at    TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_expiry ON auth_tokens(expires_at);
