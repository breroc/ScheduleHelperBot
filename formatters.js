import { t } from './translations.js';
import {
  escapeHtml,
  getLessonStatus,
  getWeatherAdvice,
  getWeatherPresentation,
  minutesToHuman,
  toTimeRange
} from './utils.js';

const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export function formatScheduleForToday(language, lessons, nowMinutes) {
  const title = t(language, 'schedule.todayTitle');
  if (!lessons.length) {
    return `${title}\n\n${t(language, 'schedule.noLessonsToday')}`;
  }

  const blocks = lessons.map((lesson, index) => {
    const status = getLessonStatus(lesson, nowMinutes);
    const statusLine = formatStatusLine(language, status);
    return formatLessonBlock(lesson, index, statusLine);
  });

  return `${title}\n\n${blocks.join('\n\n')}`;
}

export function formatScheduleForTomorrow(language, lessons) {
  const title = t(language, 'schedule.tomorrowTitle');
  if (!lessons.length) {
    return `${title}\n\n${t(language, 'schedule.noLessonsTomorrow')}`;
  }

  const blocks = lessons.map((lesson, index) => formatLessonBlock(lesson, index, ''));
  return `${title}\n\n${blocks.join('\n\n')}`;
}

export function formatFullWeek(language, lessons) {
  const title = t(language, 'schedule.weekTitle');

  if (!lessons.length) {
    return `${title}\n\n${t(language, 'schedule.noLessonsWeek')}`;
  }

  const byDay = new Map();
  for (const lesson of lessons) {
    if (!lesson.weekday) {
      continue;
    }
    if (!byDay.has(lesson.weekday)) {
      byDay.set(lesson.weekday, []);
    }
    byDay.get(lesson.weekday).push(lesson);
  }

  const dayBlocks = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const dayLessons = byDay.get(weekday);
    if (!dayLessons || !dayLessons.length) {
      continue;
    }

    const dayTitle = `<b>${escapeHtml(t(language, `weekdays.${weekday}`))}</b>`;
    const lines = dayLessons.map((lesson, index) => {
      const prefix = numberEmoji(index);
      const range = escapeHtml(toTimeRange(lesson.start_time, lesson.end_time));
      const subject = escapeHtml(lesson.subject || '-');
      return `${prefix} ${range} — ${subject}`;
    });

    dayBlocks.push(`${dayTitle}\n${lines.join('\n')}`);
  }

  if (!dayBlocks.length) {
    return `${title}\n\n${t(language, 'schedule.noLessonsWeek')}`;
  }

  return `${title}\n\n${dayBlocks.join('\n\n')}`;
}

export function formatNextClass(language, payload) {
  if (!payload) {
    return t(language, 'schedule.noMoreToday');
  }

  if (payload.type === 'none') {
    return t(language, 'schedule.noMoreToday');
  }

  const title = payload.type === 'current'
    ? t(language, 'schedule.currentClassTitle')
    : t(language, 'schedule.nextClassTitle');

  const lessonBlock = formatSingleLessonDetails(payload.lesson);

  let statusLine = '';
  if (payload.type === 'next') {
    statusLine = t(language, 'schedule.statusStartsIn', {
      time: minutesToHuman(payload.minutesLeft, language)
    });
  } else {
    statusLine = t(language, 'schedule.statusInProgress');
  }

  return `${title}\n\n${lessonBlock}\n\n${statusLine}`;
}

export function formatSettingsSummary(language, user) {
  const notificationsState = Number(user.notifications_enabled) === 1
    ? t(language, 'settings.enabled')
    : t(language, 'settings.disabled');
  const reminder = Number(user.notifications_enabled) === 1
    ? `${user.reminder_minutes} min`
    : t(language, 'settings.disabled');
  const group = user.group_name || t(language, 'settings.notSelected');

  return `${t(language, 'settings.title')}\n\n` +
    `${t(language, 'settings.group')}: <b>${escapeHtml(group)}</b>\n` +
    `${t(language, 'settings.language')}: <b>${escapeHtml(user.language === 'ru' ? 'Русский' : 'English')}</b>\n` +
    `${t(language, 'settings.notifications')}: <b>${escapeHtml(notificationsState)}</b>\n` +
    `${t(language, 'settings.reminder')}: <b>${escapeHtml(reminder)}</b>`;
}

export function formatMySettings(language, user) {
  const notificationsState = Number(user.notifications_enabled) === 1
    ? t(language, 'settings.enabled')
    : t(language, 'settings.disabled');
  const morningState = Number(user.morning_enabled) === 1
    ? t(language, 'settings.enabled')
    : t(language, 'settings.disabled');
  const reminder = Number(user.notifications_enabled) === 1
    ? `${user.reminder_minutes} min`
    : t(language, 'settings.disabled');
  const group = user.group_name || t(language, 'settings.notSelected');

  return `${t(language, 'settings.mySettingsTitle')}\n\n` +
    `${t(language, 'settings.group')}: <b>${escapeHtml(group)}</b>\n` +
    `${t(language, 'settings.language')}: <b>${escapeHtml(user.language === 'ru' ? 'Русский' : 'English')}</b>\n` +
    `${t(language, 'settings.notifications')}: <b>${escapeHtml(notificationsState)}</b>\n` +
    `${t(language, 'settings.reminder')}: <b>${escapeHtml(reminder)}</b>\n` +
    `${t(language, 'settings.morning')}: <b>${escapeHtml(morningState)}</b>`;
}

export function formatMorningMessage(language, payload) {
  const { weather, lessons, firstClassIn } = payload;
  const lines = [t(language, 'morning.title'), ''];

  if (weather) {
    const presentation = getWeatherPresentation(weather.code, language);
    const advice = getWeatherAdvice(weather, language);

    lines.push(`${t(language, 'weather.title')}`);
    lines.push(`🌡 ${weather.temperature}°C`);
    lines.push(`${presentation.emoji} ${escapeHtml(presentation.text)}`);
    lines.push(advice);
    lines.push('');
  }

  if (typeof firstClassIn === 'number' && firstClassIn >= 0) {
    lines.push(t(language, 'schedule.firstClassIn', {
      time: minutesToHuman(firstClassIn, language)
    }));
    lines.push('');
  }

  lines.push(t(language, 'morning.todayLessons'));

  if (!lessons.length) {
    lines.push(t(language, 'morning.noLessons'));
    return lines.join('\n');
  }

  for (let i = 0; i < lessons.length; i += 1) {
    const lesson = lessons[i];
    const prefix = numberEmoji(i);
    const range = escapeHtml(toTimeRange(lesson.start_time, lesson.end_time));
    const subject = escapeHtml(lesson.subject || '-');
    lines.push(`${prefix} ${range} ${subject}`);
  }

  return lines.join('\n');
}

export function formatReminder(language, lesson, minutesLeft) {
  const lines = [t(language, 'reminders.title'), ''];
  lines.push(formatSingleLessonDetails(lesson));
  lines.push('');
  lines.push(t(language, 'reminders.startsIn', {
    time: minutesToHuman(minutesLeft, language)
  }));
  return lines.join('\n');
}

export function formatAdminStats(language, stats) {
  const lines = [t(language, 'admin.statsTitle'), ''];
  lines.push(t(language, 'admin.totalUsers', { count: stats.totalUsers }));
  lines.push(t(language, 'admin.notificationsOn', { count: stats.notificationsEnabled }));
  lines.push('');
  lines.push(t(language, 'admin.byGroupTitle'));

  if (!stats.byGroup.length) {
    lines.push('• -');
  } else {
    for (const item of stats.byGroup) {
      lines.push(`• ${escapeHtml(item.group_name)}: <b>${item.count}</b>`);
    }
  }

  return lines.join('\n');
}

function formatLessonBlock(lesson, index, statusLine) {
  const lines = [];
  lines.push(`${numberEmoji(index)} ${escapeHtml(toTimeRange(lesson.start_time, lesson.end_time))}`);
  lines.push(escapeHtml(lesson.subject || '-'));

  if (lesson.teacher) {
    lines.push(`👨‍🏫 ${escapeHtml(lesson.teacher)}`);
  }

  if (lesson.classroom) {
    lines.push(`📍 ${escapeHtml(lesson.classroom)}`);
  }

  if (statusLine) {
    lines.push(statusLine);
  }

  return lines.join('\n');
}

function formatSingleLessonDetails(lesson) {
  const lines = [];
  lines.push(`<b>${escapeHtml(lesson.subject || '-')}</b>`);

  if (lesson.teacher) {
    lines.push(`👨‍🏫 ${escapeHtml(lesson.teacher)}`);
  }

  if (lesson.classroom) {
    lines.push(`📍 ${escapeHtml(lesson.classroom)}`);
  }

  const range = toTimeRange(lesson.start_time, lesson.end_time);
  if (range) {
    lines.push(`⏰ ${escapeHtml(range)}`);
  }

  return lines.join('\n');
}

function formatStatusLine(language, status) {
  if (status.type === 'upcoming') {
    return t(language, 'schedule.statusStartsIn', {
      time: minutesToHuman(status.minutesLeft, language)
    });
  }

  if (status.type === 'in_progress') {
    return t(language, 'schedule.statusInProgress');
  }

  if (status.type === 'unknown') {
    return '';
  }

  return t(language, 'schedule.statusFinished');
}

function numberEmoji(index) {
  return NUMBER_EMOJIS[index] ?? `${index + 1}.`;
}
