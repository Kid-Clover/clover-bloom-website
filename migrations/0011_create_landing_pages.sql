CREATE TABLE landing_pages (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT    UNIQUE NOT NULL,
  title            TEXT    NOT NULL,
  subtitle         TEXT,
  icon             TEXT,
  body             TEXT    NOT NULL,
  coupon_code      TEXT,
  coupon_label     TEXT,
  coupon_amount    TEXT,
  coupon_description TEXT,
  cta_text         TEXT,
  cta_url          TEXT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);
