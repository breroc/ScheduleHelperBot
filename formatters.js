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

export function prependQuickGroupHeader(language, groupName, body) {
  return `${t(language, 'schedule.quickGroupHeader', { group: escapeHtml(groupName) })}\n\n${body}`;
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
    const lessonBlocks = dayLessons.map((lesson, index) => formatWeekLessonBlock(lesson, index));
    dayBlocks.push(`${dayTitle}\n\n${lessonBlocks.join('\n\n')}`);
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

  if (payload.type === 'current_with_next') {
    const currentTitle = t(language, 'schedule.currentClassTitle');
    const currentBlock = formatSingleLessonDetails(payload.lesson);
    const currentStatus = t(language, 'schedule.statusEndsIn', {
      time: minutesToHuman(payload.minutesLeft, language)
    });

    const nextTitle = t(language, 'schedule.nextClassTitle');
    const nextBlock = formatSingleLessonDetails(payload.nextLesson);

    return `${currentTitle}\n\n${currentBlock}\n\n${currentStatus}\n\n${nextTitle}\n\n${nextBlock}`;
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
    statusLine = t(language, 'schedule.statusEndsIn', {
      time: minutesToHuman(payload.minutesLeft, language)
    });
  }

  return `${title}\n\n${lessonBlock}\n\n${statusLine}`;
}

export function formatSettingsSummary(language, user) {
  return formatSettingsText(language, user, 'settings.title');
}

export function formatMySettings(language, user) {
  return formatSettingsText(language, user, 'settings.mySettingsTitle');
}

export function formatMorningMessage(language, payload) {
  const { weather, lessons, firstClassIn } = payload;
  const lines = [t(language, 'morning.title'), ''];

  if (weather) {
    const presentation = getWeatherPresentation(weather.code, language);
    const advice = getWeatherAdvice(weather, language);

    lines.push(`${t(language, 'weather.title')} ${weather.temperature}°C`);
    lines.push(`${presentation.emoji} ${escapeHtml(presentation.text)}`);
    lines.push(advice);
    lines.push('');
  }

  if (typeof firstClassIn === 'number' && firstClassIn >= 0) {
    lines.push(t(language, 'morning.nearestClassIn', {
      time: minutesToHuman(firstClassIn, language)
    }));
  }

  if (lessons.length) {
    lines.push(t(language, 'morning.summary', { count: lessons.length }));
  }

  const hasMorningMeta = (typeof firstClassIn === 'number' && firstClassIn >= 0) || lessons.length > 0;
  if (hasMorningMeta) {
    lines.push('');
  }

  lines.push(t(language, 'morning.todayLessons'));
  lines.push('');

  if (!lessons.length) {
    lines.push(t(language, 'morning.noLessons'));
    return lines.join('\n');
  }

  lines.push(formatMorningLessonLines(lessons));

  return lines.join('\n');
}

export function formatEveningPreview(language, payload) {
  const { lessons } = payload;
  const lines = [t(language, 'evening.title'), ''];

  if (!lessons.length) {
    lines.push(t(language, 'evening.noLessons'));
    lines.push('');
    lines.push(t(language, 'evening.noLessonsHint'));
    return lines.join('\n');
  }

  const firstLesson = lessons[0];
  const firstRange = toTimeRange(firstLesson.start_time, firstLesson.end_time);

  lines.push(t(language, 'evening.summary', { count: lessons.length }));
  if (firstRange) {
    lines.push(t(language, 'evening.firstLesson', {
      time: escapeHtml(firstRange)
    }));
  }
  lines.push('');
  lines.push(t(language, 'evening.lessonsTitle'));
  lines.push('');

  lines.push(formatDigestLessonBlocks(lessons));

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

export function formatAdminStats(language, stats, dailyStats = null, dateKey = '') {
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

  if (dailyStats) {
    lines.push('');
    lines.push(t(language, 'admin.dailyTitle', { date: dateKey }));
    lines.push(t(language, 'admin.morningLine', {
      sent: dailyStats.morning.sent,
      failed: dailyStats.morning.failed
    }));
    lines.push(t(language, 'admin.reminderLine', {
      sent: dailyStats.reminder.sent,
      failed: dailyStats.reminder.failed
    }));
    lines.push(t(language, 'admin.eveningLine', {
      sent: dailyStats.evening.sent,
      failed: dailyStats.evening.failed
    }));
  }

  return lines.join('\n');
}

export function formatAdminUsersByGroupMessages(language, byGroupMembers) {
  const maxLength = 3500;
  const header = t(language, 'admin.usersByGroupTitle');

  const groups = Array.isArray(byGroupMembers) ? byGroupMembers : [];
  if (!groups.length) {
    return [`${header}\n\n• ${t(language, 'admin.noUsers')}`];
  }

  const chunks = [];
  let current = `${header}\n\n`;

  for (const group of groups) {
    const groupTitle = `<b>${escapeHtml(group.group_name || '-')}</b>\n`;
    const members = Array.isArray(group.members) ? group.members : [];
    const memberLines = members.length
      ? members.map((member) => {
        const username = normalizeUsername(member.tg_username);
        if (username) {
          return `• @${escapeHtml(username)} (${member.chat_id})`;
        }

        const fullName = [member.tg_first_name, member.tg_last_name]
          .filter(Boolean)
          .join(' ')
          .trim();
        if (fullName) {
          return `• ${escapeHtml(fullName)} (${member.chat_id}, ${t(language, 'admin.noUsername')})`;
        }
        return `• ${member.chat_id} (${t(language, 'admin.noUsername')})`;
      })
      : [`• ${t(language, 'admin.noUsers')}`];

    if ((current + groupTitle).length > maxLength && current.trim().length > header.length) {
      chunks.push(current.trimEnd());
      current = `${header}\n\n`;
    }

    current += groupTitle;

    for (const memberLine of memberLines) {
      const line = `${memberLine}\n`;
      if ((current + line).length > maxLength && current.trim().length > header.length) {
        chunks.push(current.trimEnd());
        current = `${header}\n\n${groupTitle}${line}`;
      } else {
        current += line;
      }
    }

    if ((current + '\n').length > maxLength && current.trim().length > header.length) {
      chunks.push(current.trimEnd());
      current = `${header}\n\n`;
    } else {
      current += '\n';
    }
  }

  if (current.trim()) {
    chunks.push(current.trimEnd());
  }

  return chunks;
}

function normalizeUsername(username) {
  if (!username) {
    return '';
  }
  const value = String(username).trim();
  if (!value) {
    return '';
  }
  return value.startsWith('@') ? value.slice(1) : value;
}

export function formatAdminDailyReport(language, dateKey, dailyStats) {
  return [
    t(language, 'admin.dailyTitle', { date: dateKey }),
    '',
    t(language, 'admin.morningLine', {
      sent: dailyStats.morning.sent,
      failed: dailyStats.morning.failed
    }),
    t(language, 'admin.reminderLine', {
      sent: dailyStats.reminder.sent,
      failed: dailyStats.reminder.failed
    }),
    t(language, 'admin.eveningLine', {
      sent: dailyStats.evening.sent,
      failed: dailyStats.evening.failed
    })
  ].join('\n');
}

export function formatHelp(language, isAdmin = false) {
  const base = `${t(language, 'help.title')}\n\n${t(language, 'help.body')}`;
  if (isAdmin) {
    return `${base}${t(language, 'help.admin')}`;
  }
  return base;
}

function formatLessonBlock(lesson, index, statusLine) {
  const lines = formatLessonCardLines(lesson, index);
  if (statusLine) {
    lines.push(statusLine);
  }

  return lines.join('\n');
}

function formatWeekLessonBlock(lesson, index) {
  return formatLessonCardLines(lesson, index).join('\n');
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
    return t(language, 'schedule.statusEndsIn', {
      time: minutesToHuman(status.minutesLeft, language)
    });
  }

  if (status.type === 'unknown') {
    return '';
  }

  return t(language, 'schedule.statusFinished');
}

function formatDigestLessonBlocks(lessons) {
  return lessons
    .map((lesson, index) => formatWeekLessonBlock(lesson, index))
    .join('\n\n');
}

function formatMorningLessonLines(lessons) {
  return lessons
    .map((lesson, index) => {
      const prefix = lessonBadge(lesson, index);
      const range = escapeHtml(toTimeRange(lesson.start_time, lesson.end_time));
      const subject = escapeHtml(lesson.subject || '-');
      return `${prefix} ${range} — ${subject}`;
    })
    .join('\n');
}

function formatSettingsText(language, user, titleKey) {
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
  const favorites = Array.isArray(user.favorite_groups) && user.favorite_groups.length
    ? user.favorite_groups.join(', ')
    : t(language, 'settings.noFavorites');
  const languageLabel = user.language === 'ru' ? 'Русский' : 'English';
  const morningTime = user.morning_time || '07:00';

  return `${t(language, titleKey)}\n\n` +
    `${t(language, 'settings.group')}: <b>${escapeHtml(group)}</b>\n` +
    `${t(language, 'settings.favorites')}: <b>${escapeHtml(favorites)}</b>\n` +
    `${t(language, 'settings.language')}: <b>${escapeHtml(languageLabel)}</b>\n` +
    `${t(language, 'settings.notifications')}: <b>${escapeHtml(notificationsState)}</b>\n` +
    `${t(language, 'settings.reminder')}: <b>${escapeHtml(reminder)}</b>\n` +
    `${t(language, 'settings.morningTime')}: <b>${escapeHtml(morningTime)}</b>\n` +
    `${t(language, 'settings.morning')}: <b>${escapeHtml(morningState)}</b>`;
}

function formatLessonCardLines(lesson, index) {
  const lines = [];
  lines.push(`${lessonBadge(lesson, index)} ${escapeHtml(toTimeRange(lesson.start_time, lesson.end_time))}`);
  lines.push(escapeHtml(lesson.subject || '-'));

  if (lesson.teacher) {
    lines.push(`👨‍🏫 ${escapeHtml(lesson.teacher)}`);
  }

  if (lesson.classroom) {
    lines.push(`📍 ${escapeHtml(lesson.classroom)}`);
  }

  return lines;
}

function numberEmoji(index) {
  return NUMBER_EMOJIS[index] ?? `${index + 1}.`;
}

function lessonBadge(lesson, index) {
  const lessonNumber = Number(lesson?.lesson_number);
  if (Number.isInteger(lessonNumber) && lessonNumber > 0) {
    return NUMBER_EMOJIS[lessonNumber - 1] ?? `${lessonNumber}.`;
  }
  return numberEmoji(index);
}
