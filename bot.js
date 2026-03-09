import {
  ensureUser,
  getAllUsers,
  getLessonsByGroupAndWeekday,
  getStats,
  getUser,
  setUserGroup,
  setUserLanguage,
  setUserNotifications,
  getWeekLessonsByGroup
} from './db.js';
import {
  formatAdminStats,
  formatFullWeek,
  formatMySettings,
  formatMorningMessage,
  formatNextClass,
  formatScheduleForToday,
  formatScheduleForTomorrow,
  formatSettingsSummary
} from './formatters.js';
import { sendMessage } from './telegram.js';
import { getLocale, resolveLanguage, t } from './translations.js';
import {
  CONFIG,
  addDays,
  fetchHangzhouWeather,
  getAdminId,
  getNowContext,
  getZonedDateParts,
  parseReminderChoice,
  parseTimeToMinutes,
  pickLanguageByTelegram
} from './utils.js';

const LOCALES = ['en', 'ru'];

export async function handleUpdate(update, env) {
  const message = update?.message ?? update?.edited_message;
  if (!message || typeof message.text !== 'string') {
    return;
  }

  const chatId = Number(message.chat?.id);
  if (!Number.isFinite(chatId)) {
    return;
  }

  const text = message.text.trim();
  const defaultLang = pickLanguageByTelegram(message.from?.language_code);
  let user = await ensureUser(env.DB, chatId, defaultLang);
  let language = resolveLanguage(user?.language ?? defaultLang);

  if (text.startsWith('/')) {
    await handleCommand({ text, chatId, env, user, language });
    return;
  }

  if (CONFIG.GROUPS.includes(text)) {
    const wasSelected = Boolean(user.group_name);
    await setUserGroup(env.DB, chatId, text);
    user = await getUser(env.DB, chatId);
    language = resolveLanguage(user.language);

    const key = wasSelected ? 'groups.changed' : 'groups.saved';
    await sendMessage(env, chatId, t(language, key, { group: text }), {
      reply_markup: mainMenuKeyboard(language)
    });
    return;
  }

  const action = detectAction(text);
  switch (action) {
    case 'today':
      await onToday({ env, chatId, user, language });
      return;
    case 'tomorrow':
      await onTomorrow({ env, chatId, user, language });
      return;
    case 'fullWeek':
      await onFullWeek({ env, chatId, user, language });
      return;
    case 'nextClass':
      await onNextClass({ env, chatId, user, language });
      return;
    case 'settings':
      await sendMessage(env, chatId, formatSettingsSummary(language, user), {
        reply_markup: settingsKeyboard(language)
      });
      return;
    case 'language':
      await sendMessage(env, chatId, t(language, 'common.pickLanguage'), {
        reply_markup: languageKeyboard(language)
      });
      return;
    case 'notifications':
      await sendMessage(env, chatId, t(language, 'common.pickNotifications'), {
        reply_markup: notificationsKeyboard(language)
      });
      return;
    case 'mySettings':
      user = await getUser(env.DB, chatId);
      language = resolveLanguage(user?.language ?? language);
      await sendMessage(env, chatId, formatMySettings(language, user), {
        reply_markup: settingsKeyboard(language)
      });
      return;
    case 'changeGroup':
      await sendMessage(env, chatId, t(language, 'common.chooseGroup'), {
        reply_markup: groupKeyboard(language)
      });
      return;
    case 'back':
      await sendMessage(env, chatId, t(language, 'common.mainMenu'), {
        reply_markup: mainMenuKeyboard(language)
      });
      return;
    case 'langRu': {
      await setUserLanguage(env.DB, chatId, 'ru');
      user = await getUser(env.DB, chatId);
      language = 'ru';
      await sendMessage(env, chatId, t(language, 'settings.languageUpdated', { language: 'Русский' }), {
        reply_markup: settingsKeyboard(language)
      });
      return;
    }
    case 'langEn': {
      await setUserLanguage(env.DB, chatId, 'en');
      user = await getUser(env.DB, chatId);
      language = 'en';
      await sendMessage(env, chatId, t(language, 'settings.languageUpdated', { language: 'English' }), {
        reply_markup: settingsKeyboard(language)
      });
      return;
    }
    case 'notifChoice': {
      const choice = parseReminderChoice(text);
      if (choice) {
        await setUserNotifications(env.DB, chatId, choice.enabled, choice.minutes);
        user = await getUser(env.DB, chatId);
        language = resolveLanguage(user.language);

        const value = choice.enabled
          ? `${choice.minutes} min`
          : t(language, 'settings.disabled');

        await sendMessage(env, chatId, t(language, 'settings.notificationsUpdated', { value }), {
          reply_markup: settingsKeyboard(language)
        });
        return;
      }
      break;
    }
    default:
      break;
  }

  if (!user.group_name) {
    await sendMessage(env, chatId, `${t(language, 'schedule.noGroup')}\n\n${t(language, 'common.chooseGroup')}`, {
      reply_markup: groupKeyboard(language)
    });
    return;
  }

  await sendMessage(env, chatId, t(language, 'common.unknownCommand'), {
    reply_markup: mainMenuKeyboard(language)
  });
}

async function handleCommand({ text, chatId, env, user, language }) {
  const [rawCommand, ...rest] = text.split(' ');
  const command = String(rawCommand || '')
    .split('@')[0]
    .toLowerCase();
  const argsText = rest.join(' ').trim();

  if (command === '/start') {
    if (!user.group_name) {
      await sendMessage(env, chatId, `${t(language, 'start.newUser')}\n\n${t(language, 'common.chooseGroup')}`, {
        reply_markup: groupKeyboard(language)
      });
      return;
    }

    await sendMessage(env, chatId, t(language, 'start.knownUser'), {
      reply_markup: mainMenuKeyboard(language)
    });
    return;
  }

  if (command === '/broadcast') {
    await onBroadcast({ env, chatId, language, text: argsText });
    return;
  }

  if (command === '/stats') {
    await onStats({ env, chatId, language });
    return;
  }

  if (command === '/morningtest') {
    await onMorningTest({ env, chatId, language });
    return;
  }

  await sendMessage(env, chatId, t(language, 'common.unknownCommand'), {
    reply_markup: mainMenuKeyboard(language)
  });
}

async function onToday({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendMessage(env, chatId, t(language, 'schedule.noGroup'), {
      reply_markup: groupKeyboard(language)
    });
    return;
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, now.zoned.weekday);

  await sendMessage(env, chatId, formatScheduleForToday(language, lessons, now.nowMinutes), {
    reply_markup: mainMenuKeyboard(language)
  });
}

async function onTomorrow({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendMessage(env, chatId, t(language, 'schedule.noGroup'), {
      reply_markup: groupKeyboard(language)
    });
    return;
  }

  const tomorrow = addDays(new Date(), 1);
  const parts = getZonedDateParts(tomorrow, CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, parts.weekday);

  await sendMessage(env, chatId, formatScheduleForTomorrow(language, lessons), {
    reply_markup: mainMenuKeyboard(language)
  });
}

async function onFullWeek({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendMessage(env, chatId, t(language, 'schedule.noGroup'), {
      reply_markup: groupKeyboard(language)
    });
    return;
  }

  const lessons = await getWeekLessonsByGroup(env.DB, user.group_name);
  await sendMessage(env, chatId, formatFullWeek(language, lessons), {
    reply_markup: mainMenuKeyboard(language)
  });
}

async function onNextClass({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendMessage(env, chatId, t(language, 'schedule.noGroup'), {
      reply_markup: groupKeyboard(language)
    });
    return;
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, now.zoned.weekday);

  let payload = { type: 'none' };
  for (const lesson of lessons) {
    const start = parseTimeToMinutes(lesson.start_time);
    const end = parseTimeToMinutes(lesson.end_time);
    if (start === null || end === null) {
      continue;
    }

    if (now.nowMinutes >= start && now.nowMinutes < end) {
      payload = { type: 'current', lesson, minutesLeft: 0 };
      break;
    }

    if (now.nowMinutes < start) {
      payload = {
        type: 'next',
        lesson,
        minutesLeft: start - now.nowMinutes
      };
      break;
    }
  }

  await sendMessage(env, chatId, formatNextClass(language, payload), {
    reply_markup: mainMenuKeyboard(language)
  });
}

async function onBroadcast({ env, chatId, language, text }) {
  if (chatId !== getAdminId(env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  if (!text) {
    await sendMessage(env, chatId, t(language, 'admin.broadcastUsage'));
    return;
  }

  const users = await getAllUsers(env.DB);
  let sent = 0;
  let failed = 0;

  for (const target of users) {
    try {
      await sendMessage(env, target.chat_id, text);
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error('broadcast_send_error', { chatId: target.chat_id, error: String(error) });
    }
  }

  await sendMessage(env, chatId, t(language, 'admin.broadcastDone', { sent, failed }));
}

async function onStats({ env, chatId, language }) {
  if (chatId !== getAdminId(env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  const stats = await getStats(env.DB);
  await sendMessage(env, chatId, formatAdminStats(language, stats));
}

async function onMorningTest({ env, chatId, language }) {
  if (chatId !== getAdminId(env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  const user = await getUser(env.DB, chatId);
  if (!user?.group_name) {
    await sendMessage(env, chatId, t(language, 'schedule.noGroup'), {
      reply_markup: groupKeyboard(language)
    });
    return;
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, now.zoned.weekday);
  const weather = await fetchHangzhouWeather();
  const firstClassIn = getMinutesUntilFirstClass(lessons, now.nowMinutes);

  await sendMessage(
    env,
    chatId,
    formatMorningMessage(user.language, {
      weather,
      lessons,
      firstClassIn
    }),
    { reply_markup: mainMenuKeyboard(user.language) }
  );
}

function detectAction(text) {
  if (matchesMenuLabel(text, 'today')) {
    return 'today';
  }
  if (matchesMenuLabel(text, 'tomorrow')) {
    return 'tomorrow';
  }
  if (matchesMenuLabel(text, 'fullWeek')) {
    return 'fullWeek';
  }
  if (matchesMenuLabel(text, 'nextClass')) {
    return 'nextClass';
  }
  if (matchesMenuLabel(text, 'settings')) {
    return 'settings';
  }
  if (matchesMenuLabel(text, 'language')) {
    return 'language';
  }
  if (matchesMenuLabel(text, 'notifications')) {
    return 'notifications';
  }
  if (matchesMenuLabel(text, 'mySettings')) {
    return 'mySettings';
  }
  if (matchesMenuLabel(text, 'changeGroup')) {
    return 'changeGroup';
  }
  if (matchesMenuLabel(text, 'back')) {
    return 'back';
  }

  if (text === getLocale('ru').labels.russian) {
    return 'langRu';
  }
  if (text === getLocale('en').labels.english || text === getLocale('ru').labels.english) {
    return 'langEn';
  }

  if (parseReminderChoice(text)) {
    return 'notifChoice';
  }

  return 'unknown';
}

function matchesMenuLabel(text, key) {
  for (const language of LOCALES) {
    if (getLocale(language).menu[key] === text) {
      return true;
    }
  }
  return false;
}

export function mainMenuKeyboard(language) {
  const menu = getLocale(language).menu;
  return {
    keyboard: [
      [menu.today, menu.tomorrow],
      [menu.fullWeek, menu.nextClass],
      [menu.settings]
    ],
    resize_keyboard: true
  };
}

function settingsKeyboard(language) {
  const menu = getLocale(language).menu;
  return {
    keyboard: [
      [menu.language, menu.notifications],
      [menu.mySettings, menu.changeGroup],
      [menu.back]
    ],
    resize_keyboard: true
  };
}

function languageKeyboard(language) {
  const menu = getLocale(language).menu;
  const labels = getLocale(language).labels;
  return {
    keyboard: [[labels.russian, labels.english], [menu.back]],
    resize_keyboard: true
  };
}

function notificationsKeyboard(language) {
  const menu = getLocale(language).menu;
  const labels = getLocale(language).labels;
  return {
    keyboard: [['5 min', '10 min'], [labels.off, menu.back]],
    resize_keyboard: true
  };
}

function groupKeyboard(language) {
  const menu = getLocale(language).menu;
  return {
    keyboard: [['2-7', '2-8'], ['5-2', '6-2'], [menu.back]],
    resize_keyboard: true
  };
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
