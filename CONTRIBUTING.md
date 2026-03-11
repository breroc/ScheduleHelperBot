# Contributing

This project is maintained conservatively.

The priority is:

1. keep the bot stable,
2. keep the code readable,
3. avoid breaking user-facing behavior.

## Before changing anything

- Read [README.md](./README.md).
- Do not rewrite working flows without a clear reason.
- Prefer small, verifiable changes over large refactors.
- Keep Cloudflare Workers compatibility.
- Do not introduce npm libraries unless there is a strong reason.

## Project rules

- Main runtime: Cloudflare Workers
- Language: plain JavaScript
- Timetable source: `schedule-data.js`
- User state: D1
- Main menu: reply keyboard
- Settings flow: inline where already supported

## Adding or updating a group

Schedule updates should follow the existing workflow:

1. add the group to `CONFIG.GROUPS` in [`utils.js`](./utils.js),
2. add the group schedule to [`schedule-data.js`](./schedule-data.js),
3. update the supported group list in [README.md](./README.md),
4. verify:
   - `Today`
   - `Tomorrow`
   - `Full week`
   - `Next class`

Each lesson entry in `schedule-data.js` should use this shape:

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

## Code style

- Keep changes minimal and explicit.
- Prefer ASCII unless the file already uses another script.
- Do not remove fallback logic unless you can prove it is unused.
- If a path looks strange but is already working in production, avoid aggressive cleanup.

## Testing checklist

At minimum, verify the relevant flow manually:

- `/start`
- group selection
- `Today`
- `Tomorrow`
- `Full week`
- `Next class`
- `Settings`
- webhook health
- related cron behavior if your change touches reminders or digests

For admin-related changes, also verify:

- `/stats`
- `/broadcast` or `/broadcastgroup`
- inactive-user handling if affected

## Pull request / patch expectations

Good contributions are:

- narrow in scope,
- easy to review,
- explicit about runtime impact,
- documented if they change user-visible behavior.

If a change requires new D1 columns or tables, include the SQL clearly.
