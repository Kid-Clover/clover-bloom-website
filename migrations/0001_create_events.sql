CREATE TABLE event_types (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO event_types (name) VALUES
  ('Market'),
  ('Popup'),
  ('Class'),
  ('Appearance');

CREATE TABLE events (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  title             TEXT    NOT NULL,
  description       TEXT,
  short_description TEXT,
  location_name     TEXT    NOT NULL,
  start_time        TEXT    NOT NULL, -- ISO 8601 UTC
  end_time          TEXT,             -- ISO 8601 UTC
  event_type_id     INTEGER NOT NULL REFERENCES event_types(id),
  requires_sign_up  INTEGER NOT NULL DEFAULT 0
);
