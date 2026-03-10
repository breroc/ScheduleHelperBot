import {
  ensureUserWithMeta,
  getAllUsers,
  getDailyCronDeliveryStats,
  getLessonsByGroupAndWeekday,
  getStats,
  getUser,
  getUsersByGroup,
  setUserGroup,
  setUserFavoriteGroups,
  setUserLanguage,
  setUserMorningEnabled,
  setUserMorningTime,
  setUserNotifications,
  getWeekLessonsByGroup
} from './db.js';
import {
  formatAdminStats,
  formatAdminUsersByGroupMessages,
  formatFullWeek,
  formatHelp,
  formatMySettings,
  formatNextClass,
  formatScheduleForToday,
  formatScheduleForTomorrow,
  formatSettingsSummary,
  prependQuickGroupHeader
} from './formatters.js';
import { sendMessage } from './telegram.js';
import { getLocale, resolveLanguage, SUPPORTED_LANGUAGES, t } from './translations.js';
import {
  CONFIG,
  addDays,
  escapeHtml,
  getBotInstanceId,
  getAdminId,
  getNowContext,
  getZonedDateParts,
  parseMorningTimeChoice,
  parseReminderChoice,
  parseTimeToMinutes,
  pickLanguageByTelegram,
  runInBatches
} from './utils.js';

export async function handleUpdate(update, env) {
  const message = update?.message;
  if (!message || typeof message.text !== 'string') {
    return;
  }

  const text = message.text.trim();
  const chatId = Number(message.chat?.id);
  if (!Number.isFinite(chatId)) {
    return;
  }

  const defaultLang = pickLanguageByTelegram(message.from?.language_code);
  if (message.chat?.type !== 'private') {
    if (text.startsWith('/')) {
      await sendMessage(env, chatId, t(defaultLang, 'common.privateOnly'));
    }
    return;
  }

  const botInstanceId = getBotInstanceId(env);
  const ensured = await ensureUserWithMeta(env.DB, chatId, defaultLang, botInstanceId, message.from);
  let user = ensured.user;
  let language = resolveLanguage(user?.language ?? defaultLang);

  if (ensured.isNewUser) {
    notifyAdminAboutNewUser(env, message).catch((error) => {
      console.error('new_user_admin_notify_error', { chatId, error: String(error) });
    });
  }

  if (text.startsWith('/')) {
    await handleCommand({ text, chatId, env, user, language });
    return;
  }

  const favoriteGroupChoice = parseFavoriteGroupChoice(text);
  if (favoriteGroupChoice) {
    await onFavoriteToggle({ env, chatId, user, language, groupName: favoriteGroupChoice });
    return;
  }

  const favoriteViewChoice = parseFavoriteViewChoice(text);
  if (favoriteViewChoice) {
    await onFavoriteQuickView({ env, chatId, user, language, ...favoriteViewChoice });
    return;
  }

  if (CONFIG.GROUPS.includes(text)) {
    const wasSelected = Boolean(user.group_name);
    await setUserGroup(env.DB, chatId, text);
    user = {
      ...user,
      group_name: text
    };
    language = resolveLanguage(user.language);

    const key = wasSelected ? 'groups.changed' : 'groups.saved';
    await sendMainMenu(env, chatId, language, t(language, key, { group: text }));
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
      await sendSettingsMenu(env, chatId, language, user);
      return;
    case 'language':
      await sendLanguagePrompt(env, chatId, language);
      return;
    case 'notifications':
      await sendNotificationPrompt(env, chatId, language);
      return;
    case 'favoritesView':
      await sendFavoritesViewPrompt(env, chatId, language, user);
      return;
    case 'favoritesManage':
      await sendFavoritesPrompt(env, chatId, language, user);
      return;
    case 'morningTime':
      await sendMorningTimePrompt(env, chatId, language, user);
      return;
    case 'morningToggle':
      await onMorningToggle({ env, chatId, user, language });
      return;
    case 'mySettings':
      user = await getUser(env.DB, chatId);
      language = resolveLanguage(user?.language ?? language);
      await sendSettingsDetails(env, chatId, language, user);
      return;
    case 'changeGroup':
      await sendGroupPrompt(env, chatId, language);
      return;
    case 'back':
      await sendMainMenu(env, chatId, language, t(language, 'common.mainMenu'));
      return;
    case 'langRu': {
      await setUserLanguage(env.DB, chatId, 'ru');
      user = {
        ...user,
        language: 'ru'
      };
      language = 'ru';
      await sendSettingsText(env, chatId, language, t(language, 'settings.languageUpdated', { language: 'Русский' }));
      return;
    }
    case 'langEn': {
      await setUserLanguage(env.DB, chatId, 'en');
      user = {
        ...user,
        language: 'en'
      };
      language = 'en';
      await sendSettingsText(env, chatId, language, t(language, 'settings.languageUpdated', { language: 'English' }));
      return;
    }
    case 'notifChoice': {
      const choice = parseReminderChoice(text);
      if (choice) {
        await setUserNotifications(env.DB, chatId, choice.enabled, choice.minutes);
        user = {
          ...user,
          notifications_enabled: choice.enabled,
          reminder_minutes: choice.minutes
        };
        language = resolveLanguage(user.language);

        const value = choice.enabled
          ? `${choice.minutes} min`
          : t(language, 'settings.disabled');

        await sendSettingsText(env, chatId, language, t(language, 'settings.notificationsUpdated', { value }));
        return;
      }
      break;
    }
    case 'morningTimeChoice': {
      const choice = parseMorningTimeChoice(text);
      if (choice) {
        await setUserMorningTime(env.DB, chatId, choice);
        user = {
          ...user,
          morning_time: choice
        };
        await sendSettingsText(env, chatId, language, t(language, 'settings.morningTimeUpdated', { value: choice }));
        return;
      }
      break;
    }
    default:
      break;
  }

  if (!user.group_name) {
    await sendGroupPrompt(env, chatId, language, t(language, 'schedule.noGroup'));
    return;
  }

  await sendMainMenu(env, chatId, language, t(language, 'common.unknownCommand'));
}

async function handleCommand({ text, chatId, env, user, language }) {
  const trimmedText = String(text ?? '').trim();
  const match = trimmedText.match(/^(\S+)(?:\s+([\s\S]*))?$/);
  const rawCommand = match?.[1] ?? '';
  const argsText = match?.[2]?.trim() ?? '';
  const command = String(rawCommand || '')
    .split('@')[0]
    .toLowerCase();

  if (command === '/start') {
    if (!user.group_name) {
      await sendGroupPrompt(env, chatId, language, t(language, 'start.newUser'));
      return;
    }

    await sendMainMenu(env, chatId, language, t(language, 'start.knownUser'));
    return;
  }

  if (command === '/broadcast') {
    await onBroadcast({ env, chatId, language, text: argsText });
    return;
  }

  if (command === '/broadcastgroup') {
    await onBroadcastGroup({ env, chatId, language, argsText });
    return;
  }

  if (command === '/today') {
    await onTodayCommand({ env, chatId, user, language, argsText });
    return;
  }

  if (command === '/tomorrow') {
    await onTomorrowCommand({ env, chatId, user, language, argsText });
    return;
  }

  if (command === '/week' || command === '/fullweek') {
    await onWeekCommand({ env, chatId, user, language, argsText });
    return;
  }

  if (command === '/next' || command === '/nextclass') {
    await onNextClass({ env, chatId, user, language });
    return;
  }

  if (command === '/settings') {
    await sendSettingsMenu(env, chatId, language, user);
    return;
  }

  if (command === '/language') {
    await sendLanguagePrompt(env, chatId, language);
    return;
  }

  if (command === '/notifications') {
    await sendNotificationPrompt(env, chatId, language);
    return;
  }

  if (command === '/favorites') {
    await onFavoritesCommand({ env, chatId, user, language, argsText });
    return;
  }

  if (command === '/morning') {
    await onMorningToggle({ env, chatId, user, language });
    return;
  }

  if (command === '/morningtime') {
    await onMorningTimeCommand({ env, chatId, user, language, argsText });
    return;
  }

  if (command === '/mysettings') {
    const freshUser = await getUser(env.DB, chatId);
    await sendSettingsDetails(env, chatId, language, freshUser ?? user);
    return;
  }

  if (command === '/changegroup') {
    await sendGroupPrompt(env, chatId, language);
    return;
  }

  if (command === '/stats') {
    await onStats({ env, chatId, language });
    return;
  }

  if (command === '/help') {
    await onHelp({ env, chatId, language });
    return;
  }

  await sendMainMenu(env, chatId, language, t(language, 'common.unknownCommand'));
}

async function onToday({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, now.zoned.weekday);

  await sendMainMenu(env, chatId, language, formatScheduleForToday(language, lessons, now.nowMinutes));
}

async function onTodayCommand({ env, chatId, user, language, argsText }) {
  const requestedGroup = parseRequestedGroupArg(argsText);

  if (requestedGroup && !CONFIG.GROUPS.includes(requestedGroup)) {
    await sendMessage(
      env,
      chatId,
      `${t(language, 'common.invalidGroup', { groups: CONFIG.GROUPS.join(', ') })}\n${t(language, 'common.todayUsage')}`,
      { reply_markup: mainMenuKeyboard(language) }
    );
    return;
  }

  const targetGroup = requestedGroup || user.group_name;
  if (!targetGroup) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, targetGroup, now.zoned.weekday);
  let text = formatScheduleForToday(language, lessons, now.nowMinutes);

  if (requestedGroup) {
    text = prependQuickGroupHeader(language, targetGroup, text);
  }

  await sendMainMenu(env, chatId, language, text);
}

async function onTomorrowCommand({ env, chatId, user, language, argsText }) {
  const requestedGroup = parseRequestedGroupArg(argsText);

  if (requestedGroup && !CONFIG.GROUPS.includes(requestedGroup)) {
    await sendMessage(
      env,
      chatId,
      `${t(language, 'common.invalidGroup', { groups: CONFIG.GROUPS.join(', ') })}\n${t(language, 'common.tomorrowUsage')}`,
      { reply_markup: mainMenuKeyboard(language) }
    );
    return;
  }

  const targetGroup = requestedGroup || user.group_name;
  if (!targetGroup) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const tomorrow = addDays(new Date(), 1);
  const parts = getZonedDateParts(tomorrow, CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, targetGroup, parts.weekday);
  let text = formatScheduleForTomorrow(language, lessons);

  if (requestedGroup) {
    text = prependQuickGroupHeader(language, targetGroup, text);
  }

  await sendMainMenu(env, chatId, language, text);
}

async function onTomorrow({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const tomorrow = addDays(new Date(), 1);
  const parts = getZonedDateParts(tomorrow, CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, parts.weekday);

  await sendMainMenu(env, chatId, language, formatScheduleForTomorrow(language, lessons));
}

async function onWeekCommand({ env, chatId, user, language, argsText }) {
  const requestedGroup = parseRequestedGroupArg(argsText);

  if (requestedGroup && !CONFIG.GROUPS.includes(requestedGroup)) {
    await sendMessage(
      env,
      chatId,
      `${t(language, 'common.invalidGroup', { groups: CONFIG.GROUPS.join(', ') })}\n${t(language, 'common.weekUsage')}`,
      { reply_markup: mainMenuKeyboard(language) }
    );
    return;
  }

  const targetGroup = requestedGroup || user.group_name;
  if (!targetGroup) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const lessons = await getWeekLessonsByGroup(env.DB, targetGroup);
  let text = formatFullWeek(language, lessons);

  if (requestedGroup) {
    text = prependQuickGroupHeader(language, targetGroup, text);
  }

  await sendMainMenu(env, chatId, language, text);
}

async function onFullWeek({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const lessons = await getWeekLessonsByGroup(env.DB, user.group_name);
  await sendMainMenu(env, chatId, language, formatFullWeek(language, lessons));
}

async function onNextClass({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, now.zoned.weekday);

  let payload = { type: 'none' };
  for (let i = 0; i < lessons.length; i += 1) {
    const lesson = lessons[i];
    const start = parseTimeToMinutes(lesson.start_time);
    const end = parseTimeToMinutes(lesson.end_time);
    if (start === null || end === null) {
      continue;
    }

    if (now.nowMinutes >= start && now.nowMinutes < end) {
      const nextLesson = lessons[i + 1] ?? null;
      payload = {
        type: nextLesson ? 'current_with_next' : 'current',
        lesson,
        minutesLeft: end - now.nowMinutes,
        nextLesson
      };
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

  await sendMainMenu(env, chatId, language, formatNextClass(language, payload));
}

async function onBroadcast({ env, chatId, language, text }) {
  if (!isAdmin(chatId, env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  if (!text) {
    await sendMessage(env, chatId, t(language, 'admin.broadcastUsage'));
    return;
  }

  const users = await getAllUsers(env.DB);
  const safeText = escapeHtml(text).replaceAll('\r\n', '\n');
  const results = await runInBatches(users, async (target) => {
    try {
      await sendMessage(env, target.chat_id, safeText);
    } catch (error) {
      console.error('broadcast_send_error', { chatId: target.chat_id, error: String(error) });
      throw error;
    }
  });

  const sent = results.filter((result) => result.status === 'fulfilled').length;
  const failed = results.length - sent;
  console.log('broadcast_summary', { total: results.length, sent, failed });

  await sendMessage(env, chatId, t(language, 'admin.broadcastDone', { sent, failed }));
}

async function onBroadcastGroup({ env, chatId, language, argsText }) {
  if (!isAdmin(chatId, env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  const trimmedArgs = String(argsText || '').trim();
  const match = trimmedArgs.match(/^(\S+)(?:\s+([\s\S]+))?$/);
  const targetGroup = match?.[1] ?? '';
  const messageText = match?.[2]?.trim() ?? '';

  if (!CONFIG.GROUPS.includes(targetGroup) || !messageText) {
    await sendMessage(env, chatId, t(language, 'admin.broadcastGroupUsage'));
    return;
  }

  const users = await getUsersByGroup(env.DB, targetGroup);
  const safeText = escapeHtml(messageText).replaceAll('\r\n', '\n');
  const results = await runInBatches(users, async (target) => {
    try {
      await sendMessage(env, target.chat_id, safeText);
    } catch (error) {
      console.error('broadcast_group_send_error', {
        group: targetGroup,
        chatId: target.chat_id,
        error: String(error)
      });
      throw error;
    }
  });

  const sent = results.filter((result) => result.status === 'fulfilled').length;
  const failed = results.length - sent;
  console.log('broadcast_group_summary', { group: targetGroup, total: results.length, sent, failed });

  await sendMessage(env, chatId, t(language, 'admin.broadcastGroupDone', {
    group: targetGroup,
    sent,
    failed
  }));
}

async function onStats({ env, chatId, language }) {
  if (!isAdmin(chatId, env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const stats = await getStats(env.DB);
  let dailyStats = null;
  try {
    dailyStats = await getDailyCronDeliveryStats(env.DB, now.dateKey);
  } catch (error) {
    console.error('stats_daily_fetch_error', error);
  }

  await sendMessage(env, chatId, formatAdminStats(language, stats, dailyStats, now.dateKey));

  const membersMessages = formatAdminUsersByGroupMessages(language, stats.byGroupMembers);
  for (const text of membersMessages) {
    try {
      await sendMessage(env, chatId, text);
    } catch (error) {
      console.error('stats_members_send_error', { chatId, error: String(error) });
    }
  }
}

async function onHelp({ env, chatId, language }) {
  await sendMainMenu(env, chatId, language, formatHelp(language, isAdmin(chatId, env)));
}

async function onFavoritesCommand({ env, chatId, user, language, argsText }) {
  const groups = String(argsText || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!groups.length) {
    await sendFavoritesPrompt(env, chatId, language, user);
    return;
  }

  if (groups.some((groupName) => !CONFIG.GROUPS.includes(groupName))) {
    await sendMessage(
      env,
      chatId,
      `${t(language, 'common.invalidGroup', { groups: CONFIG.GROUPS.join(', ') })}\n${t(language, 'common.favoritesUsage')}`,
      {
        reply_markup: favoritesKeyboard(language, user.favorite_groups ?? [])
      }
    );
    return;
  }

  if ([...new Set(groups)].length > 2) {
    await sendMessage(env, chatId, t(language, 'settings.favoritesLimit'), {
      reply_markup: favoritesKeyboard(language, user.favorite_groups ?? [])
    });
    return;
  }

  const favoriteGroups = [...new Set(groups)].slice(0, 2);
  await setUserFavoriteGroups(env.DB, chatId, favoriteGroups);
  const value = favoriteGroups.length ? favoriteGroups.join(', ') : t(language, 'settings.noFavorites');
  await sendSettingsText(env, chatId, language, t(language, 'settings.favoritesUpdated', { value }));
}

async function onMorningTimeCommand({ env, chatId, user, language, argsText }) {
  const choice = parseMorningTimeChoice(argsText);
  if (!choice) {
    await sendMorningTimePrompt(env, chatId, language, user);
    return;
  }

  await setUserMorningTime(env.DB, chatId, choice);
  await sendSettingsText(env, chatId, language, t(language, 'settings.morningTimeUpdated', { value: choice }));
}

async function onMorningToggle({ env, chatId, user, language }) {
  const nextValue = Number(user?.morning_enabled) === 1 ? 0 : 1;
  await setUserMorningEnabled(env.DB, chatId, nextValue);
  const freshUser = {
    ...user,
    morning_enabled: nextValue
  };
  const freshLanguage = resolveLanguage(freshUser.language ?? language);
  const value = Number(freshUser.morning_enabled) === 1
    ? t(freshLanguage, 'settings.enabled')
    : t(freshLanguage, 'settings.disabled');

  await sendSettingsText(env, chatId, freshLanguage, t(freshLanguage, 'settings.morningUpdated', { value }));
}

async function onFavoriteToggle({ env, chatId, user, language, groupName }) {
  const currentFavorites = Array.isArray(user.favorite_groups) ? [...user.favorite_groups] : [];
  const hasGroup = currentFavorites.includes(groupName);
  let nextFavorites = currentFavorites;

  if (hasGroup) {
    nextFavorites = currentFavorites.filter((item) => item !== groupName);
  } else {
    if (currentFavorites.length >= 2) {
      await sendMessage(env, chatId, t(language, 'settings.favoritesLimit'), {
        reply_markup: favoritesKeyboard(language, currentFavorites)
      });
      return;
    }
    nextFavorites = [...currentFavorites, groupName];
  }

  await setUserFavoriteGroups(env.DB, chatId, nextFavorites);
  user.favorite_groups = nextFavorites;
  const value = nextFavorites.length ? nextFavorites.join(', ') : t(language, 'settings.noFavorites');

  await sendMessage(env, chatId, t(language, 'settings.favoritesUpdated', { value }), {
    reply_markup: favoritesKeyboard(language, nextFavorites)
  });
}

async function onFavoriteQuickView({ env, chatId, user, language, groupName, viewType }) {
  const favoriteGroups = Array.isArray(user?.favorite_groups) ? user.favorite_groups : [];
  if (!favoriteGroups.includes(groupName)) {
    await sendFavoritesViewPrompt(env, chatId, language, user);
    return;
  }

  if (viewType === 'today') {
    const now = getNowContext(new Date(), CONFIG.TIMEZONE);
    const lessons = await getLessonsByGroupAndWeekday(env.DB, groupName, now.zoned.weekday);
    const text = prependQuickGroupHeader(language, groupName, formatScheduleForToday(language, lessons, now.nowMinutes));
    await sendMessage(env, chatId, text, {
      reply_markup: favoritesViewKeyboard(language, favoriteGroups)
    });
    return;
  }

  if (viewType === 'tomorrow') {
    const tomorrow = addDays(new Date(), 1);
    const parts = getZonedDateParts(tomorrow, CONFIG.TIMEZONE);
    const lessons = await getLessonsByGroupAndWeekday(env.DB, groupName, parts.weekday);
    const text = prependQuickGroupHeader(language, groupName, formatScheduleForTomorrow(language, lessons));
    await sendMessage(env, chatId, text, {
      reply_markup: favoritesViewKeyboard(language, favoriteGroups)
    });
    return;
  }

  const lessons = await getWeekLessonsByGroup(env.DB, groupName);
  const text = prependQuickGroupHeader(language, groupName, formatFullWeek(language, lessons));
  await sendMessage(env, chatId, text, {
    reply_markup: favoritesViewKeyboard(language, favoriteGroups)
  });
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
  if (matchesMenuLabel(text, 'favoritesView')) {
    return 'favoritesView';
  }
  if (matchesMenuLabel(text, 'favoritesManage')) {
    return 'favoritesManage';
  }
  if (matchesMenuLabel(text, 'morningTime')) {
    return 'morningTime';
  }
  if (matchesMenuLabel(text, 'morningToggle')) {
    return 'morningToggle';
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
  if (parseMorningTimeChoice(text)) {
    return 'morningTimeChoice';
  }

  return 'unknown';
}

function matchesMenuLabel(text, key) {
  for (const language of SUPPORTED_LANGUAGES) {
    if (getLocale(language).menu[key] === text) {
      return true;
    }
  }
  return false;
}

function isAdmin(chatId, env) {
  return chatId === getAdminId(env);
}

async function sendMainMenu(env, chatId, language, text) {
  await sendMessage(env, chatId, text, {
    reply_markup: mainMenuKeyboard(language)
  });
}

async function sendSettingsText(env, chatId, language, text) {
  await sendMessage(env, chatId, text, {
    reply_markup: settingsKeyboard(language)
  });
}

async function sendSettingsMenu(env, chatId, language, user) {
  await sendSettingsText(env, chatId, language, formatSettingsSummary(language, user));
}

async function sendSettingsDetails(env, chatId, language, user) {
  await sendSettingsText(env, chatId, language, formatMySettings(language, user));
}

async function sendGroupPrompt(env, chatId, language, prefixText = '') {
  const body = prefixText
    ? `${prefixText}\n\n${t(language, 'common.chooseGroup')}`
    : t(language, 'common.chooseGroup');

  await sendMessage(env, chatId, body, {
    reply_markup: groupKeyboard(language)
  });
}

async function sendNoGroupSelected(env, chatId, language) {
  await sendMessage(env, chatId, t(language, 'schedule.noGroup'), {
    reply_markup: groupKeyboard(language)
  });
}

async function sendLanguagePrompt(env, chatId, language) {
  await sendMessage(env, chatId, t(language, 'common.pickLanguage'), {
    reply_markup: languageKeyboard(language)
  });
}

async function sendNotificationPrompt(env, chatId, language) {
  await sendMessage(env, chatId, t(language, 'common.pickNotifications'), {
    reply_markup: notificationsKeyboard(language)
  });
}

async function sendFavoritesPrompt(env, chatId, language, user) {
  const favorites = Array.isArray(user?.favorite_groups) && user.favorite_groups.length
    ? user.favorite_groups.join(', ')
    : t(language, 'settings.noFavorites');

  const text = `${t(language, 'common.pickFavorites')}\n\n${t(language, 'settings.favorites')}: <b>${escapeHtml(favorites)}</b>`;
  await sendMessage(env, chatId, text, {
    reply_markup: favoritesKeyboard(language, user?.favorite_groups ?? [])
  });
}

async function sendFavoritesViewPrompt(env, chatId, language, user) {
  const favoriteGroups = Array.isArray(user?.favorite_groups) ? user.favorite_groups : [];
  if (!favoriteGroups.length) {
    await sendMessage(env, chatId, t(language, 'settings.noFavoritesView'), {
      reply_markup: mainMenuKeyboard(language)
    });
    return;
  }

  await sendMessage(env, chatId, t(language, 'common.pickFavoriteView'), {
    reply_markup: favoritesViewKeyboard(language, favoriteGroups)
  });
}

async function sendMorningTimePrompt(env, chatId, language, user) {
  const currentValue = user?.morning_time || CONFIG.DEFAULT_MORNING_TIME;
  const text = `${t(language, 'common.pickMorningTime')}\n\n${t(language, 'settings.morningTime')}: <b>${escapeHtml(currentValue)}</b>`;
  await sendMessage(env, chatId, text, {
    reply_markup: morningTimeKeyboard(language, currentValue)
  });
}

export function mainMenuKeyboard(language) {
  const menu = getLocale(language).menu;
  return {
    keyboard: [
      [menu.today, menu.tomorrow],
      [menu.fullWeek, menu.nextClass],
      [menu.favoritesView, menu.settings]
    ],
    resize_keyboard: true
  };
}

function settingsKeyboard(language) {
  const menu = getLocale(language).menu;
  return {
    keyboard: [
      [menu.language, menu.notifications],
      [menu.favoritesManage, menu.morningTime],
      [menu.mySettings, menu.changeGroup],
      [menu.morningToggle],
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

function favoritesKeyboard(language, favoriteGroups = []) {
  const menu = getLocale(language).menu;
  const favorites = new Set(Array.isArray(favoriteGroups) ? favoriteGroups : []);
  const rows = [];

  for (let index = 0; index < CONFIG.GROUPS.length; index += 2) {
    rows.push(
      CONFIG.GROUPS.slice(index, index + 2).map((groupName) => `${favorites.has(groupName) ? '✅' : '⭐'} ${groupName}`)
    );
  }

  return {
    keyboard: [...rows, [menu.back]],
    resize_keyboard: true
  };
}

function favoritesViewKeyboard(language, favoriteGroups = []) {
  const menu = getLocale(language).menu;
  const rows = [];

  for (const groupName of favoriteGroups) {
    rows.push([`📅 ${groupName}`, `📆 ${groupName}`]);
    rows.push([`📖 ${groupName}`]);
  }

  return {
    keyboard: [...rows, [menu.back]],
    resize_keyboard: true
  };
}

function morningTimeKeyboard(language, currentValue) {
  const menu = getLocale(language).menu;
  const options = CONFIG.MORNING_TIME_OPTIONS;
  const rows = [];

  for (let index = 0; index < options.length; index += 2) {
    rows.push(options.slice(index, index + 2).map((value) => (value === currentValue ? `✅ ${value}` : value)));
  }

  return {
    keyboard: [...rows, [menu.back]],
    resize_keyboard: true
  };
}

function groupKeyboard(language) {
  const menu = getLocale(language).menu;
  const rows = [];
  for (let index = 0; index < CONFIG.GROUPS.length; index += 2) {
    rows.push(CONFIG.GROUPS.slice(index, index + 2));
  }

  return {
    keyboard: [...rows, [menu.back]],
    resize_keyboard: true
  };
}

async function notifyAdminAboutNewUser(env, message) {
  const adminId = getAdminId(env);
  const chatId = Number(message?.chat?.id);
  if (!Number.isFinite(adminId) || adminId <= 0 || chatId === adminId) {
    return;
  }

  const from = message?.from ?? {};
  const username = from.username ? `@${from.username}` : '-';
  const firstName = from.first_name ?? '-';
  const lastName = from.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  const languageCode = from.language_code ?? '-';

  const text = [
    '🆕 <b>New user joined bot</b>',
    '',
    `🆔 <b>${chatId}</b>`,
    `👤 ${escapeHtml(fullName || '-')}`,
    `🔗 ${escapeHtml(username)}`,
    `🌐 ${escapeHtml(languageCode)}`
  ].join('\n');

  try {
    await sendMessage(env, adminId, text);
  } catch (error) {
    console.error('new_user_admin_notify_error', { adminId, chatId, error: String(error) });
  }
}

function parseRequestedGroupArg(argsText) {
  const candidate = String(argsText || '').trim().split(/\s+/).filter(Boolean)[0] ?? '';
  return candidate || null;
}

function parseFavoriteGroupChoice(text) {
  const matched = String(text ?? '').trim().match(/^(?:✅|⭐)\s*(.+)$/);
  const groupName = matched?.[1]?.trim() ?? '';
  return CONFIG.GROUPS.includes(groupName) ? groupName : null;
}

function parseFavoriteViewChoice(text) {
  const matched = String(text ?? '').trim().match(/^(📅|📆|📖)\s+(.+)$/);
  const icon = matched?.[1] ?? '';
  const groupName = matched?.[2]?.trim() ?? '';
  if (!CONFIG.GROUPS.includes(groupName)) {
    return null;
  }

  if (icon === '📅') {
    return { groupName, viewType: 'today' };
  }
  if (icon === '📆') {
    return { groupName, viewType: 'tomorrow' };
  }
  if (icon === '📖') {
    return { groupName, viewType: 'week' };
  }

  return null;
}
