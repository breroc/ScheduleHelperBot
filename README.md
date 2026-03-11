# ScheduleHelperBot

Telegram schedule bot for ZJU language-course groups, built on Cloudflare Workers with pure JavaScript.

It gives users a clean daily schedule flow, reminders before classes, morning and evening digests, favorite groups, personal lesson notes, and admin tools for broadcasts and stats.

## Highlights

- Cloudflare Workers runtime
- Telegram webhook mode
- D1 for users, settings, notes, and delivery stats
- Static timetable source in `schedule-data.js`
- Pure JavaScript, no npm libraries
- RU / EN / ZH interface
- Main menu with reply keyboard
- Settings flow migrated to inline callbacks where it is safe

## Supported groups

`1-7`, `2-1`, `2-2`, `2-4`, `2-6`, `2-7`, `2-8`, `3-4`, `3-6`, `4-3`, `4-4`, `4-6`, `4-7`, `5-2`, `6-2`

## What users can do

### Main schedule actions

- `Today` - schedule for today with live lesson status
- `Tomorrow` - schedule for tomorrow
- `Full week` - full weekly timetable
- `Next class` - current or upcoming lesson
- quick one-off checks for another group:
  - `/today 2-8`
  - `/tomorrow 2-8`
  - `/week 2-8`

### Personalization

- choose main group
- switch language: RU / EN / ZH
- set reminders: `5 min`, `10 min`, or `Off`
- choose morning digest time: `07:00`, `07:30`, `08:00`
- enable or disable morning digests
- mute reminders until tomorrow with `/mutetoday`
- save up to 2 favorite groups
- add personal notes to a weekday + lesson slot

### Notes

Lesson notes are personal and attached to:

- user
- group
- weekday
- lesson number

Notes appear in:

- `Today`
- `Tomorrow`
- `Full week`
- `Next class`
- reminder messages
- evening preview for tomorrow

### Favorites

Users can pin up to 2 groups and then quickly open them from `⭐ Favorites` in the main menu.

## Settings UX

The bot currently uses a hybrid interface on purpose:

- main navigation stays on a reply keyboard
- `Settings` opens as an inline message with callback buttons
- nested settings screens use message editing where it is already stable
- note text input stays as a regular text message, because the user still needs to type content manually

### Inline settings currently supported

- `Language`
- `Notifications`
- `Morning time`
- `Daily updates`
- `Manage favorites`
- `Notes` navigation
- `My settings`
- `Change group`

## Admin tools

Admin access is controlled by `ADMIN_ID`.

Available admin commands:

- `/broadcast <text>` - send to all active users
- `/broadcastgroup <group> <text>` - send to one group
- `/stats` - totals, delivery stats, grouped user list
- `/user <chat_id>` - detailed user card
- `/inactive` - list inactive users
- `/cleanupinactive` - remove inactive users from the database
- `/morningtest` - send morning digest to admin only
- `/eveningtest` - send evening preview to admin only

## Runtime model

### Source of truth for timetable

The bot does **not** read schedule data from D1 at runtime anymore.

Timetable data is loaded from:

- [`schedule-data.js`](./schedule-data.js)

That file is the primary source for:

- `Today`
- `Tomorrow`
- `Full week`
- `Next class`
- morning digests
- evening previews
- reminder logic

### What D1 is still used for

D1 stores runtime state only:

- users
- selected group
- language
- notification settings
- morning settings
- favorites
- temporary mute state
- note-flow state
- lesson notes
- inactive user tracking
- delivery statistics
- admin report markers

## Project structure

| File | Responsibility |
| --- | --- |
| [`worker.js`](./worker.js) | Worker entrypoint, webhook auth, fetch + scheduled handlers |
| [`bot.js`](./bot.js) | Telegram update router, commands, text handlers, inline callbacks |
| [`db.js`](./db.js) | D1 access layer, schema helper, user/settings/note/stat queries |
| [`schedule-data.js`](./schedule-data.js) | Static timetable source |
| [`formatters.js`](./formatters.js) | User-facing message formatting |
| [`translations.js`](./translations.js) | RU / EN / ZH strings |
| [`utils.js`](./utils.js) | Timezone, status, weather, helper utilities |
| [`cron.js`](./cron.js) | Morning digest, evening preview, reminder cron logic |
| [`telegram.js`](./telegram.js) | Telegram Bot API transport helpers |
| [`migrations/001_users_add_bot_fields.sql`](./migrations/001_users_add_bot_fields.sql) | Historical migration reference |

## Cloudflare bindings and secrets

### Required runtime secrets

- `BOT_TOKEN`
- `WEBHOOK_SECRET` (recommended)

### Required vars / bindings

- `ADMIN_ID`
- `WEBHOOK_PATH`
- `DB`

Current `wrangler.jsonc` uses:

- Worker name: `schedulehelperbot`
- entry: `worker.js`
- D1 binding name: `DB`
- default webhook path: `telegram`

Important:

- `BOT_TOKEN` and `WEBHOOK_SECRET` should be stored as **runtime secrets**, not plain vars
- if these are missing in production, the bot will deploy but not behave correctly

## Webhook behavior

The worker accepts:

- `GET /` -> `Schedule Helper Bot is running`
- `GET /health` -> `ok`
- `POST /<WEBHOOK_PATH>` -> Telegram webhook endpoint

Webhook protection:

- path must match `WEBHOOK_PATH`
- if `WEBHOOK_SECRET` is set, header `X-Telegram-Bot-Api-Secret-Token` must match

There is no polling mode in this project.

## Cron schedule

All business logic runs in `Asia/Shanghai`.

Current cron setup in `wrangler.jsonc`:

| UTC cron | Shanghai time | Purpose |
| --- | --- | --- |
| `*/30 23 * * *` | `07:00` and `07:30` | morning digest slots |
| `0 0 * * *` | `08:00` | morning digest slot |
| `0 12 * * *` | `20:00` | evening preview |
| `5 12 * * *` | `20:05` | admin daily report |
| `*/2 * * * *` | every 2 minutes | lesson reminders |

### Morning digest

Sent only to users who:

- have a selected group
- have `morning_enabled = 1`
- matched their selected `morning_time`
- were not already sent today

Morning digest contains:

- greeting
- Hangzhou weather
- max temperature for today
- weather advice
- time until nearest class
- today schedule

### Evening preview

Sent to active users with a selected group.

Evening preview contains:

- tomorrow weekday and date
- number of classes tomorrow
- first class time
- tomorrow lessons
- personal notes for tomorrow's lessons, if present

Evening preview is independent from `morning_enabled`.

### Reminders

Reminder cron:

- checks every 2 minutes
- respects `notifications_enabled`
- respects `reminder_minutes`
- respects `reminder_mute_until_date`
- prevents duplicates via `last_reminder_key`
- includes personal lesson note if one exists for that slot

## Manual D1 preparation

This project no longer relies on hot-path schema initialization.

Prepare the database manually before production deploy.

### Existing tables expected

The code expects these base tables to exist:

- `users`
- `announcements`

### `users` columns used by the bot

If your `users` table is older, add only the missing columns.

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
ALTER TABLE users ADD COLUMN bot_fingerprint TEXT;
ALTER TABLE users ADD COLUMN tg_username TEXT;
ALTER TABLE users ADD COLUMN tg_first_name TEXT;
ALTER TABLE users ADD COLUMN tg_last_name TEXT;
ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN last_seen_at TEXT;
ALTER TABLE users ADD COLUMN deactivated_at TEXT;
```

### `announcements` compatibility

If your `announcements` table is older, make sure these columns exist:

```sql
ALTER TABLE announcements ADD COLUMN kind TEXT;
ALTER TABLE announcements ADD COLUMN text TEXT;
```

### Required service tables

```sql
CREATE TABLE IF NOT EXISTS delivery_stats (
  date_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (date_key, kind)
);

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

CREATE INDEX IF NOT EXISTS idx_delivery_stats_date_key ON delivery_stats(date_key);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_lookup ON lesson_notes(chat_id, group_name, weekday, lesson_number);
```

Notes:

- run `ALTER TABLE ... ADD COLUMN` statements one by one if you are not sure which columns already exist
- SQLite/D1 will fail on duplicate columns, which is expected

## Updating schedule data

All timetable maintenance should now happen in [`schedule-data.js`](./schedule-data.js).

### Expected lesson shape

```js
{
  group_name: '2-7',
  day_of_week: 'monday',
  lesson_number: 1,
  subject: 'Intermediate Chinese Reading II',
  teacher: 'Zhang Xizhi',
  classroom: '31-105',
  start_time: '08:00',
  end_time: '09:30'
}
```

### Update workflow

1. collect timetable rows for a group
2. update that group in `schedule-data.js`
3. commit and deploy
4. verify the group through:
   - `Today`
   - `Tomorrow`
   - `Full week`
   - `Next class`

### Built-in validation

`db.js` validates static schedule data on load and logs warnings for:

- missing or invalid `group_name`
- invalid weekday values
- invalid time format
- `start_time >= end_time`
- missing subject
- duplicate lessons
- supported groups with no static schedule rows

## Deployment

### Deploy from GitHub to Cloudflare Workers

1. push the repository to GitHub
2. import it in `Workers & Pages`
3. set deploy command:

```bash
npx wrangler deploy --config wrangler.jsonc
```

4. configure:
   - runtime secret `BOT_TOKEN`
   - runtime secret `WEBHOOK_SECRET`
   - var `ADMIN_ID`
   - var `WEBHOOK_PATH`
   - D1 binding `DB`
5. deploy latest version

### Set webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://<your-worker-domain>/<WEBHOOK_PATH>" \
  -d "secret_token=<YOUR_WEBHOOK_SECRET>"
```

### Check webhook

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

You want to see:

- correct Worker URL
- no `last_error_message`

## Health and troubleshooting

### Quick checks

- `GET /` -> worker is alive
- `GET /health` -> health probe
- `/start` -> group selection or main menu
- `/help` -> user-facing capability overview

### Common failure points

- bot does not answer:
  - check that `BOT_TOKEN` exists as a runtime secret
  - verify webhook URL with `getWebhookInfo`
- webhook returns `403`:
  - check `WEBHOOK_SECRET`
  - check `WEBHOOK_PATH`
- schedule is empty for a group:
  - confirm that group exists in `CONFIG.GROUPS`
  - confirm that group has rows in `schedule-data.js`
- reminders or stats look wrong:
  - verify missing D1 columns were added manually

### Useful logs

The worker logs compact events such as:

- `webhook_request`
- `scheduled_event`
- `morning_cron_summary`
- `reminder_cron_summary`
- `evening_cron_summary`
- `callback_query_error`
- D1 warning/error logs for migrations and note storage

## License / notes

This repository is structured as a production-style bot, but kept intentionally readable for maintenance and manual schedule updates.
