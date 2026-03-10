-- Run only for columns that are missing in your current users table.
ALTER TABLE users ADD COLUMN group_name TEXT;
ALTER TABLE users ADD COLUMN language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE users ADD COLUMN notifications_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN reminder_minutes INTEGER NOT NULL DEFAULT 10;
ALTER TABLE users ADD COLUMN morning_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN favorite_groups TEXT;
ALTER TABLE users ADD COLUMN morning_time TEXT NOT NULL DEFAULT '07:00';
ALTER TABLE users ADD COLUMN last_morning_sent TEXT;
ALTER TABLE users ADD COLUMN last_reminder_key TEXT;
ALTER TABLE users ADD COLUMN last_evening_sent TEXT;
ALTER TABLE users ADD COLUMN bot_fingerprint TEXT;
ALTER TABLE users ADD COLUMN tg_username TEXT;
ALTER TABLE users ADD COLUMN tg_first_name TEXT;
ALTER TABLE users ADD COLUMN tg_last_name TEXT;
