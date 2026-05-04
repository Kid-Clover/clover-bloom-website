CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  auth0_id   TEXT    NOT NULL UNIQUE,
  email      TEXT    NOT NULL,
  name       TEXT,
  picture    TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
