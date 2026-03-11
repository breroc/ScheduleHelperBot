# ZJU Schedule Bot

A fast, production-style Telegram bot for ZJU language-program schedules.

It is built on Cloudflare Workers with pure JavaScript and is designed for one job: make daily schedule checks, reminders, and group switching simple inside Telegram.

## Overview

ZJU Schedule Bot gives students a cleaner alternative to checking screenshots or timetable files manually.

With the bot, users can:

- check `Today`, `Tomorrow`, `Full week`, and `Next class`
- receive reminder notifications before lessons
- get a morning digest with weather and schedule summary
- receive an evening preview for the next day
- save up to 2 favorite groups
- add personal notes to lesson slots
- manage settings through inline menus

The project keeps the runtime simple:

- timetable data is bundled in [`schedule-data.js`](./schedule-data.js)
- user state lives in Cloudflare D1
- no external npm libraries are used

## Preview

### Core experience

The main flow is built for fast daily use: select a group once, open today's classes in one tap, and get a clean preview for tomorrow in the evening.

<table>
  <tr>
    <td align="center">
      <img src="./docs/screenshots/group-selection.png" alt="Group selection and main menu" width="260" />
      <br />
      <strong>Choose a group and start immediately</strong>
    </td>
    <td align="center">
      <img src="./docs/screenshots/today-view.png" alt="Today view" width="260" />
      <br />
      <strong>Check today with live lesson status</strong>
    </td>
    <td align="center">
      <img src="./docs/screenshots/evening-preview.png" alt="Evening preview" width="260" />
      <br />
      <strong>See tomorrow before the day starts</strong>
    </td>
  </tr>
</table>

### Personal tools

The bot also includes a lightweight personal layer: inline settings, pinned favorite groups, and lesson notes that appear directly inside schedule views and reminders.

<table>
  <tr>
    <td align="center">
      <img src="./docs/screenshots/inline-settings.png" alt="Inline settings" width="260" />
      <br />
      <strong>Manage settings without chat clutter</strong>
    </td>
    <td align="center">
      <img src="./docs/screenshots/today-with-note.png" alt="Today view with lesson note" width="260" />
      <br />
      <strong>Attach personal notes to lesson slots</strong>
    </td>
    <td align="center">
      <img src="./docs/screenshots/favorites-view.png" alt="Favorites quick view" width="260" />
      <br />
      <strong>Open pinned groups in one tap</strong>
    </td>
  </tr>
</table>

## Highlights

- built on **Cloudflare Workers**
- **Telegram webhook** mode only
- **D1** for users, settings, notes, and delivery stats
- static timetable source for fast schedule responses
- **RU / EN / ZH** interface
- reply-keyboard main menu
- inline settings flow where it is already stable
- personal lesson notes integrated into schedule and reminder flows

## Supported Groups

`1-7`, `2-1`, `2-2`, `2-4`, `2-6`, `2-7`, `2-8`, `3-4`, `3-6`, `4-3`, `4-4`, `4-6`, `4-7`, `5-2`, `6-2`

If your group is not available yet, contact `@thcalmdx`.

## User Features

### Schedule

- `📅 Today` - today's schedule with live lesson status
- `📆 Tomorrow` - tomorrow's schedule
- `📖 Full week` - full weekly timetable
- `📚 Next class` - current or upcoming lesson
- quick one-off lookup for another group:
  - `/today 2-8`
  - `/tomorrow 2-8`
  - `/week 2-8`

### Notifications

- reminders before lessons
- reminder lead time: `5 min`, `10 min`, or `Off`
- temporary reminder mute for the current day
- morning digest with:
  - weather in Hangzhou
  - max temperature for today
  - weather advice
  - time until nearest class
  - today's lessons
- evening preview with:
  - tomorrow's weekday and date
  - number of lessons
  - first lesson time
  - tomorrow's schedule
  - personal notes for tomorrow's lessons

### Personalization

- choose main group
- change interface language: `RU / EN / ZH`
- choose morning digest time:
  - `07:00`
  - `07:30`
  - `08:00`
- enable or disable daily morning digests
- save up to 2 favorite groups
- add personal notes to a lesson slot

### Notes

Notes are personal and attached to:

- `chat_id`
- `group_name`
- `weekday`
- `lesson_number`

They are shown in:

- `Today`
- `Tomorrow`
- `Full week`
- `Next class`
- reminder messages
- evening preview

## Settings UX

The UI is intentionally hybrid.

- the main bot navigation stays on a reply keyboard
- `Settings` opens as an inline menu
- nested settings screens use callbacks and message editing
- note text input still uses a normal message, because the user must type content manually

### Inline Settings Currently Supported

- `Language`
- `Notifications`
- `Morning time`
- `Daily updates`
- `Manage favorites`
- `Notes` navigation
- `My settings`
- `Change group`

## Admin Features

Admin access is controlled by `ADMIN_ID`.

Available admin commands:

- `/broadcast <text>` - send a message to all active users
- `/broadcastgroup <group> <text>` - send a message to one group
- `/stats` - delivery stats and grouped user overview
- `/user <chat_id>` - detailed user card
- `/inactive` - list inactive users
- `/cleanupinactive` - remove inactive users from the database
- `/morningtest` - send the morning digest to the admin only
- `/eveningtest` - send the evening preview to the admin only

## Runtime Model

### Timetable Source

The bot does **not** read timetable data from D1 at runtime.

Schedule data is loaded from:

- [`schedule-data.js`](./schedule-data.js)

This file is the source of truth for:

- `Today`
- `Tomorrow`
- `Full week`
- `Next class`
- reminder logic
- morning digests
- evening previews

### What D1 Stores

D1 is still used for runtime state:

- users
- selected group
- language
- reminder settings
- morning settings
- favorites
- temporary reminder mute
- note-flow state
- lesson notes
- inactive user state
- delivery statistics
- admin report markers

## Project Structure

| File | Responsibility |
| --- | --- |
| [`worker.js`](./worker.js) | Worker entrypoint, webhook auth, fetch and scheduled handlers |
| [`bot.js`](./bot.js) | Telegram routing, commands, text handlers, inline callbacks |
| [`db.js`](./db.js) | D1 access layer, settings, notes, stats, schema helpers |
| [`schedule-data.js`](./schedule-data.js) | Static timetable source |
| [`formatters.js`](./formatters.js) | User-facing message formatting |
| [`translations.js`](./translations.js) | RU / EN / ZH strings |
| [`utils.js`](./utils.js) | Timezone, weather, lesson status, helper utilities |
| [`cron.js`](./cron.js) | Morning digest, evening preview, reminder cron logic |
| [`telegram.js`](./telegram.js) | Telegram Bot API helpers |
| [`wrangler.jsonc`](./wrangler.jsonc) | Cloudflare Worker config |

## Cloudflare Setup

### Required Runtime Secrets

- `BOT_TOKEN`
- `WEBHOOK_SECRET` (recommended)

### Required Vars / Bindings

- `ADMIN_ID`
- `WEBHOOK_PATH`
- `DB`

Current project defaults:

- Worker name: `schedulehelperbot`
- entry file: `worker.js`
- D1 binding: `DB`
- default webhook path: `telegram`

Important:

- `BOT_TOKEN` and `WEBHOOK_SECRET` must be stored as **runtime secrets**
- do not put Telegram secrets into `wrangler.jsonc`

## Webhook Behavior

Accepted routes:

- `GET /` -> `Schedule Helper Bot is running`
- `GET /health` -> `ok`
- `POST /<WEBHOOK_PATH>` -> Telegram webhook endpoint

Webhook protection:

- the path must match `WEBHOOK_PATH`
- if `WEBHOOK_SECRET` is set, header `X-Telegram-Bot-Api-Secret-Token` must match

There is no polling mode in this project.

## Cron Schedule

All bot logic works in `Asia/Shanghai`.

Current `wrangler.jsonc` cron setup:

| UTC cron | Shanghai time | Purpose |
| --- | --- | --- |
| `*/30 23 * * *` | `07:00` and `07:30` | morning digest slots |
| `0 0 * * *` | `08:00` | morning digest slot |
| `0 12 * * *` | `20:00` | evening preview |
| `5 12 * * *` | `20:05` | admin daily report |
| `*/2 * * * *` | every 2 minutes | lesson reminders |

### Morning Digest Rules

Morning digests are sent only to users who:

- have a selected group
- have `morning_enabled = 1`
- match their selected `morning_time`
- were not already sent today

### Evening Preview Rules

Evening previews are sent to active users with a selected group.

They are independent from `morning_enabled`.

### Reminder Rules

Reminder cron:

- checks every 2 minutes
- respects `notifications_enabled`
- respects `reminder_minutes`
- respects `reminder_mute_until_date`
- prevents duplicates through `last_reminder_key`
- includes a personal lesson note if one exists for that lesson slot

## Manual D1 Preparation

This project no longer relies on hot-path schema initialization.

Prepare the database manually before production deploy.

### Existing Base Tables Expected

- `users`
- `announcements`

### `users` Columns Used by the Bot

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

### `announcements` Compatibility

If your `announcements` table is older, make sure these columns exist:

```sql
ALTER TABLE announcements ADD COLUMN kind TEXT;
ALTER TABLE announcements ADD COLUMN text TEXT;
```

### Required Service Tables

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
- SQLite / D1 will fail on duplicate columns, which is expected

## Updating Schedule Data

All timetable maintenance now happens in [`schedule-data.js`](./schedule-data.js).

### Expected Lesson Shape

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

### Update Workflow

1. collect timetable rows for a group
2. update that group in `schedule-data.js`
3. commit and deploy
4. verify through:
   - `Today`
   - `Tomorrow`
   - `Full week`
   - `Next class`

### Built-in Validation

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
5. deploy the latest version

### Set Webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://<your-worker-domain>/<WEBHOOK_PATH>" \
  -d "secret_token=<YOUR_WEBHOOK_SECRET>"
```

### Check Webhook

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Expected result:

- correct Worker URL
- no `last_error_message`

## Health and Troubleshooting

### Quick Checks

- `GET /` -> worker is alive
- `GET /health` -> health probe
- `/start` -> group selection or main menu
- `/help` -> current user-facing capability overview

### Common Failure Points

- bot does not answer:
  - check that `BOT_TOKEN` exists as a runtime secret
  - verify webhook URL with `getWebhookInfo`
- webhook returns `403`:
  - check `WEBHOOK_SECRET`
  - check `WEBHOOK_PATH`
- schedule is empty for a group:
  - confirm the group exists in `CONFIG.GROUPS`
  - confirm the group has rows in `schedule-data.js`
- reminders or stats look wrong:
  - verify missing D1 columns were added manually

### Useful Logs

The worker logs compact events such as:

- `webhook_request`
- `scheduled_event`
- `morning_cron_summary`
- `reminder_cron_summary`
- `evening_cron_summary`
- `callback_query_error`
- D1 warning or error logs for migrations and note storage

## Notes

This repository is intentionally structured like a production bot, but kept readable enough for manual schedule maintenance and incremental feature work.
