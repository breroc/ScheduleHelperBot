# ScheduleHelperBot (Cloudflare Workers)

Production-like Telegram schedule bot on **Cloudflare Workers** with these features:
- group selection (`1-7`, `2-1`, `2-4`, `2-6`, `2-7`, `2-8`, `3-4`, `3-6`, `4-4`, `4-6`, `4-7`, `5-2`, `6-2`)
- today / tomorrow / full week / next class
- quick group commands `/today 2-8`, `/tomorrow 2-8`, `/week 2-8`
- RU/EN language
- reminder settings (5 min / 10 min / off)
- pinned favorite groups
- personal lesson notes via settings buttons
- custom morning message time (`07:00`, `07:30`, `08:00`)
- temporary reminder mute until tomorrow
- my settings
- admin broadcast and stats
- `/help` command with all functions
- morning cron message with Hangzhou weather
- evening preview of tomorrow schedule
- automatic admin daily delivery report (morning/reminders/evening)
- reminder cron every 2 minutes
- D1 storage for users, settings and delivery stats

No npm libraries are used.

## Project structure

- `worker.js` - Worker entrypoint (`fetch`, `scheduled`)
- `bot.js` - Telegram command/text router
- `db.js` - D1 data access + schema checks/migrations
- `schedule-data.js` - primary static timetable source used by bot commands and cron
- `formatters.js` - UI formatting for readable bot messages
- `translations.js` - RU/EN strings and labels
- `utils.js` - timezone/date/status/weather helpers
- `cron.js` - morning cron + reminders cron
- `telegram.js` - Telegram Bot API transport
- `migrations/001_users_add_bot_fields.sql` - SQL migration (if your `users` table misses fields)

## Required env/bindings

Worker bindings:
- `BOT_TOKEN` (Telegram bot token)
- `DB` (D1 binding)
- `ADMIN_ID` (Telegram numeric chat id of admin)
- `WEBHOOK_PATH` (default webhook path, for example `telegram`)
- `WEBHOOK_SECRET` (optional secret token for Telegram webhook verification)

Configured in `wrangler.jsonc`:
- `main: worker.js`
- D1 binding name `DB`
- cron triggers:
  - `*/30 23 * * *` (07:00 and 07:30 Asia/Shanghai morning message)
  - `0 0 * * *` (08:00 Asia/Shanghai morning message)
  - `0 12 * * *` (20:00 Asia/Shanghai tomorrow preview)
  - `5 12 * * *` (20:05 Asia/Shanghai daily admin report)
  - `*/2 * * * *` (upcoming reminders)

## D1 migration (if needed)

If your current `users` table is missing bot fields, run:

```sql
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
```

Notes:
- Run only statements for columns that are currently missing.
- Runtime schema checks are available in `db.js`, but hot path no longer waits for them on every request.

## Static timetable source

The bot now reads timetable data from `schedule-data.js`.

- commands and cron jobs use local static schedule data
- D1 is still used for users, settings, notification state and delivery stats
- the legacy `schedule` table is no longer required for runtime timetable reads

### How to update schedule

1. Export rows for a group from D1 or prepare them manually.
2. Add/update that group's lessons in `schedule-data.js`.
3. Keep fields in this shape:
   - `group_name`
   - `day_of_week` (`monday` ... `sunday`)
   - `lesson_number`
   - `subject`
   - `teacher`
   - `classroom`
   - `start_time`
   - `end_time`
4. Deploy latest Worker version.

### Built-in validation

On load, `db.js` validates `schedule-data.js` and logs:
- invalid or missing `group_name`
- invalid weekday values
- invalid time format
- `start_time >= end_time`
- missing subject
- duplicate lessons
- supported groups that still have no static schedule

## Timezone behavior

All schedule logic is calculated in `Asia/Shanghai`:
- today / tomorrow
- next class
- lesson status
- reminder windows
- morning schedule

## Cron behavior

### Morning cron (`*/30 23 * * *`, `0 0 * * *` UTC)
At `07:00`, `07:30`, or `08:00` Shanghai local time bot sends:
- greeting
- Hangzhou weather (Open-Meteo)
- weather advice
- time until first class
- today schedule

If weather API is unavailable, message is still sent without weather block.

### Evening preview cron (`0 12 * * *` UTC)
At 20:00 Shanghai local time bot sends a short \"tomorrow preview\" to users with selected groups.

### Reminder cron (`*/2 * * * *`)
Every 2 minutes:
- checks users with notifications enabled
- finds lessons near configured reminder time (5 or 10 min)
- sends reminder once per lesson/user (`last_reminder_key` anti-duplicate)
- includes personal lesson note if user saved one for that weekday and lesson

### Admin daily report cron (`5 12 * * *` UTC)
At 20:05 Shanghai local time admin receives automatic report:
- how many users got morning messages
- how many reminders were sent
- how many users got evening preview

## Telegram webhook setup

After deploy, set Telegram webhook to Worker URL:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://<your-worker-domain>/<WEBHOOK_PATH>" \
  -d "secret_token=<YOUR_WEBHOOK_SECRET>"
```

## Deploy via Cloudflare + GitHub

1. Push this repo to GitHub (`ScheduleHelperBot`).
2. In Cloudflare Dashboard: `Workers & Pages` -> `Create` -> `Import a repository`.
3. Select repo and set build as Worker project (no build command needed).
4. Configure environment variables/secrets:
   - `BOT_TOKEN`
   - `ADMIN_ID`
5. Configure D1 binding `DB` to your database.
6. Ensure cron triggers from `wrangler.jsonc` are present.
7. Deploy.
8. Set webhook URL to deployed Worker endpoint.

## Admin commands

- `/broadcast <text>` - sends message to all users
- `/broadcastgroup <group> <text>` - sends message to one group
- `/stats` - total users, users by group, enabled notifications + today's delivery stats
- `/user <chat_id>` - admin card for one user
- `/today <group>` - quick one-time today schedule for any supported group
- `/tomorrow <group>` - quick one-time tomorrow schedule for any supported group
- `/week <group>` - quick one-time full week for any supported group
- `/help` - command/help overview

Only `ADMIN_ID` can use these commands.
