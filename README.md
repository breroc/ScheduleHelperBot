# ScheduleHelperBot (Cloudflare Workers)

Production-like Telegram schedule bot on **Cloudflare Workers** with these features:
- group selection (`2-6`, `2-7`, `2-8`, `3-4`, `4-6`, `4-7`, `5-2`, `6-2`)
- today / tomorrow / full week / next class
- quick group command `/today 2-8` (without changing your selected group)
- RU/EN language
- reminder settings (5 min / 10 min / off)
- my settings
- admin broadcast and stats
- `/help` command with all functions
- morning cron message with Hangzhou weather
- evening preview of tomorrow schedule
- automatic admin daily delivery report (morning/reminders/evening)
- reminder cron every 2 minutes
- D1 storage

No npm libraries are used.

## Project structure

- `worker.js` - Worker entrypoint (`fetch`, `scheduled`)
- `bot.js` - Telegram command/text router
- `db.js` - D1 data access + schema checks/migrations
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
  - `0 23 * * *` (07:00 Asia/Shanghai morning message)
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
ALTER TABLE users ADD COLUMN morning_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN last_morning_sent TEXT;
ALTER TABLE users ADD COLUMN last_reminder_key TEXT;
ALTER TABLE users ADD COLUMN last_evening_sent TEXT;
```

Notes:
- Run only statements for columns that are currently missing.
- The worker also contains runtime schema checks in `db.js`.

## Timezone behavior

All schedule logic is calculated in `Asia/Shanghai`:
- today / tomorrow
- next class
- lesson status
- reminder windows
- morning schedule

## Cron behavior

### Morning cron (`0 23 * * *` UTC)
At 07:00 Shanghai local time bot sends:
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
- `/stats` - total users, users by group, enabled notifications + today's delivery stats
- `/today <group>` - quick one-time today schedule for any supported group
- `/help` - command/help overview

Only `ADMIN_ID` can use these commands.
