import { CONFIG, getEnglishWeekdayName, normalizeWeekdayValue } from './utils.js';

let schemaReadyPromise;
let scheduleColumnsPromise;

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
  const hasSchedule = await tableExists(db, 'schedule');
  const hasAnnouncements = await tableExists(db, 'announcements');
  if (!hasUsers || !hasSchedule || !hasAnnouncements) {
    throw new Error(
      `required_tables_missing users=${hasUsers} schedule=${hasSchedule} announcements=${hasAnnouncements}`
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

  const scheduleColumns = await getTableColumns(db, 'schedule');
  const scheduleColumnList = [...scheduleColumns];
  const scheduleGroupCol = pickColumn(scheduleColumnList, ['group_name', 'group', 'group_id']);
  const scheduleWeekdayCol = pickColumn(scheduleColumnList, ['weekday', 'day_of_week', 'week_day', 'day']);
  if (scheduleGroupCol && scheduleWeekdayCol) {
    await runSqlSafe(
      db,
      `CREATE INDEX IF NOT EXISTS idx_schedule_group_weekday ON schedule(${quoteIdent(scheduleGroupCol)}, ${quoteIdent(scheduleWeekdayCol)})`
    );
  }
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

export async function ensureUser(db, chatId, language, botFingerprint = '') {
  const { user } = await ensureUserWithMeta(db, chatId, language, botFingerprint);
  return user;
}

export async function ensureUserWithMeta(db, chatId, language, botFingerprint = '') {
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
    bot_fingerprint: user.bot_fingerprint ?? null
  };
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

  return {
    totalUsers: Number(total?.count ?? 0),
    notificationsEnabled: Number(notifications?.count ?? 0),
    byGroup: (groups.results ?? []).map((row) => ({
      group_name: row.group_name,
      count: Number(row.count ?? 0)
    }))
  };
}

export async function logCronDelivery(db, dateKey, kind, sent, failed) {
  const sentValue = Number(sent ?? 0);
  const failedValue = Number(failed ?? 0);

  try {
    if (sentValue > 0) {
      await insertAnnouncement(db, `cron:${dateKey}:${kind}:sent`, String(sentValue));
    }

    if (failedValue > 0) {
      await insertAnnouncement(db, `cron:${dateKey}:${kind}:failed`, String(failedValue));
    }
  } catch (error) {
    console.error('cron_delivery_log_error', { dateKey, kind, error: String(error) });
  }
}

export async function getDailyCronDeliveryStats(db, dateKey) {
  const result = {
    morning: { sent: 0, failed: 0 },
    reminder: { sent: 0, failed: 0 },
    evening: { sent: 0, failed: 0 }
  };

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

export async function getLessonsByGroupAndWeekday(db, groupName, weekday) {
  const map = await getScheduleColumnMap(db);
  if (!map) {
    return [];
  }

  const englishName = getEnglishWeekdayName(weekday);

  const sql = `
    SELECT
      ${map.lessonNumberExpr} AS lesson_number,
      ${map.weekdayExpr} AS weekday,
      ${map.startExpr} AS start_time,
      ${map.endExpr} AS end_time,
      ${map.subjectExpr} AS subject,
      ${map.teacherExpr} AS teacher,
      ${map.classroomExpr} AS classroom
    FROM schedule
    WHERE ${map.groupExpr} = ?
      AND (${map.weekdayExpr} = ? OR lower(${map.weekdayExpr}) = lower(?))
    ORDER BY COALESCE(${map.lessonNumberExpr}, 999), ${map.startExpr}
  `;

  const { results } = await db.prepare(sql).bind(groupName, weekday, englishName).all();
  return normalizeLessons(results ?? []);
}

export async function getWeekLessonsByGroup(db, groupName) {
  const map = await getScheduleColumnMap(db);
  if (!map) {
    return [];
  }

  const sql = `
    SELECT
      ${map.lessonNumberExpr} AS lesson_number,
      ${map.weekdayExpr} AS weekday,
      ${map.startExpr} AS start_time,
      ${map.endExpr} AS end_time,
      ${map.subjectExpr} AS subject,
      ${map.teacherExpr} AS teacher,
      ${map.classroomExpr} AS classroom
    FROM schedule
    WHERE ${map.groupExpr} = ?
  `;

  const { results } = await db.prepare(sql).bind(groupName).all();

  const lessons = normalizeLessons(results ?? []);
  lessons.sort((a, b) => {
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
  });

  return lessons;
}

async function getScheduleColumnMap(db) {
  if (!scheduleColumnsPromise) {
    scheduleColumnsPromise = detectScheduleColumnMap(db);
  }

  return scheduleColumnsPromise;
}

async function detectScheduleColumnMap(db) {
  const columns = await getTableColumns(db, 'schedule');
  if (columns.size === 0) {
    return null;
  }

  const colList = [...columns];
  const groupCol = pickColumn(colList, ['group_name', 'group', 'group_id']);
  const weekdayCol = pickColumn(colList, ['weekday', 'day_of_week', 'week_day', 'day']);
  const lessonNumberCol = pickColumn(colList, ['lesson_number', 'pair_number', 'number', 'lesson_no']);
  const startCol = pickColumn(colList, ['start_time', 'time_start', 'starts_at', 'time_from']);
  const endCol = pickColumn(colList, ['end_time', 'time_end', 'ends_at', 'time_to']);
  const subjectCol = pickColumn(colList, ['subject', 'lesson_name', 'name', 'title']);
  const teacherCol = pickColumn(colList, ['teacher', 'lecturer', 'professor']);
  const classroomCol = pickColumn(colList, ['classroom', 'room', 'auditorium', 'cabinet']);

  if (!groupCol || !weekdayCol || !startCol || !endCol || !subjectCol) {
    console.error('schedule_columns_missing', { groupCol, weekdayCol, startCol, endCol, subjectCol });
    return null;
  }

  return {
    groupExpr: quoteIdent(groupCol),
    weekdayExpr: quoteIdent(weekdayCol),
    lessonNumberExpr: lessonNumberCol ? quoteIdent(lessonNumberCol) : 'NULL',
    startExpr: quoteIdent(startCol),
    endExpr: quoteIdent(endCol),
    subjectExpr: quoteIdent(subjectCol),
    teacherExpr: teacherCol ? quoteIdent(teacherCol) : 'NULL',
    classroomExpr: classroomCol ? quoteIdent(classroomCol) : 'NULL'
  };
}

function normalizeLessons(rows) {
  return rows.map((row) => ({
    lesson_number: normalizeNullableNumber(row.lesson_number),
    weekday: normalizeWeekdayValue(row.weekday),
    start_time: normalizeTime(row.start_time),
    end_time: normalizeTime(row.end_time),
    subject: row.subject ?? '',
    teacher: row.teacher ?? '',
    classroom: row.classroom ?? ''
  }));
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

function pickColumn(columns, candidates) {
  for (const candidate of candidates) {
    if (columns.includes(candidate)) {
      return candidate;
    }
  }
  return null;
}

function quoteIdent(identifier) {
  return `"${String(identifier).replaceAll('"', '""')}"`;
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
