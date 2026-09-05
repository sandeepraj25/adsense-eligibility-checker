/**
 * Schema as ordered, append-only migrations. `PRAGMA user_version`
 * records how many have run, so an existing database upgrades itself
 * on boot and never re-runs a migration.
 *
 * Never edit a migration that has shipped. Add a new one.
 *
 * Money is INTEGER paise. Timestamps are INTEGER milliseconds since
 * epoch (UTC) — comparable, sortable, and unambiguous across zones.
 * SQLite has no boolean or enum type, so flags are 0/1 and the union
 * types are enforced in TypeScript at the repository boundary.
 */

const V1 = `
CREATE TABLE users (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);

-- Session id is the SHA-256 of the cookie token, never the token
-- itself: a stolen database cannot be replayed as a live session.
CREATE TABLE sessions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    INTEGER NOT NULL,
  last_seen_at  INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  user_agent    TEXT,
  ip            TEXT
);
CREATE INDEX idx_sessions_user    ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Mirror of lib/plans.ts. Code stays the source of truth; this table
-- exists so plans are joinable and so historical rows can point at a
-- plan that has since been re-priced.
CREATE TABLE plans (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  amount_paise   INTEGER NOT NULL,
  currency       TEXT NOT NULL,
  check_limit    INTEGER NOT NULL,
  validity_days  INTEGER NOT NULL,
  site_limit     INTEGER,
  purchasable    INTEGER NOT NULL DEFAULT 0,
  synced_at      INTEGER NOT NULL
);

-- A purchase. Plan attributes are snapshotted so re-pricing a plan
-- never rewrites what somebody already bought.
CREATE TABLE subscriptions (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id         TEXT NOT NULL,
  plan_name       TEXT NOT NULL,
  amount_paise    INTEGER NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'INR',
  check_limit     INTEGER NOT NULL,
  checks_used     INTEGER NOT NULL DEFAULT 0,
  site_limit      INTEGER,
  validity_days   INTEGER NOT NULL,
  purchased_at    INTEGER NOT NULL,
  starts_at       INTEGER NOT NULL,
  expires_at      INTEGER NOT NULL,
  status          TEXT NOT NULL,          -- active | expired | cancelled
  payment_status  TEXT NOT NULL,          -- paid | free | pending | failed
  payment_id      TEXT,
  order_id        TEXT,
  invoice_id      TEXT,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX idx_subs_user   ON subscriptions(user_id, status);
CREATE INDEX idx_subs_expiry ON subscriptions(expires_at);

-- One row per Razorpay order. The UNIQUE on order id is what makes
-- verification idempotent under duplicate callbacks.
CREATE TABLE payments (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id     TEXT,
  plan_id             TEXT NOT NULL,
  amount_paise        INTEGER NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'INR',
  status              TEXT NOT NULL,      -- created | paid | failed | cancelled
  mode                TEXT NOT NULL,      -- razorpay | mock
  razorpay_order_id   TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  method              TEXT,
  failure_reason      TEXT,
  receipt             TEXT,
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL,
  verified_at         INTEGER
);
CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);

CREATE TABLE invoices (
  id               TEXT PRIMARY KEY,
  number           TEXT NOT NULL UNIQUE,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_id       TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  subscription_id  TEXT,
  billing_name     TEXT NOT NULL,
  billing_email    TEXT NOT NULL,
  plan_name        TEXT NOT NULL,
  amount_paise     INTEGER NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'INR',
  period_start     INTEGER NOT NULL,
  period_end       INTEGER NOT NULL,
  issued_at        INTEGER NOT NULL
);
CREATE INDEX idx_invoices_user ON invoices(user_id, issued_at DESC);

CREATE TABLE websites (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain          TEXT NOT NULL,
  created_at      INTEGER NOT NULL,
  last_checked_at INTEGER,
  UNIQUE(user_id, domain)
);

CREATE TABLE reports (
  id               TEXT PRIMARY KEY,
  ref              TEXT NOT NULL,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  website_id       TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  subscription_id  TEXT,
  url              TEXT NOT NULL,
  domain           TEXT NOT NULL,
  score            INTEGER NOT NULL DEFAULT 0,
  verdict          TEXT NOT NULL DEFAULT 'not_ready',   -- ready | needs_improvement | not_ready
  state            TEXT NOT NULL DEFAULT 'running',     -- running | complete | failed
  categories_json  TEXT NOT NULL DEFAULT '[]',
  passed_count     INTEGER NOT NULL DEFAULT 0,
  warning_count    INTEGER NOT NULL DEFAULT 0,
  critical_count   INTEGER NOT NULL DEFAULT 0,
  plan_id          TEXT NOT NULL,
  plan_name        TEXT NOT NULL,
  engine_version   TEXT NOT NULL,
  -- 'live' = the site was actually fetched. 'demo' = sample data.
  analysis_mode    TEXT NOT NULL DEFAULT 'live',
  pages_fetched    INTEGER NOT NULL DEFAULT 0,
  error_message    TEXT,
  started_at       INTEGER NOT NULL,
  finished_at      INTEGER,
  duration_ms      INTEGER,
  created_at       INTEGER NOT NULL
);
CREATE INDEX idx_reports_user ON reports(user_id, created_at DESC);
CREATE INDEX idx_reports_site ON reports(website_id, created_at DESC);

CREATE TABLE report_issues (
  id              TEXT PRIMARY KEY,
  report_id       TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  check_id        TEXT NOT NULL,
  category_id     TEXT NOT NULL,
  label           TEXT NOT NULL,
  status          TEXT NOT NULL,   -- pass | warn | fail
  priority        TEXT NOT NULL,   -- high | medium | low
  detail          TEXT NOT NULL,
  recommendation  TEXT,
  evidence        TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_issues_report ON report_issues(report_id, sort_order);
`;

/**
 * V2 — three monthly plans, admin, multi-gateway payments.
 *
 * Renames rather than duplicates where the meaning changed: a
 * subscription's "checks" allowance became a per-month scan allowance, and
 * a payment's "razorpay order" became a gateway order. Adding parallel
 * columns instead would leave two places to update and one of them
 * eventually wrong.
 */
const V2 = `
-- ── users: roles and account status ────────────────────────────────
ALTER TABLE users ADD COLUMN role           TEXT NOT NULL DEFAULT 'user';   -- user | admin
ALTER TABLE users ADD COLUMN status         TEXT NOT NULL DEFAULT 'active'; -- active | blocked
ALTER TABLE users ADD COLUMN blocked_at     INTEGER;
ALTER TABLE users ADD COLUMN blocked_reason TEXT;
ALTER TABLE users ADD COLUMN last_active_at INTEGER;
CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ── plans: now editable by an admin, so the table is authoritative
-- for price and limits while lib/plans.ts remains the seed and the
-- fallback. V1's mirror had no rows worth keeping.
DROP TABLE plans;
CREATE TABLE plans (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  tagline           TEXT NOT NULL DEFAULT '',
  amount_paise      INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'INR',
  billing_interval  TEXT NOT NULL DEFAULT 'month',
  site_limit        INTEGER NOT NULL,
  scan_limit        INTEGER NOT NULL,
  purchasable       INTEGER NOT NULL DEFAULT 0,
  featured          INTEGER NOT NULL DEFAULT 0,
  active            INTEGER NOT NULL DEFAULT 1,
  features_json     TEXT NOT NULL DEFAULT '[]',
  showcase_json     TEXT NOT NULL DEFAULT '[]',
  excluded_json     TEXT NOT NULL DEFAULT '[]',
  highlights_json   TEXT NOT NULL DEFAULT '[]',
  sort_order        INTEGER NOT NULL DEFAULT 0,
  updated_at        INTEGER NOT NULL,
  updated_by        TEXT
);

-- ── subscriptions: monthly cycles instead of a one-off allowance ───
ALTER TABLE subscriptions RENAME COLUMN check_limit TO scan_limit;
ALTER TABLE subscriptions RENAME COLUMN checks_used TO scans_used;
ALTER TABLE subscriptions ADD COLUMN cycle_start   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN cycle_end     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN cycle_index   INTEGER NOT NULL DEFAULT 1;
ALTER TABLE subscriptions ADD COLUMN cycle_reset_at INTEGER;
ALTER TABLE subscriptions ADD COLUMN features_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE subscriptions ADD COLUMN gateway       TEXT;
ALTER TABLE subscriptions ADD COLUMN admin_note    TEXT;
UPDATE subscriptions
   SET cycle_start = starts_at,
       cycle_end   = expires_at
 WHERE cycle_start = 0;

-- ── payments: one row per order at any gateway ─────────────────────
ALTER TABLE payments RENAME COLUMN razorpay_order_id   TO gateway_order_id;
ALTER TABLE payments RENAME COLUMN razorpay_payment_id TO gateway_payment_id;
ALTER TABLE payments ADD COLUMN gateway     TEXT NOT NULL DEFAULT 'razorpay';
ALTER TABLE payments ADD COLUMN environment TEXT;
ALTER TABLE payments ADD COLUMN raw_status  TEXT;
-- 'mode' used to carry the gateway name; it now says only whether the
-- money was real. The right-hand sides all read the pre-update row.
UPDATE payments
   SET gateway = CASE WHEN mode = 'mock' THEN 'razorpay' ELSE mode END,
       mode    = CASE WHEN mode = 'mock' THEN 'mock' ELSE 'live' END;

-- ── gateway configuration, secrets encrypted at rest ──────────────
CREATE TABLE payment_gateways (
  id                    TEXT PRIMARY KEY,   -- razorpay | cashfree | paypal
  enabled               INTEGER NOT NULL DEFAULT 0,
  environment           TEXT NOT NULL DEFAULT 'sandbox',  -- sandbox | live
  -- AES-256-GCM ciphertext of a JSON credential bag. Never plain text,
  -- and never returned to a browser.
  credentials_cipher    TEXT,
  -- Last four characters of each credential, so the admin panel can
  -- show which key is installed without being able to read it.
  credential_tails_json TEXT NOT NULL DEFAULT '{}',
  updated_at            INTEGER NOT NULL,
  updated_by            TEXT
);

-- Delivered webhooks, kept so a redelivery is recognised rather than
-- reprocessed. The primary key is the gateway's own event id.
CREATE TABLE webhook_events (
  id           TEXT PRIMARY KEY,
  gateway      TEXT NOT NULL,
  event_type   TEXT,
  payload_hash TEXT NOT NULL,
  outcome      TEXT NOT NULL,     -- processed | duplicate | ignored | rejected
  detail       TEXT,
  received_at  INTEGER NOT NULL
);
CREATE INDEX idx_webhook_events_time ON webhook_events(received_at DESC);

-- ── admin audit trail ─────────────────────────────────────────────
CREATE TABLE admin_logs (
  id           TEXT PRIMARY KEY,
  admin_id     TEXT,
  admin_email  TEXT NOT NULL,
  action       TEXT NOT NULL,
  target_type  TEXT NOT NULL,     -- user | plan | subscription | gateway
  target_id    TEXT,
  target_label TEXT,
  detail       TEXT,
  created_at   INTEGER NOT NULL
);
CREATE INDEX idx_admin_logs_time   ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_target ON admin_logs(target_type, target_id);

-- ── reports: what the plan allowed, and per-page detail ───────────
ALTER TABLE reports ADD COLUMN features_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE reports ADD COLUMN pages_json    TEXT NOT NULL DEFAULT '[]';
ALTER TABLE reports ADD COLUMN metrics_json  TEXT NOT NULL DEFAULT '{}';
ALTER TABLE reports ADD COLUMN checks_run    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE reports ADD COLUMN locked_json   TEXT NOT NULL DEFAULT '[]';

-- Which advertised feature produced a finding, so the report can group
-- findings by feature and show what a cheaper plan did not run.
ALTER TABLE report_issues ADD COLUMN feature TEXT;
`;

/** Append-only. Index 0 is version 1. */
export const MIGRATIONS: string[] = [V1, V2];
