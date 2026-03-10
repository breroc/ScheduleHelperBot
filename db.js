import { CONFIG, normalizeWeekdayValue } from './utils.js';
import { STATIC_SCHEDULE } from './schedule-data.js';

let schemaReadyPromise;
const staticScheduleState = buildStaticScheduleState(STATIC_SCHEDULE);

const USER_COLUMN_MIGRATIONS = [
  {
    name: 'group_name',
    sql: 'ALTER TABLE users ADD COLUMN group_name TEXT'
  },
  {
    name: 'language',
    sql: `ALTER TABLE users ADD COLUMN language TEXT NOT NULL DEFAULT '${CONFIG.DEFAULT_LANGUAGE}'`
  },
  {
    name: 'notifications_enabled',
    sql: 'ALTER TABLE users ADD COLUMN notifications_enabled INTEGER NOT NULL DEFAULT 1'
  },
  {
    name: 'reminder_minutes',
    sql: `ALTER TABLE users ADD COLUMN reminder_minutes INTEGER NOT NULL DEFAULT ${CONFIG.DEFAULT_REMINDER_MINUTES}`
  },
  {
    name: 'morning_enabled',
    sql: 'ALTER TABLE users ADD COLUMN morning_enabled INTEGER NOT NULL DEFAULT 1'
  },
  {
    name: 'last_morning_sent',
    sql: 'ALTER TABLE users ADD COLUMN last_morning_sent TEXT'
  },
  {
    name: 'last_reminder_key',
    sql: 'ALTER TABLE users ADD COLUMN last_reminder_key TEXT'
  },
  {
    name: 'last_evening_sent',
    sql: 'ALTER TABLE users ADD COLUMN last_evening_sent TEXT'
  },
  {
    name: 'bot_fingerprint',
    sql: 'ALTER TABLE users ADD COLUMN bot_fingerprint TEXT'
  },
  {
    name: 'tg_username',
    sql: 'ALTER TABLE users ADD COLUMN tg_username TEXT'
  },
  {
    name: 'tg_first_name',
    sql: 'ALTER TABLE users ADD COLUMN tg_first_name TEXT'
  },
  {
    name: 'tg_last_name',
    sql: 'ALTER TABLE users ADD COLUMN tg_last_name TEXT'
  }
];

export async function ensureSchema(db) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = migrateSchema(db).catch((error) => {
      schemaReadyPromise = undefined;
      throw error;
    });
  }
  return schemaReadyPromise;
}

async function migrateSchema(db) {
  const hasUsers = await tableExists(db, 'users');
  const hasAnnouncements = await tableExists(db, 'announcements');
  if (!hasUsers || !hasAnnouncements) {
    throw new Error(
      `required_tables_missing users=${hasUsers} announcements=${hasAnnouncements}`
    );
  }

  const userColumns = await getTableColumns(db, 'users');
  for (const migration of USER_COLUMN_MIGRATIONS) {
    if (!userColumns.has(migration.name)) {
      await runSql(db, migration.sql);
    }
  }

  await runSqlSafe(db, 'CREATE INDEX IF NOT EXISTS idx_users_group_name ON users(group_name)');
  await runSqlSafe(db, 'CREATE INDEX IF NOT EXISTS idx_users_notifications_enabled ON users(notifications_enabled)');
  await runSqlSafe(
    db,
    'CREATE TABLE IF NOT EXISTS delivery_stats (date_key TEXT NOT NULL, kind TEXT NOT NULL, sent_count INTEGER NOT NULL DEFAULT 0, failed_count INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (date_key, kind))'
  );
  await runSqlSafe(db, 'CREATE INDEX IF NOT EXISTS idx_delivery_stats_date_key ON delivery_stats(date_key)');
}

async function getTableColumns(db, tableName) {
  const sql = `PRAGMA table_info(${tableName})`;
  const { results } = await db.prepare(sql).all();
  const columns = new Set();

  for (const row of results ?? []) {
    if (typeof row.name === 'string') {
      columns.add(row.name);
    }
  }

  return columns;
}

async function tableExists(db, tableName) {
  const row = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1")
    .bind(tableName)
    .first();

  return Boolean(row?.name);
}

export async function ensureUserWithMeta(db, chatId, language, botFingerprint = '', telegramProfile = null) {
  const insertResult = await db
    .prepare('INSERT INTO users (chat_id, language, bot_fingerprint) VALUES (?, ?, ?) ON CONFLICT(chat_id) DO NOTHING')
    .bind(chatId, language, botFingerprint || null)
    .run();
  const isNewUser = Number(insertResult?.meta?.changes ?? 0) > 0;

  if (botFingerprint) {
    const row = await db
      .prepare('SELECT bot_fingerprint FROM users WHERE chat_id = ?')
      .bind(chatId)
      .first();

    const storedFingerprint = String(row?.bot_fingerprint ?? '');
    if (!storedFingerprint || storedFingerprint !== botFingerprint) {
      await db
        .prepare(
          'UPDATE users SET bot_fingerprint = ?, group_name = NULL, last_morning_sent = NULL, last_reminder_key = NULL, last_evening_sent = NULL WHERE chat_id = ?'
        )
        .bind(botFingerprint, chatId)
        .run();
    }
  }

  if (telegramProfile) {
    await updateUserTelegramProfile(db, chatId, telegramProfile);
  }

  const user = await getUser(db, chatId);
  return {
    user,
    isNewUser
  };
}

export async function getUser(db, chatId) {
  const user = await db.prepare('SELECT * FROM users WHERE chat_id = ?').bind(chatId).first();
  if (!user) {
    return null;
  }

  return {
    chat_id: Number(user.chat_id),
    group_name: user.group_name ?? null,
    language: user.language ?? CONFIG.DEFAULT_LANGUAGE,
    notifications_enabled: Number(user.notifications_enabled ?? 1),
    reminder_minutes: Number(user.reminder_minutes ?? CONFIG.DEFAULT_REMINDER_MINUTES),
    morning_enabled: Number(user.morning_enabled ?? 1),
    last_morning_sent: user.last_morning_sent ?? null,
    last_reminder_key: user.last_reminder_key ?? null,
    last_evening_sent: user.last_evening_sent ?? null,
    bot_fingerprint: user.bot_fingerprint ?? null,
    tg_username: user.tg_username ?? null,
    tg_first_name: user.tg_first_name ?? null,
    tg_last_name: user.tg_last_name ?? null
  };
}

export async function updateUserTelegramProfile(db, chatId, profile) {
  const username = normalizeOptionalText(profile.username);
  const firstName = normalizeOptionalText(profile.first_name);
  const lastName = normalizeOptionalText(profile.last_name);

  try {
    await db
      .prepare('UPDATE users SET tg_username = ?, tg_first_name = ?, tg_last_name = ? WHERE chat_id = ?')
      .bind(username, firstName, lastName, chatId)
      .run();
  } catch (error) {
    console.error('update_user_profile_error', { chatId, error: String(error) });
  }
}

export async function setUserGroup(db, chatId, groupName) {
  await db.prepare('UPDATE users SET group_name = ? WHERE chat_id = ?').bind(groupName, chatId).run();
}

export async function setUserLanguage(db, chatId, language) {
  await db.prepare('UPDATE users SET language = ? WHERE chat_id = ?').bind(language, chatId).run();
}

export async function setUserNotifications(db, chatId, enabled, reminderMinutes) {
  await db
    .prepare('UPDATE users SET notifications_enabled = ?, reminder_minutes = ? WHERE chat_id = ?')
    .bind(enabled, reminderMinutes, chatId)
    .run();
}

export async function setUserMorningEnabled(db, chatId, enabled) {
  await db
    .prepare('UPDATE users SET morning_enabled = ? WHERE chat_id = ?')
    .bind(enabled, chatId)
    .run();
}

export async function setLastMorningSent(db, chatId, dateKey) {
  await db
    .prepare('UPDATE users SET last_morning_sent = ? WHERE chat_id = ?')
    .bind(dateKey, chatId)
    .run();
}

export async function setLastReminderKey(db, chatId, reminderKey) {
  await db
    .prepare('UPDATE users SET last_reminder_key = ? WHERE chat_id = ?')
    .bind(reminderKey, chatId)
    .run();
}

export async function setLastEveningSent(db, chatId, dateKey) {
  await db
    .prepare('UPDATE users SET last_evening_sent = ? WHERE chat_id = ?')
    .bind(dateKey, chatId)
    .run();
}

export async function getAllUsers(db) {
  const { results } = await db.prepare('SELECT chat_id, language FROM users').all();
  return (results ?? []).map((row) => ({
    chat_id: Number(row.chat_id),
    language: row.language ?? CONFIG.DEFAULT_LANGUAGE
  }));
}

export async function getUsersByGroup(db, groupName) {
  const { results } = await db
    .prepare('SELECT chat_id, language FROM users WHERE group_name = ?')
    .bind(groupName)
    .all();

  return (results ?? []).map((row) => ({
    chat_id: Number(row.chat_id),
    language: row.language ?? CONFIG.DEFAULT_LANGUAGE
  }));
}

export async function getUsersForMorning(db) {
  const { results } = await db
    .prepare(
      'SELECT chat_id, group_name, language, morning_enabled, last_morning_sent FROM users WHERE group_name IS NOT NULL AND COALESCE(morning_enabled, 1) = 1'
    )
    .all();

  return (results ?? []).map((row) => ({
    chat_id: Number(row.chat_id),
    group_name: row.group_name,
    language: row.language ?? CONFIG.DEFAULT_LANGUAGE,
    morning_enabled: Number(row.morning_enabled ?? 1),
    last_morning_sent: row.last_morning_sent ?? null
  }));
}

export async function getUsersForReminders(db) {
  const { results } = await db
    .prepare(
      'SELECT chat_id, group_name, language, notifications_enabled, reminder_minutes, last_reminder_key FROM users WHERE group_name IS NOT NULL AND notifications_enabled = 1'
    )
    .all();

  return (results ?? []).map((row) => ({
    chat_id: Number(row.chat_id),
    group_name: row.group_name,
    language: row.language ?? CONFIG.DEFAULT_LANGUAGE,
    notifications_enabled: Number(row.notifications_enabled ?? 0),
    reminder_minutes: Number(row.reminder_minutes ?? CONFIG.DEFAULT_REMINDER_MINUTES),
    last_reminder_key: row.last_reminder_key ?? null
  }));
}

export async function getUsersForEvening(db) {
  const { results } = await db
    .prepare(
      'SELECT chat_id, group_name, language, morning_enabled, last_evening_sent FROM users WHERE group_name IS NOT NULL AND COALESCE(morning_enabled, 1) = 1'
    )
    .all();

  return (results ?? []).map((row) => ({
    chat_id: Number(row.chat_id),
    group_name: row.group_name,
    language: row.language ?? CONFIG.DEFAULT_LANGUAGE,
    morning_enabled: Number(row.morning_enabled ?? 1),
    last_evening_sent: row.last_evening_sent ?? null
  }));
}

export async function getStats(db) {
  const total = await db.prepare('SELECT COUNT(*) AS count FROM users').first();
  const notifications = await db
    .prepare('SELECT COUNT(*) AS count FROM users WHERE notifications_enabled = 1')
    .first();
  const groups = await db
    .prepare('SELECT group_name, COUNT(*) AS count FROM users WHERE group_name IS NOT NULL GROUP BY group_name ORDER BY group_name ASC')
    .all();
  let membersRows = [];

  try {
    const members = await db
      .prepare(
        'SELECT group_name, chat_id, tg_username, tg_first_name, tg_last_name FROM users WHERE group_name IS NOT NULL ORDER BY group_name ASC, chat_id ASC'
      )
      .all();
    membersRows = members.results ?? [];
  } catch (error) {
    console.error('stats_members_query_error', error);
    const fallbackMembers = await db
      .prepare('SELECT group_name, chat_id FROM users WHERE group_name IS NOT NULL ORDER BY group_name ASC, chat_id ASC')
      .all();
    membersRows = fallbackMembers.results ?? [];
  }

  const byGroupMembersMap = new Map();
  for (const row of membersRows) {
    const groupName = row.group_name;
    if (!groupName) {
      continue;
    }
    if (!byGroupMembersMap.has(groupName)) {
      byGroupMembersMap.set(groupName, []);
    }
    byGroupMembersMap.get(groupName).push({
      chat_id: Number(row.chat_id),
      tg_username: row.tg_username ?? null,
      tg_first_name: row.tg_first_name ?? null,
      tg_last_name: row.tg_last_name ?? null
    });
  }

  return {
    totalUsers: Number(total?.count ?? 0),
    notificationsEnabled: Number(notifications?.count ?? 0),
    byGroup: (groups.results ?? []).map((row) => ({
      group_name: row.group_name,
      count: Number(row.count ?? 0)
    })),
    byGroupMembers: (groups.results ?? []).map((row) => ({
      group_name: row.group_name,
      members: byGroupMembersMap.get(row.group_name) ?? []
    }))
  };
}

export async function logCronDelivery(db, dateKey, kind, sent, failed) {
  const sentValue = Number(sent ?? 0);
  const failedValue = Number(failed ?? 0);
  if (sentValue <= 0 && failedValue <= 0) {
    return;
  }

  try {
    await db
      .prepare(
        'INSERT INTO delivery_stats (date_key, kind, sent_count, failed_count) VALUES (?, ?, ?, ?) ON CONFLICT(date_key, kind) DO UPDATE SET sent_count = delivery_stats.sent_count + excluded.sent_count, failed_count = delivery_stats.failed_count + excluded.failed_count, updated_at = CURRENT_TIMESTAMP'
      )
      .bind(dateKey, kind, Math.max(0, sentValue), Math.max(0, failedValue))
      .run();
  } catch (error) {
    console.error('cron_delivery_log_error', { dateKey, kind, error: String(error) });
    try {
      if (sentValue > 0) {
        await insertAnnouncement(db, `cron:${dateKey}:${kind}:sent`, String(sentValue));
      }
      if (failedValue > 0) {
        await insertAnnouncement(db, `cron:${dateKey}:${kind}:failed`, String(failedValue));
      }
    } catch (fallbackError) {
      console.error('cron_delivery_log_fallback_error', {
        dateKey,
        kind,
        error: String(fallbackError)
      });
    }
  }
}

export async function getDailyCronDeliveryStats(db, dateKey) {
  const result = {
    morning: { sent: 0, failed: 0 },
    reminder: { sent: 0, failed: 0 },
    evening: { sent: 0, failed: 0 }
  };

  let hasDeliveryStatsRows = false;
  try {
    const response = await db
      .prepare('SELECT kind, sent_count, failed_count FROM delivery_stats WHERE date_key = ?')
      .bind(dateKey)
      .all();
    const rows = response.results ?? [];
    for (const row of rows) {
      const rowKind = String(row.kind ?? '');
      if (!(rowKind in result)) {
        continue;
      }
      result[rowKind].sent += Number(row.sent_count ?? 0) || 0;
      result[rowKind].failed += Number(row.failed_count ?? 0) || 0;
      hasDeliveryStatsRows = true;
    }
  } catch (error) {
    console.error('cron_delivery_stats_table_error', { dateKey, error: String(error) });
  }

  if (hasDeliveryStatsRows) {
    return result;
  }

  let results = [];
  try {
    const response = await db
      .prepare('SELECT kind, text FROM announcements WHERE kind LIKE ?')
      .bind(`cron:${dateKey}:%`)
      .all();
    results = response.results ?? [];
  } catch (error) {
    console.error('cron_delivery_stats_error', { dateKey, error: String(error) });
    return result;
  }

  for (const row of results) {
    const kind = String(row.kind ?? '');
    const parts = kind.split(':');
    if (parts.length !== 4) {
      continue;
    }
    const [, rowDateKey, rowKind, rowMetric] = parts;
    if (rowDateKey !== dateKey || !(rowKind in result) || (rowMetric !== 'sent' && rowMetric !== 'failed')) {
      continue;
    }

    const value = Number(row.text ?? 0);
    if (Number.isFinite(value) && value > 0) {
      result[rowKind][rowMetric] += value;
    }
  }

  return result;
}

export async function hasAdminDailyReport(db, dateKey) {
  try {
    const row = await db
      .prepare('SELECT id FROM announcements WHERE kind = ? LIMIT 1')
      .bind(`cron_report_sent:${dateKey}`)
      .first();

    return Boolean(row?.id);
  } catch (error) {
    console.error('admin_daily_report_check_error', { dateKey, error: String(error) });
    return false;
  }
}

export async function markAdminDailyReport(db, dateKey) {
  try {
    await insertAnnouncement(db, `cron_report_sent:${dateKey}`, '1');
  } catch (error) {
    console.error('admin_daily_report_mark_error', { dateKey, error: String(error) });
  }
}

export async function getLessonsByGroupAndWeekday(_db, groupName, weekday) {
  return getStaticLessonsByGroupAndWeekday(groupName, weekday);
}

export async function getWeekLessonsByGroup(_db, groupName) {
  return getStaticWeekLessonsByGroup(groupName);
}

function buildStaticScheduleState(source) {
  const rows = Array.isArray(source) ? source : [];
  const byGroup = new Map();

  for (const row of rows) {
    const groupName = normalizeOptionalText(row?.group_name);
    if (!groupName) {
      continue;
    }

    if (!byGroup.has(groupName)) {
      byGroup.set(groupName, []);
    }

    byGroup.get(groupName).push({
      lesson_number: normalizeNullableNumber(row.lesson_number),
      weekday: normalizeWeekdayValue(row.weekday ?? row.day_of_week),
      start_time: normalizeTime(row.start_time),
      end_time: normalizeTime(row.end_time),
      subject: row.subject ?? '',
      teacher: row.teacher ?? '',
      classroom: row.classroom ?? ''
    });
  }

  for (const lessons of byGroup.values()) {
    lessons.sort(compareLessons);
  }

  return { byGroup };
}

function getStaticLessonsByGroupAndWeekday(groupName, weekday) {
  const lessons = staticScheduleState.byGroup.get(groupName);
  if (!lessons) {
    return [];
  }

  return cloneLessons(lessons.filter((lesson) => lesson.weekday === weekday));
}

function getStaticWeekLessonsByGroup(groupName) {
  const lessons = staticScheduleState.byGroup.get(groupName);
  if (!lessons) {
    return [];
  }

  return cloneLessons(lessons);
}

function cloneLessons(lessons) {
  return (Array.isArray(lessons) ? lessons : []).map((lesson) => ({ ...lesson }));
}

function compareLessons(a, b) {
  const aWeekday = a.weekday ?? 8;
  const bWeekday = b.weekday ?? 8;
  if (aWeekday !== bWeekday) {
    return aWeekday - bWeekday;
  }

  const aNumber = Number.isFinite(a.lesson_number) ? a.lesson_number : 999;
  const bNumber = Number.isFinite(b.lesson_number) ? b.lesson_number : 999;
  if (aNumber !== bNumber) {
    return aNumber - bNumber;
  }

  return String(a.start_time).localeCompare(String(b.start_time));
}

function normalizeNullableNumber(value) {
  const number = Number(value);
  if (Number.isFinite(number)) {
    return number;
  }
  return null;
}

function normalizeTime(value) {
  if (!value && value !== 0) {
    return '';
  }

  const stringValue = String(value).trim();
  const matched = stringValue.match(/^(\d{1,2}):(\d{2})/);
  if (!matched) {
    return stringValue;
  }

  const hours = matched[1].padStart(2, '0');
  const minutes = matched[2];
  return `${hours}:${minutes}`;
}

function normalizeOptionalText(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

async function insertAnnouncement(db, kind, text) {
  await db
    .prepare('INSERT INTO announcements (kind, text) VALUES (?, ?)')
    .bind(kind, text)
    .run();
}

async function runSql(db, sql) {
  try {
    await db.prepare(sql).run();
  } catch (error) {
    console.error('schema_sql_error', { sql, error: String(error) });
    throw error;
  }
}

async function runSqlSafe(db, sql) {
  try {
    await db.prepare(sql).run();
  } catch (error) {
    console.error('schema_sql_warning', { sql, error: String(error) });
  }
}
