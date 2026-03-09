import {
  getLessonsByGroupAndWeekday,
  getUsersForMorning,
  getUsersForReminders,
  setLastMorningSent,
  setLastReminderKey
} from './db.js';
import { formatMorningMessage, formatReminder } from './formatters.js';
import { mainMenuKeyboard } from './bot.js';
import { sendMessage } from './telegram.js';
import {
  CONFIG,
  fetchHangzhouWeather,
  getNowContext,
  parseTimeToMinutes
} from './utils.js';

const REMINDER_WINDOW_MINUTES = 2;

export async function handleScheduled(event, env) {
  const cron = String(event?.cron || '').trim();
  console.log('scheduled_event', { cron });

  if (isCronMatch(cron, CONFIG.MORNING_CRON_UTC)) {
    await runMorningCron(env);
    return;
  }

  if (isCronMatch(cron, CONFIG.REMINDER_CRON_UTC)) {
    await runReminderCron(env);
    return;
  }

  console.warn('scheduled_event_unknown_cron', {
    received: cron,
    morning: CONFIG.MORNING_CRON_UTC,
    reminder: CONFIG.REMINDER_CRON_UTC
  });
  await runReminderCron(env);
}

export async function runMorningCron(env) {
  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const users = await getUsersForMorning(env.DB);
  const weather = await fetchHangzhouWeather();
  const lessonsByGroup = new Map();

  for (const user of users) {
    if (!user.group_name) {
      continue;
    }

    if (user.last_morning_sent === now.dateKey) {
      continue;
    }

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
      console.error('morning_send_error', { chatId: user.chat_id, error: String(error) });
    }
  }
}

export async function runReminderCron(env) {
  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const users = await getUsersForReminders(env.DB);
  const lessonsByGroup = new Map();

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

    const text = formatReminder(user.language, dueLesson.lesson, dueLesson.minutesLeft);

    try {
      await sendMessage(env, user.chat_id, text, {
        reply_markup: mainMenuKeyboard(user.language)
      });
      await setLastReminderKey(env.DB, user.chat_id, reminderKey);
    } catch (error) {
      console.error('reminder_send_error', { chatId: user.chat_id, error: String(error) });
    }
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
  return normalizeCron(received) === normalizeCron(target);
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
