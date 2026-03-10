import {
  getDailyCronDeliveryStats,
  getLessonsByGroupAndWeekday,
  getUser,
  getUsersForEvening,
  getUsersForMorning,
  getUsersForReminders,
  hasAdminDailyReport,
  logCronDelivery,
  markUserInactive,
  markAdminDailyReport,
  setLastEveningSent,
  setLastMorningSent,
  setLastReminderKey
} from './db.js';
import { formatAdminDailyReport, formatEveningPreview, formatMorningMessage, formatReminder } from './formatters.js';
import { mainMenuKeyboard } from './bot.js';
import { isTelegramUserUnavailableError, sendMessage } from './telegram.js';
import { resolveLanguage } from './translations.js';
import {
  CONFIG,
  addDays,
  fetchHangzhouWeather,
  getAdminId,
  getClockKey,
  getNowContext,
  getZonedDateParts,
  parseTimeToMinutes,
  runInBatches
} from './utils.js';

const REMINDER_WINDOW_MINUTES = 2;

export async function handleScheduled(event, env) {
  const cron = String(event?.cron || '').trim();
  console.log('scheduled_event', { cron });

  const matchedMorningTime = getMatchedMorningTime(cron, event?.scheduledTime);
  if (matchedMorningTime) {
    await runMorningCron(env, matchedMorningTime);
    return;
  }

  if (isCronMatch(cron, CONFIG.EVENING_PREVIEW_CRON_UTC)) {
    await runEveningPreviewCron(env);
    return;
  }

  if (isCronMatch(cron, CONFIG.ADMIN_REPORT_CRON_UTC)) {
    await runAdminDailyReportCron(env);
    return;
  }

  if (isCronMatch(cron, CONFIG.REMINDER_CRON_UTC)) {
    await runReminderCron(env);
    return;
  }

  console.warn('scheduled_event_unknown_cron', {
    received: cron,
    morning: CONFIG.MORNING_CRON_UTC,
    evening: CONFIG.EVENING_PREVIEW_CRON_UTC,
    adminReport: CONFIG.ADMIN_REPORT_CRON_UTC,
    reminder: CONFIG.REMINDER_CRON_UTC
  });
}

export async function runMorningCron(env, targetMorningTime = null) {
  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const users = await getUsersForMorning(env.DB);
  const weather = await fetchHangzhouWeather();
  const lessonsByGroup = new Map();
  const targets = [];
  const currentMorningTime = targetMorningTime || getClockKey(now.zoned);

  for (const user of users) {
    if (!user.group_name) {
      continue;
    }

    if (user.morning_time !== currentMorningTime) {
      continue;
    }

    if (user.last_morning_sent === now.dateKey) {
      continue;
    }

    targets.push(user);
  }

  const results = await runInBatches(targets, async (user) => {
    let lessons = lessonsByGroup.get(user.group_name);
    if (!lessons) {
      lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, now.zoned.weekday);
      lessonsByGroup.set(user.group_name, lessons);
    }

    const firstClassIn = getMinutesUntilFirstClass(lessons, now.nowMinutes);
    const text = formatMorningMessage(user.language, {
      weather,
      lessons,
      firstClassIn
    });

    try {
      await sendMessage(env, user.chat_id, text, {
        reply_markup: mainMenuKeyboard(user.language)
      });
      await setLastMorningSent(env.DB, user.chat_id, now.dateKey);
    } catch (error) {
      if (isTelegramUserUnavailableError(error)) {
        await markUserInactive(env.DB, user.chat_id);
      }
      console.error('morning_send_error', { chatId: user.chat_id, error: String(error) });
      throw error;
    }
  });

  const { sent, failed } = countSettledResults(results);
  console.log('morning_cron_summary', { dateKey: now.dateKey, total: results.length, sent, failed });

  await logCronDelivery(env.DB, now.dateKey, 'morning', sent, failed);
}

export async function runReminderCron(env) {
  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const users = await getUsersForReminders(env.DB);
  const lessonsByGroup = new Map();
  const targets = [];

  for (const user of users) {
    if (!user.group_name) {
      continue;
    }

    let lessons = lessonsByGroup.get(user.group_name);
    if (!lessons) {
      lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, now.zoned.weekday);
      lessonsByGroup.set(user.group_name, lessons);
    }

    const dueLesson = findDueReminderLesson(lessons, now.nowMinutes, user.reminder_minutes);
    if (!dueLesson) {
      continue;
    }

    const reminderKey = `${now.dateKey}:${user.group_name}:${dueLesson.lesson.lesson_number ?? dueLesson.lesson.start_time}:${user.reminder_minutes}`;
    if (user.last_reminder_key === reminderKey) {
      continue;
    }

    targets.push({
      user,
      dueLesson,
      reminderKey
    });
  }

  const results = await runInBatches(targets, async ({ user, dueLesson, reminderKey }) => {
    const text = formatReminder(user.language, dueLesson.lesson, dueLesson.minutesLeft);

    try {
      await sendMessage(env, user.chat_id, text, {
        reply_markup: mainMenuKeyboard(user.language)
      });
      await setLastReminderKey(env.DB, user.chat_id, reminderKey);
    } catch (error) {
      if (isTelegramUserUnavailableError(error)) {
        await markUserInactive(env.DB, user.chat_id);
      }
      console.error('reminder_send_error', { chatId: user.chat_id, error: String(error) });
      throw error;
    }
  });

  const { sent, failed } = countSettledResults(results);
  console.log('reminder_cron_summary', { dateKey: now.dateKey, total: results.length, sent, failed });

  await logCronDelivery(env.DB, now.dateKey, 'reminder', sent, failed);
}

export async function runEveningPreviewCron(env) {
  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const tomorrow = addDays(new Date(), 1);
  const tomorrowParts = getZonedDateParts(tomorrow, CONFIG.TIMEZONE);
  const users = await getUsersForEvening(env.DB);
  const lessonsByGroup = new Map();
  const targets = [];

  for (const user of users) {
    if (!user.group_name) {
      continue;
    }

    if (user.last_evening_sent === now.dateKey) {
      continue;
    }

    targets.push(user);
  }

  const results = await runInBatches(targets, async (user) => {
    const cacheKey = `${user.group_name}:${tomorrowParts.weekday}`;
    let lessons = lessonsByGroup.get(cacheKey);
    if (!lessons) {
      lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, tomorrowParts.weekday);
      lessonsByGroup.set(cacheKey, lessons);
    }

    const text = formatEveningPreview(user.language, { lessons });
    try {
      await sendMessage(env, user.chat_id, text, {
        reply_markup: mainMenuKeyboard(user.language)
      });
      await setLastEveningSent(env.DB, user.chat_id, now.dateKey);
    } catch (error) {
      if (isTelegramUserUnavailableError(error)) {
        await markUserInactive(env.DB, user.chat_id);
      }
      console.error('evening_preview_send_error', { chatId: user.chat_id, error: String(error) });
      throw error;
    }
  });

  const { sent, failed } = countSettledResults(results);
  console.log('evening_cron_summary', { dateKey: now.dateKey, total: results.length, sent, failed });

  await logCronDelivery(env.DB, now.dateKey, 'evening', sent, failed);
}

export async function runAdminDailyReportCron(env) {
  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const alreadySent = await hasAdminDailyReport(env.DB, now.dateKey);
  if (alreadySent) {
    return;
  }

  const adminId = getAdminId(env);
  if (!adminId) {
    return;
  }

  const adminUser = await getUser(env.DB, adminId);
  const language = resolveLanguage(adminUser?.language ?? 'en');
  const stats = await getDailyCronDeliveryStats(env.DB, now.dateKey);
  const text = formatAdminDailyReport(language, now.dateKey, stats);

  try {
    await sendMessage(env, adminId, text);
    await markAdminDailyReport(env.DB, now.dateKey);
    console.log('admin_daily_report_sent', { dateKey: now.dateKey, adminId });
  } catch (error) {
    console.error('admin_daily_report_error', { adminId, error: String(error) });
  }
}

function findDueReminderLesson(lessons, nowMinutes, reminderMinutes) {
  for (const lesson of lessons) {
    const startMinutes = parseTimeToMinutes(lesson.start_time);
    if (startMinutes === null || startMinutes <= nowMinutes) {
      continue;
    }

    const minutesLeft = startMinutes - nowMinutes;
    const upperBound = reminderMinutes;
    const lowerBound = Math.max(0, reminderMinutes - REMINDER_WINDOW_MINUTES + 1);

    if (minutesLeft <= upperBound && minutesLeft >= lowerBound) {
      return { lesson, minutesLeft };
    }
  }

  return null;
}

function getMinutesUntilFirstClass(lessons, nowMinutes) {
  for (const lesson of lessons) {
    const startMinutes = parseTimeToMinutes(lesson.start_time);
    if (startMinutes === null) {
      continue;
    }

    if (startMinutes >= nowMinutes) {
      return startMinutes - nowMinutes;
    }
  }

  return null;
}

function isCronMatch(received, target) {
  const normalizedReceived = normalizeCron(received);
  if (Array.isArray(target)) {
    return target.some((value) => normalizeCron(value) === normalizedReceived);
  }
  return normalizedReceived === normalizeCron(target);
}

function getMatchedMorningTime(cronExpr, scheduledTime) {
  const cronList = Array.isArray(CONFIG.MORNING_CRON_UTC) ? CONFIG.MORNING_CRON_UTC : [CONFIG.MORNING_CRON_UTC];
  const index = cronList.findIndex((value) => normalizeCron(value) === normalizeCron(cronExpr));
  if (index === -1) {
    return null;
  }

  if (index === 0) {
    const scheduledDate = Number.isFinite(Number(scheduledTime)) ? new Date(Number(scheduledTime)) : new Date();
    const scheduledParts = getZonedDateParts(scheduledDate, CONFIG.TIMEZONE);
    const scheduledClock = getClockKey(scheduledParts);
    if (scheduledClock === '07:00' || scheduledClock === '07:30') {
      return scheduledClock;
    }
  }

  return CONFIG.MORNING_TIME_OPTIONS[index + 1] ?? null;
}

function countSettledResults(results) {
  const sent = results.filter((result) => result.status === 'fulfilled').length;
  return {
    sent,
    failed: results.length - sent
  };
}

function normalizeCron(cronExpr) {
  const parts = String(cronExpr || '')
    .trim()
    .split(/\s+/)
    .slice(0, 5);

  if (parts.length !== 5) {
    return String(cronExpr || '').trim();
  }

  return parts
    .map((part) => (part === '*/1' ? '*' : part))
    .join(' ');
}
