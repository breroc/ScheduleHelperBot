-- Run only for columns that are missing in your current users table.
ALTER TABLE users ADD COLUMN group_name TEXT;
ALTER TABLE users ADD COLUMN language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE users ADD COLUMN notifications_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN reminder_minutes INTEGER NOT NULL DEFAULT 10;
ALTER TABLE users ADD COLUMN reminder_mute_until_date TEXT;
ALTER TABLE users ADD COLUMN morning_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN favorite_groups TEXT;
ALTER TABLE users ADD COLUMN note_flow_step TEXT;
ALTER TABLE users ADD COLUMN note_flow_weekday INTEGER;
ALTER TABLE users ADD COLUMN note_flow_lesson_number INTEGER;
ALTER TABLE users ADD COLUMN morning_time TEXT NOT NULL DEFAULT '07:00';
ALTER TABLE users ADD COLUMN last_morning_sent TEXT;
ALTER TABLE users ADD COLUMN last_reminder_key TEXT;
ALTER TABLE users ADD COLUMN last_evening_sent TEXT;
ALTER TABLE users ADD COLUMN bot_fingerprint TEXT;
ALTER TABLE users ADD COLUMN tg_username TEXT;
ALTER TABLE users ADD COLUMN tg_first_name TEXT;
ALTER TABLE users ADD COLUMN tg_last_name TEXT;
ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN last_seen_at TEXT;
ALTER TABLE users ADD COLUMN deactivated_at TEXT;

CREATE TABLE IF NOT EXISTS lesson_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  group_name TEXT NOT NULL,
  weekday INTEGER NOT NULL,
  lesson_number INTEGER NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chat_id, group_name, weekday, lesson_number)
);
