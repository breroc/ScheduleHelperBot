# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, adapted to the actual release workflow
of this repository.

## [1.0.0] - 2026-03-12

### Added

- Stable Telegram bot release on Cloudflare Workers
- Webhook-based runtime with protected webhook path and secret validation
- Main schedule actions:
  - Today
  - Tomorrow
  - Full week
  - Next class
- Static bundled timetable source in `schedule-data.js`
- Supported groups:
  - `1-7`
  - `2-1`
  - `2-2`
  - `2-4`
  - `2-6`
  - `2-7`
  - `2-8`
  - `3-4`
  - `3-6`
  - `4-3`
  - `4-4`
  - `4-6`
  - `4-7`
  - `5-2`
  - `6-2`
- RU / EN / ZH interface
- Favorite groups and quick access
- Personal lesson notes
- Reminder settings and temporary reminder mute
- Morning digest with weather and max daily temperature
- Evening preview for tomorrow
- Inline settings flow for:
  - language
  - notifications
  - morning time
  - daily updates
  - favorites management
  - notes navigation
  - group change
  - my settings
- Admin commands:
  - `/broadcast`
  - `/broadcastgroup`
  - `/stats`
  - `/user`
  - `/inactive`
  - `/cleanupinactive`
  - `/morningtest`
  - `/eveningtest`

### Changed

- Moved schedule runtime source away from D1 and into static project data
- Improved settings UX with inline callback navigation
- Improved admin stats formatting and inactive-user handling
- Updated project documentation for the current production workflow

### Fixed

- Duplicate reminder protection
- Safer webhook handling and callback fallbacks
- Cleaner evening preview delivery logic
- Faster schedule responses through static timetable lookup

