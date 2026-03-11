import { t } from './translations.js';
import {
  CONFIG,
  escapeHtml,
  getNowContext,
  getZonedDateParts,
  getLessonStatus,
  getWeatherAdvice,
  getWeatherPresentation,
  minutesToHuman,
  toTimeRange
} from './utils.js';

const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export function formatScheduleForToday(language, lessons, nowMinutes, date = new Date()) {
  const title = t(language, 'schedule.todayTitle');
  const dateLine = t(language, 'schedule.todayDateLine', {
    date: escapeHtml(formatLocalizedPreviewDate(language, date))
  });
  if (!lessons.length) {
    return `${title}\n\n${dateLine}\n\n${t(language, 'schedule.noLessonsToday')}`;
  }

  const blocks = lessons.map((lesson, index) => {
    const status = getLessonStatus(lesson, nowMinutes);
    const statusLine = formatStatusLine(language, status);
    return formatLessonBlock(lesson, index, statusLine);
  });

  return `${title}\n\n${dateLine}\n\n${blocks.join('\n\n')}`;
}

export function prependQuickGroupHeader(language, groupName, body) {
  return `${t(language, 'schedule.quickGroupHeader', { group: escapeHtml(groupName) })}\n\n${body}`;
}

export function formatScheduleForTomorrow(language, lessons, date = new Date()) {
  const title = t(language, 'schedule.tomorrowTitle');
  const dateLine = t(language, 'schedule.tomorrowDateLine', {
    date: escapeHtml(formatLocalizedPreviewDate(language, date))
  });
  if (!lessons.length) {
    return `${title}\n\n${dateLine}\n\n${t(language, 'schedule.noLessonsTomorrow')}`;
  }

  const blocks = lessons.map((lesson, index) => formatLessonBlock(lesson, index, ''));
  return `${title}\n\n${dateLine}\n\n${blocks.join('\n\n')}`;
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

export function formatAdminUserCard(language, user) {
  const lines = [t(language, 'admin.userCardTitle'), ''];
  const username = normalizeUsername(user.tg_username);
  const fullName = [user.tg_first_name, user.tg_last_name].filter(Boolean).join(' ').trim();
  const favorites = Array.isArray(user.favorite_groups) && user.favorite_groups.length
    ? user.favorite_groups.join(', ')
    : t(language, 'settings.noFavorites');
  const languageLabel = getLanguageLabel(user.language);
  const notificationsState = Number(user.notifications_enabled) === 1
    ? t(language, 'settings.enabled')
    : t(language, 'settings.disabled');
  const reminder = Number(user.notifications_enabled) === 1
    ? `${user.reminder_minutes} min`
    : t(language, 'settings.disabled');
  const morningState = Number(user.morning_enabled) === 1
    ? t(language, 'settings.enabled')
    : t(language, 'settings.disabled');
  const activeState = Number(user.is_active) === 1
    ? t(language, 'admin.active')
    : t(language, 'admin.inactive');
  const lastSeen = normalizeDateTime(user.last_seen_at, language);
  const deactivatedAt = normalizeDateTime(user.deactivated_at, language);
  const muteState = getReminderMuteState(language, user);

  lines.push(`🆔 <b>${user.chat_id}</b>`);
  if (username) {
    lines.push(`👤 @${escapeHtml(username)}`);
  } else if (fullName) {
    lines.push(`👤 ${escapeHtml(fullName)}`);
  }
  lines.push('');
  lines.push(`${t(language, 'settings.group')}: <b>${escapeHtml(user.group_name || t(language, 'settings.notSelected'))}</b>`);
  lines.push(`${t(language, 'settings.language')}: <b>${escapeHtml(languageLabel)}</b>`);
  lines.push(`${t(language, 'settings.notifications')}: <b>${escapeHtml(notificationsState)}</b>`);
  lines.push(`${t(language, 'settings.reminder')}: <b>${escapeHtml(reminder)}</b>`);
  lines.push(`${t(language, 'settings.reminderMute')}: <b>${escapeHtml(muteState)}</b>`);
  lines.push(`${t(language, 'settings.morningTime')}: <b>${escapeHtml(user.morning_time || CONFIG.DEFAULT_MORNING_TIME)}</b>`);
  lines.push(`${t(language, 'settings.morning')}: <b>${escapeHtml(morningState)}</b>`);
  lines.push(`${t(language, 'settings.favorites')}: <b>${escapeHtml(favorites)}</b>`);
  lines.push(`${t(language, 'admin.status')}: <b>${escapeHtml(activeState)}</b>`);
  if (lastSeen) {
    lines.push(`${t(language, 'admin.lastSeen')}: <b>${escapeHtml(lastSeen)}</b>`);
  }
  if (deactivatedAt) {
    lines.push(`${t(language, 'admin.deactivatedAt')}: <b>${escapeHtml(deactivatedAt)}</b>`);
  }

  return lines.join('\n');
}

export function formatLessonNotesOverview(language, groupName, lessons) {
  const title = t(language, 'notes.listTitle', { group: escapeHtml(groupName || '-') });
  const list = (Array.isArray(lessons) ? lessons : []).filter((lesson) => lesson?.note);
  if (!list.length) {
    return `${title}\n\n${t(language, 'notes.none')}`;
  }

  const byDay = new Map();
  for (const lesson of list) {
    if (!byDay.has(lesson.weekday)) {
      byDay.set(lesson.weekday, []);
    }
    byDay.get(lesson.weekday).push(lesson);
  }

  const dayBlocks = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const dayLessons = byDay.get(weekday);
    if (!dayLessons?.length) {
      continue;
    }

    const lines = [`<b>${escapeHtml(t(language, `weekdays.${weekday}`))}</b>`, ''];
    for (const lesson of dayLessons) {
      const range = escapeHtml(toTimeRange(lesson.start_time, lesson.end_time));
      const subject = escapeHtml(lesson.subject || '-');
      const note = escapeHtml(lesson.note || '');
      const lessonNumber = Number.isFinite(Number(lesson.lesson_number)) ? `${lesson.lesson_number}.` : '-';
      lines.push(`${lessonNumber} ${range} — ${subject}`);
      lines.push(`📝 ${note}`);
      lines.push('');
    }
    dayBlocks.push(lines.join('\n').trimEnd());
  }

  return `${title}\n\n${dayBlocks.join('\n\n')}`;
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
  const { lessons, date } = payload;
  const lines = [t(language, 'evening.title'), ''];

  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    lines.push(t(language, 'evening.dateLine', {
      date: escapeHtml(formatLocalizedPreviewDate(language, date))
    }));
  }

  if (!lessons.length) {
    if (lines.at(-1) !== '') {
      lines.push('');
    }
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
  if (Number.isFinite(stats.inactiveUsers) && stats.inactiveUsers > 0) {
    lines.push(t(language, 'admin.inactiveUsers', { count: stats.inactiveUsers }));
  }
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
        const lastSeen = normalizeDateTime(member.last_seen_at, language);
        const username = normalizeUsername(member.tg_username);
        if (username) {
          return formatAdminUserLine(language, `@${escapeHtml(username)}`, member.chat_id, lastSeen);
        }

        const fullName = [member.tg_first_name, member.tg_last_name]
          .filter(Boolean)
          .join(' ')
          .trim();
        if (fullName) {
          return formatAdminUserLine(
            language,
            escapeHtml(fullName),
            `${member.chat_id}, ${t(language, 'admin.noUsername')}`,
            lastSeen
          );
        }
        return formatAdminUserLine(language, String(member.chat_id), t(language, 'admin.noUsername'), lastSeen);
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

export function formatAdminInactiveUsersMessage(language, inactiveUsers) {
  const header = t(language, 'admin.inactiveTitle');
  const users = Array.isArray(inactiveUsers) ? inactiveUsers : [];
  if (!users.length) {
    return `${header}\n\n• ${t(language, 'admin.inactiveNone')}`;
  }

  const lines = [header, ''];
  for (const user of users) {
    const username = normalizeUsername(user.tg_username);
    const fullName = [user.tg_first_name, user.tg_last_name].filter(Boolean).join(' ').trim();
    const identity = username
      ? `@${escapeHtml(username)}`
      : fullName
        ? escapeHtml(fullName)
        : String(user.chat_id);
    const meta = [`${user.chat_id}`];
    if (user.group_name) {
      meta.push(user.group_name);
    }
    const lastSeen = normalizeDateTime(user.last_seen_at, language);
    const deactivatedAt = normalizeDateTime(user.deactivated_at, language);
    if (lastSeen) {
      meta.push(`${t(language, 'admin.lastSeen')}: ${escapeHtml(lastSeen)}`);
    }
    if (deactivatedAt) {
      meta.push(`${t(language, 'admin.deactivatedAt')}: ${escapeHtml(deactivatedAt)}`);
    }
    lines.push(`• ${identity} (${meta.join(', ')})`);
  }

  return lines.join('\n');
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

function normalizeDateTime(value, language) {
  const date = parseDatabaseDate(value);
  if (!date) {
    return '';
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE).zoned;
  const target = getZonedDateParts(date, CONFIG.TIMEZONE);
  const dayDiff = getDayDiff(now, target);
  const timeText = `${String(target.hour).padStart(2, '0')}:${String(target.minute).padStart(2, '0')}`;

  if (dayDiff === 0) {
    if (language === 'ru') {
      return `сегодня ${timeText}`;
    }
    if (language === 'zh') {
      return `今天 ${timeText}`;
    }
    return `today ${timeText}`;
  }

  if (dayDiff === 1) {
    if (language === 'ru') {
      return 'вчера';
    }
    if (language === 'zh') {
      return '昨天';
    }
    return 'yesterday';
  }

  if (dayDiff === 2) {
    if (language === 'ru') {
      return 'позавчера';
    }
    if (language === 'zh') {
      return '前天';
    }
    return 'day before yesterday';
  }

  if (dayDiff > 2) {
    if (language === 'ru') {
      return `${dayDiff} ${formatRussianDays(dayDiff)} назад`;
    }
    if (language === 'zh') {
      return `${dayDiff} 天前`;
    }
    return `${dayDiff} days ago`;
  }

  return `${target.year}-${String(target.month).padStart(2, '0')}-${String(target.day).padStart(2, '0')} ${timeText}`;
}

function formatAdminUserLine(language, identity, meta, lastSeen) {
  const parts = [String(meta)];
  if (lastSeen) {
    parts.push(`${t(language, 'admin.lastSeen')}: ${escapeHtml(lastSeen)}`);
  }
  return `• ${identity} (${parts.join(', ')})`;
}

function parseDatabaseDate(value) {
  const text = String(value ?? '').trim();
  if (!text) {
    return null;
  }

  const normalized = text
    .replace('T', ' ')
    .replace(/\.\d+Z?$/, '')
    .replace(/Z$/, '');
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second = '00'] = match;
  return new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  ));
}

function getDayDiff(currentParts, targetParts) {
  const currentDay = Date.UTC(currentParts.year, currentParts.month - 1, currentParts.day);
  const targetDay = Date.UTC(targetParts.year, targetParts.month - 1, targetParts.day);
  return Math.round((currentDay - targetDay) / (24 * 60 * 60 * 1000));
}

function formatRussianDays(days) {
  const mod10 = days % 10;
  const mod100 = days % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 'день';
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'дня';
  }
  return 'дней';
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

  if (lesson.note) {
    lines.push(`📝 ${escapeHtml(lesson.note)}`);
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
  const languageLabel = getLanguageLabel(user.language);
  const morningTime = user.morning_time || '07:00';
  const reminderMute = getReminderMuteState(language, user);

  return `${t(language, titleKey)}\n\n` +
    `${t(language, 'settings.group')}: <b>${escapeHtml(group)}</b>\n` +
    `${t(language, 'settings.favorites')}: <b>${escapeHtml(favorites)}</b>\n` +
    `${t(language, 'settings.language')}: <b>${escapeHtml(languageLabel)}</b>\n` +
    `${t(language, 'settings.notifications')}: <b>${escapeHtml(notificationsState)}</b>\n` +
    `${t(language, 'settings.reminder')}: <b>${escapeHtml(reminder)}</b>\n` +
    `${t(language, 'settings.reminderMute')}: <b>${escapeHtml(reminderMute)}</b>\n` +
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

  if (lesson.note) {
    lines.push(`📝 ${escapeHtml(lesson.note)}`);
  }

  return lines;
}

function getReminderMuteState(language, user) {
  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  return user?.reminder_mute_until_date === now.dateKey
    ? t(language, 'settings.mutedToday')
    : t(language, 'settings.notMuted');
}

function getLanguageLabel(language) {
  if (language === 'ru') {
    return 'Русский';
  }
  if (language === 'zh') {
    return '中文';
  }
  return 'English';
}

function formatLocalizedPreviewDate(language, date) {
  const locale = language === 'ru'
    ? 'ru-RU'
    : language === 'zh'
      ? 'zh-CN'
      : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    timeZone: CONFIG.TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(date);
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
