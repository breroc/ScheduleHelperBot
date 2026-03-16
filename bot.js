import {
  clearUserNoteFlow,
  cleanupInactiveUsers,
  deleteLessonNote,
  ensureUserWithMeta,
  getAllUsers,
  getDailyCronDeliveryStats,
  getLessonNotesForUserGroup,
  getInactiveUsers,
  getLessonsByGroupAndWeekday,
  getStats,
  getUser,
  getUsersByGroup,
  markUserInactive,
  setUserNoteFlow,
  setUserGroup,
  setUserFavoriteGroups,
  setUserLanguage,
  setUserMorningEnabled,
  setUserMorningTime,
  setUserReminderMuteUntilDate,
  setUserNotifications,
  upsertLessonNote,
  getWeekLessonsByGroup
} from './db.js';
import {
  formatAdminInactiveUsersMessage,
  formatAdminStats,
  formatAdminUserCard,
  formatEveningPreview,
  formatFullWeek,
  formatHelp,
  formatLessonNotesOverview,
  formatMorningMessage,
  formatMySettings,
  formatNextClass,
  formatScheduleForToday,
  formatScheduleForTomorrow,
  formatSettingsSummary,
  prependQuickGroupHeader
} from './formatters.js';
import {
  answerCallbackQuery,
  editMessageText,
  editMessageReplyMarkup,
  isTelegramUserUnavailableError,
  sendMessage
} from './telegram.js';
import { getLocale, resolveLanguage, SUPPORTED_LANGUAGES, t } from './translations.js';
import {
  CONFIG,
  addDays,
  escapeHtml,
  fetchHangzhouWeather,
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
  const callbackQuery = update?.callback_query;
  if (callbackQuery?.id) {
    await handleCallbackQuery(callbackQuery, env);
    return;
  }

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

  if (user?.note_flow_step) {
    const handledNoteFlow = await tryHandleNoteFlowInput({ env, chatId, user, language, text });
    if (handledNoteFlow) {
      return;
    }
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

  const selectedGroup = parseGroupChoice(text);
  if (selectedGroup) {
    const wasSelected = Boolean(user.group_name);
    await setUserGroup(env.DB, chatId, selectedGroup);
    user = {
      ...user,
      group_name: selectedGroup
    };
    language = resolveLanguage(user.language);

    const key = wasSelected ? 'groups.changed' : 'groups.saved';
    await sendMainMenu(env, chatId, language, t(language, key, { group: selectedGroup }));
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
    case 'muteToday':
      await onMuteToday({ env, chatId, user, language });
      return;
    case 'favoritesView':
      await sendFavoritesViewPrompt(env, chatId, language, user);
      return;
    case 'favoritesManage':
      await sendFavoritesPrompt(env, chatId, language, user);
      return;
    case 'notesMenu':
      await sendNotesMenu(env, chatId, language, user);
      return;
    case 'notesAdd':
      await sendNoteWeekdayPrompt(env, chatId, language, user, 'add');
      return;
    case 'notesView':
      await onNotesView({ env, chatId, user, language });
      return;
    case 'notesDelete':
      await sendNoteWeekdayPrompt(env, chatId, language, user, 'delete');
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
    case 'langZh': {
      await setUserLanguage(env.DB, chatId, 'zh');
      user = {
        ...user,
        language: 'zh'
      };
      language = 'zh';
      await sendSettingsText(env, chatId, language, t(language, 'settings.languageUpdated', { language: '中文' }));
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

  if (command === '/mutetoday') {
    await onMuteToday({ env, chatId, user, language });
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

  if (command === '/user') {
    await onAdminUser({ env, chatId, language, argsText });
    return;
  }

  if (command === '/inactive') {
    await onInactive({ env, chatId, language });
    return;
  }

  if (command === '/cleanupinactive') {
    await onCleanupInactive({ env, chatId, language });
    return;
  }

  if (command === '/morningtest') {
    await onMorningTest({ env, chatId, user, language });
    return;
  }

  if (command === '/eveningtest') {
    await onEveningTest({ env, chatId, user, language });
    return;
  }

  if (command === '/help') {
    await onHelp({ env, chatId, language });
    return;
  }

  await sendMainMenu(env, chatId, language, t(language, 'common.unknownCommand'));
}

async function handleCallbackQuery(query, env) {
  const data = String(query?.data ?? '').trim();
  const chatId = Number(query?.message?.chat?.id);
  const messageId = Number(query?.message?.message_id);
  if (!data || !Number.isFinite(chatId) || !Number.isFinite(messageId)) {
    if (query?.id) {
      await answerCallbackQuery(env, query.id).catch(() => {});
    }
    return;
  }

  const defaultLang = pickLanguageByTelegram(query?.from?.language_code);
  if (query?.message?.chat?.type !== 'private') {
    await answerCallbackQuery(env, query.id, { text: t(defaultLang, 'common.privateOnly') }).catch(() => {});
    return;
  }

  const botInstanceId = getBotInstanceId(env);
  const ensured = await ensureUserWithMeta(env.DB, chatId, defaultLang, botInstanceId, query.from);
  const user = ensured.user;
  const language = resolveLanguage(user?.language ?? defaultLang);

  try {
    if (data === 'settings:open' || data === 'settings:back') {
      await renderInlineSettingsMenu(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:close') {
      await clearInlineKeyboard(env, chatId, messageId);
      await sendMainMenu(env, chatId, language, t(language, 'common.mainMenu'));
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:language') {
      await renderInlineLanguageMenu(env, chatId, messageId, language);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data.startsWith('settings:language:')) {
      const nextLanguage = resolveLanguage(data.slice('settings:language:'.length) || language);
      await setUserLanguage(env.DB, chatId, nextLanguage);
      const freshUser = { ...user, language: nextLanguage };
      await renderInlineSettingsMenu(env, chatId, messageId, nextLanguage, freshUser, {
        prefixText: t(nextLanguage, 'settings.languageUpdated', {
          language: getLocale(nextLanguage).labels[
            nextLanguage === 'ru' ? 'russian' : nextLanguage === 'zh' ? 'chinese' : 'english'
          ]
        })
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:notifications') {
      await renderInlineNotificationsMenu(env, chatId, messageId, language);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data.startsWith('settings:notifications:')) {
      const choiceRaw = data.slice('settings:notifications:'.length);
      const choice = parseReminderChoice(choiceRaw);
      if (!choice) {
        await answerCallbackQuery(env, query.id);
        return;
      }

      await setUserNotifications(env.DB, chatId, choice.enabled, choice.minutes);
      const freshUser = {
        ...user,
        notifications_enabled: choice.enabled,
        reminder_minutes: choice.minutes
      };
      const value = choice.enabled ? `${choice.minutes} min` : t(language, 'settings.disabled');
      await renderInlineSettingsMenu(env, chatId, messageId, language, freshUser, {
        prefixText: t(language, 'settings.notificationsUpdated', { value })
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:morning-time') {
      await renderInlineMorningTimeMenu(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data.startsWith('settings:morning-time:')) {
      const choice = parseMorningTimeChoice(data.slice('settings:morning-time:'.length));
      if (!choice) {
        await answerCallbackQuery(env, query.id);
        return;
      }

      await setUserMorningTime(env.DB, chatId, choice);
      const freshUser = {
        ...user,
        morning_time: choice
      };
      await renderInlineSettingsMenu(env, chatId, messageId, language, freshUser, {
        prefixText: t(language, 'settings.morningTimeUpdated', { value: choice })
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:morning-toggle') {
      const nextValue = Number(user?.morning_enabled) === 1 ? 0 : 1;
      await setUserMorningEnabled(env.DB, chatId, nextValue);
      const freshUser = {
        ...user,
        morning_enabled: nextValue
      };
      const value = nextValue === 1 ? t(language, 'settings.enabled') : t(language, 'settings.disabled');
      await renderInlineSettingsMenu(env, chatId, messageId, language, freshUser, {
        prefixText: t(language, 'settings.morningUpdated', { value })
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:favorites') {
      await renderInlineFavoritesMenu(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data.startsWith('settings:favorites:toggle:')) {
      const groupName = data.slice('settings:favorites:toggle:'.length);
      if (!CONFIG.GROUPS.includes(groupName)) {
        await answerCallbackQuery(env, query.id);
        return;
      }

      const currentFavorites = Array.isArray(user.favorite_groups) ? [...user.favorite_groups] : [];
      const hasGroup = currentFavorites.includes(groupName);
      let nextFavorites = currentFavorites;

      if (hasGroup) {
        nextFavorites = currentFavorites.filter((item) => item !== groupName);
      } else {
        if (currentFavorites.length >= 2) {
          await answerCallbackQuery(env, query.id, { text: t(language, 'settings.favoritesLimit') });
          return;
        }
        nextFavorites = [...currentFavorites, groupName];
      }

      await setUserFavoriteGroups(env.DB, chatId, nextFavorites);
      const freshUser = {
        ...user,
        favorite_groups: nextFavorites
      };
      await renderInlineFavoritesMenu(env, chatId, messageId, language, freshUser, {
        prefixText: t(language, 'settings.favoritesUpdated', {
          value: nextFavorites.length ? nextFavorites.join(', ') : t(language, 'settings.noFavorites')
        })
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:favorites:back') {
      await renderInlineSettingsMenu(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:notes') {
      await renderInlineNotesMenu(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:notes:back') {
      await renderInlineSettingsMenu(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:notes:menu') {
      await renderInlineNotesMenu(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:notes:add') {
      await renderInlineNoteWeekdayMenu(env, chatId, messageId, language, user, 'add');
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:notes:view') {
      await renderInlineNotesOverview(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:notes:delete') {
      await renderInlineNoteWeekdayMenu(env, chatId, messageId, language, user, 'delete');
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data.startsWith('settings:notes:add:day:')) {
      const weekday = Number(data.slice('settings:notes:add:day:'.length));
      if (!Number.isFinite(weekday)) {
        await answerCallbackQuery(env, query.id);
        return;
      }
      await renderInlineNoteLessonMenu(env, chatId, messageId, language, user, weekday, 'add');
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data.startsWith('settings:notes:delete:day:')) {
      const weekday = Number(data.slice('settings:notes:delete:day:'.length));
      if (!Number.isFinite(weekday)) {
        await answerCallbackQuery(env, query.id);
        return;
      }
      await renderInlineNoteLessonMenu(env, chatId, messageId, language, user, weekday, 'delete');
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data.startsWith('settings:notes:add:lesson:')) {
      const payload = data.slice('settings:notes:add:lesson:'.length);
      const [weekdayRaw, lessonNumberRaw] = payload.split(':');
      const weekday = Number(weekdayRaw);
      const lessonNumber = Number(lessonNumberRaw);
      if (!Number.isFinite(weekday) || !Number.isFinite(lessonNumber)) {
        await answerCallbackQuery(env, query.id);
        return;
      }

      const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, weekday);
      const selectedLesson = lessons.find((lesson) => Number(lesson.lesson_number) === lessonNumber);
      if (!selectedLesson) {
        await answerCallbackQuery(env, query.id);
        return;
      }

      await setUserNoteFlow(env.DB, chatId, 'notes:add:text', weekday, lessonNumber);
      await editOrSendMessage(env, chatId, messageId, t(language, 'notes.sendText', {
        lesson: escapeHtml(buildLessonSelectionLabel(selectedLesson)),
        day: escapeHtml(t(language, `weekdays.${weekday}`))
      }), {
        reply_markup: inlineNoteTextKeyboard(language)
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data.startsWith('settings:notes:delete:lesson:')) {
      const payload = data.slice('settings:notes:delete:lesson:'.length);
      const [weekdayRaw, lessonNumberRaw] = payload.split(':');
      const weekday = Number(weekdayRaw);
      const lessonNumber = Number(lessonNumberRaw);
      if (!Number.isFinite(weekday) || !Number.isFinite(lessonNumber)) {
        await answerCallbackQuery(env, query.id);
        return;
      }

      await deleteLessonNote(env.DB, chatId, user.group_name, weekday, lessonNumber);
      await renderInlineNotesMenu(env, chatId, messageId, language, user, {
        prefixText: t(language, 'notes.deleted')
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:my-settings') {
      await renderInlineSettingsDetails(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:my-settings:back') {
      await renderInlineSettingsMenu(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:change-group') {
      await renderInlineGroupMenu(env, chatId, messageId, language);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data === 'settings:change-group:back') {
      await renderInlineSettingsMenu(env, chatId, messageId, language, user);
      await answerCallbackQuery(env, query.id);
      return;
    }

    if (data.startsWith('settings:change-group:select:')) {
      const groupName = data.slice('settings:change-group:select:'.length);
      if (!CONFIG.GROUPS.includes(groupName)) {
        await answerCallbackQuery(env, query.id);
        return;
      }

      await setUserGroup(env.DB, chatId, groupName);
      const freshUser = {
        ...user,
        group_name: groupName
      };
      await renderInlineSettingsMenu(env, chatId, messageId, language, freshUser, {
        prefixText: t(language, 'groups.changed', { group: groupName })
      });
      await answerCallbackQuery(env, query.id);
      return;
    }

    await answerCallbackQuery(env, query.id);
  } catch (error) {
    console.error('callback_query_error', { chatId, data, error: String(error) });
    await answerCallbackQuery(env, query.id, { text: 'Error' }).catch(() => {});
  }
}

async function onToday({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, now.zoned.weekday);
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, user.group_name, lessons);

  await sendMainMenu(env, chatId, language, formatScheduleForToday(language, lessonsWithNotes, now.nowMinutes, now.date));
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
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, targetGroup, lessons);
  let text = formatScheduleForToday(language, lessonsWithNotes, now.nowMinutes, now.date);

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
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, targetGroup, lessons);
  let text = formatScheduleForTomorrow(language, lessonsWithNotes, tomorrow);

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
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, user.group_name, lessons);

  await sendMainMenu(env, chatId, language, formatScheduleForTomorrow(language, lessonsWithNotes, tomorrow));
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
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, targetGroup, lessons);
  let text = formatFullWeek(language, lessonsWithNotes);

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
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, user.group_name, lessons);
  await sendMainMenu(env, chatId, language, formatFullWeek(language, lessonsWithNotes));
}

async function onNextClass({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, now.zoned.weekday);
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, user.group_name, lessons);

  let payload = { type: 'none' };
  for (let i = 0; i < lessonsWithNotes.length; i += 1) {
    const lesson = lessonsWithNotes[i];
    const start = parseTimeToMinutes(lesson.start_time);
    const end = parseTimeToMinutes(lesson.end_time);
    if (start === null || end === null) {
      continue;
    }

    if (now.nowMinutes >= start && now.nowMinutes < end) {
      const nextLesson = lessonsWithNotes[i + 1] ?? null;
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
      if (isTelegramUserUnavailableError(error)) {
        await markUserInactive(env.DB, target.chat_id);
      }
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
      if (isTelegramUserUnavailableError(error)) {
        await markUserInactive(env.DB, target.chat_id);
      }
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

  const statsMessages = formatAdminStats(language, stats, dailyStats, now.dateKey);
  for (const text of statsMessages) {
    try {
      await sendMessage(env, chatId, text);
    } catch (error) {
      console.error('stats_send_error', { chatId, error: String(error) });
    }
  }
}

async function onInactive({ env, chatId, language }) {
  if (!isAdmin(chatId, env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  const inactiveUsers = await getInactiveUsers(env.DB);
  await sendMessage(env, chatId, formatAdminInactiveUsersMessage(language, inactiveUsers));
}

async function onCleanupInactive({ env, chatId, language }) {
  if (!isAdmin(chatId, env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  const removed = await cleanupInactiveUsers(env.DB);
  await sendMessage(env, chatId, t(language, 'admin.cleanupInactiveDone', { count: removed }));
}

async function onAdminUser({ env, chatId, language, argsText }) {
  if (!isAdmin(chatId, env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  const targetChatId = Number(String(argsText || '').trim());
  if (!Number.isFinite(targetChatId)) {
    await sendMessage(env, chatId, t(language, 'admin.userUsage'));
    return;
  }

  const targetUser = await getUser(env.DB, targetChatId);
  if (!targetUser) {
    await sendMessage(env, chatId, t(language, 'admin.userNotFound'));
    return;
  }

  await sendMessage(env, chatId, formatAdminUserCard(language, targetUser));
}

async function onMorningTest({ env, chatId, user, language }) {
  if (!isAdmin(chatId, env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  if (!user?.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, now.zoned.weekday);
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, user.group_name, lessons);
  const weather = await fetchHangzhouWeather();
  const text = formatMorningMessage(language, {
    weather,
    lessons: lessonsWithNotes,
    firstClassIn: getMinutesUntilFirstClass(lessonsWithNotes, now.nowMinutes)
  });

  await sendMessage(env, chatId, text, {
    reply_markup: mainMenuKeyboard(language)
  });
}

async function onEveningTest({ env, chatId, user, language }) {
  if (!isAdmin(chatId, env)) {
    await sendMessage(env, chatId, t(language, 'common.accessDenied'));
    return;
  }

  if (!user?.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const tomorrow = addDays(new Date(), 1);
  const parts = getZonedDateParts(tomorrow, CONFIG.TIMEZONE);
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, parts.weekday);
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, user.group_name, lessons);
  const text = formatEveningPreview(language, {
    lessons: lessonsWithNotes,
    date: tomorrow
  });

  await sendMessage(env, chatId, text, {
    reply_markup: mainMenuKeyboard(language)
  });
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

async function onMuteToday({ env, chatId, user, language }) {
  const now = getNowContext(new Date(), CONFIG.TIMEZONE);
  if (user?.reminder_mute_until_date === now.dateKey) {
    await sendSettingsText(env, chatId, language, t(language, 'settings.muteTodayAlready'));
    return;
  }

  await setUserReminderMuteUntilDate(env.DB, chatId, now.dateKey);
  await sendSettingsText(env, chatId, language, t(language, 'settings.muteTodayUpdated'));
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
    const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, groupName, lessons);
    const text = prependQuickGroupHeader(language, groupName, formatScheduleForToday(language, lessonsWithNotes, now.nowMinutes, now.date));
    await sendMessage(env, chatId, text, {
      reply_markup: favoritesViewKeyboard(language, favoriteGroups)
    });
    return;
  }

  if (viewType === 'tomorrow') {
    const tomorrow = addDays(new Date(), 1);
    const parts = getZonedDateParts(tomorrow, CONFIG.TIMEZONE);
    const lessons = await getLessonsByGroupAndWeekday(env.DB, groupName, parts.weekday);
    const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, groupName, lessons);
    const text = prependQuickGroupHeader(language, groupName, formatScheduleForTomorrow(language, lessonsWithNotes, tomorrow));
    await sendMessage(env, chatId, text, {
      reply_markup: favoritesViewKeyboard(language, favoriteGroups)
    });
    return;
  }

  const lessons = await getWeekLessonsByGroup(env.DB, groupName);
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, groupName, lessons);
  const text = prependQuickGroupHeader(language, groupName, formatFullWeek(language, lessonsWithNotes));
  await sendMessage(env, chatId, text, {
    reply_markup: favoritesViewKeyboard(language, favoriteGroups)
  });
}

async function onNotesView({ env, chatId, user, language }) {
  if (!user.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const lessons = await getWeekLessonsByGroup(env.DB, user.group_name);
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, user.group_name, lessons);
  await clearUserNoteFlow(env.DB, chatId);
  await sendMessage(env, chatId, formatLessonNotesOverview(language, user.group_name, lessonsWithNotes), {
    reply_markup: notesMenuKeyboard(language)
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
  if (matchesMenuLabel(text, 'muteToday')) {
    return 'muteToday';
  }
  if (matchesMenuLabel(text, 'favoritesView')) {
    return 'favoritesView';
  }
  if (matchesMenuLabel(text, 'favoritesManage')) {
    return 'favoritesManage';
  }
  if (matchesMenuLabel(text, 'notes')) {
    return 'notesMenu';
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
  if (text === getLocale('zh').labels.chinese || text === getLocale('en').labels.chinese || text === getLocale('ru').labels.chinese) {
    return 'langZh';
  }

  if (parseReminderChoice(text)) {
    return 'notifChoice';
  }
  if (parseMorningTimeChoice(text)) {
    return 'morningTimeChoice';
  }
  if (matchesNotesActionLabel(text, 'add')) {
    return 'notesAdd';
  }
  if (matchesNotesActionLabel(text, 'view')) {
    return 'notesView';
  }
  if (matchesNotesActionLabel(text, 'delete')) {
    return 'notesDelete';
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

function matchesNotesActionLabel(text, key) {
  for (const language of SUPPORTED_LANGUAGES) {
    if (getLocale(language).notes[key] === text) {
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

async function editOrSendMessage(env, chatId, messageId, text, options = {}) {
  try {
    await editMessageText(env, chatId, messageId, text, options);
  } catch (error) {
    const message = String(error?.message ?? error ?? '').toLowerCase();
    if (message.includes('message is not modified')) {
      return;
    }

    console.error('edit_message_fallback', { chatId, messageId, error: String(error) });
    await sendMessage(env, chatId, text, options);
  }
}

async function clearInlineKeyboard(env, chatId, messageId) {
  try {
    await editMessageReplyMarkup(env, chatId, messageId, { inline_keyboard: [] });
  } catch (error) {
    const message = String(error?.message ?? error ?? '').toLowerCase();
    if (message.includes('message is not modified')) {
      return;
    }

    console.error('clear_inline_keyboard_error', { chatId, messageId, error: String(error) });
  }
}

async function sendSettingsText(env, chatId, language, text) {
  await sendMessage(env, chatId, text, {
    reply_markup: settingsKeyboard(language)
  });
}

async function sendSettingsMenu(env, chatId, language, user) {
  await sendMessage(env, chatId, formatSettingsSummary(language, user), {
    reply_markup: inlineSettingsKeyboard(language)
  });
}

async function sendSettingsDetails(env, chatId, language, user) {
  await sendSettingsText(env, chatId, language, formatMySettings(language, user));
}

async function renderInlineSettingsDetails(env, chatId, messageId, language, user) {
  await editOrSendMessage(env, chatId, messageId, formatMySettings(language, user), {
    reply_markup: inlineMySettingsKeyboard(language)
  });
}

async function renderInlineSettingsMenu(env, chatId, messageId, language, user, options = {}) {
  const prefixText = String(options.prefixText ?? '').trim();
  const body = formatSettingsSummary(language, user);
  const text = prefixText ? `${prefixText}\n\n${body}` : body;
  await editOrSendMessage(env, chatId, messageId, text, {
    reply_markup: inlineSettingsKeyboard(language)
  });
}

async function renderInlineLanguageMenu(env, chatId, messageId, language) {
  await editOrSendMessage(env, chatId, messageId, t(language, 'common.pickLanguage'), {
    reply_markup: inlineLanguageKeyboard(language)
  });
}

async function renderInlineNotificationsMenu(env, chatId, messageId, language) {
  await editOrSendMessage(env, chatId, messageId, t(language, 'common.pickNotifications'), {
    reply_markup: inlineNotificationsKeyboard(language)
  });
}

async function renderInlineMorningTimeMenu(env, chatId, messageId, language, user) {
  const currentValue = user?.morning_time || CONFIG.DEFAULT_MORNING_TIME;
  const text = `${t(language, 'common.pickMorningTime')}\n\n${t(language, 'settings.morningTime')}: <b>${escapeHtml(currentValue)}</b>`;
  await editOrSendMessage(env, chatId, messageId, text, {
    reply_markup: inlineMorningTimeKeyboard(language, currentValue)
  });
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

async function renderInlineGroupMenu(env, chatId, messageId, language) {
  await editOrSendMessage(env, chatId, messageId, t(language, 'common.chooseGroup'), {
    reply_markup: inlineGroupKeyboard(language)
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
    reply_markup: inlineFavoritesKeyboard(language, user?.favorite_groups ?? [])
  });
}

async function renderInlineFavoritesMenu(env, chatId, messageId, language, user, options = {}) {
  const favorites = Array.isArray(user?.favorite_groups) && user.favorite_groups.length
    ? user.favorite_groups.join(', ')
    : t(language, 'settings.noFavorites');
  const prefixText = String(options.prefixText ?? '').trim();
  const body = `${t(language, 'common.pickFavorites')}\n\n${t(language, 'settings.favorites')}: <b>${escapeHtml(favorites)}</b>`;
  const text = prefixText ? `${prefixText}\n\n${body}` : body;
  await editOrSendMessage(env, chatId, messageId, text, {
    reply_markup: inlineFavoritesKeyboard(language, user?.favorite_groups ?? [])
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

async function sendNotesMenu(env, chatId, language, user, prefixText = '') {
  if (!user?.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  await clearUserNoteFlow(env.DB, chatId);
  const text = prefixText
    ? `${prefixText}\n\n${t(language, 'notes.menuTitle', { group: escapeHtml(user.group_name) })}`
    : t(language, 'notes.menuTitle', { group: escapeHtml(user.group_name) });
  await sendMessage(env, chatId, text, {
    reply_markup: notesMenuKeyboard(language)
  });
}

async function renderInlineNotesMenu(env, chatId, messageId, language, user, options = {}) {
  if (!user?.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  await clearUserNoteFlow(env.DB, chatId);
  const prefixText = String(options.prefixText ?? '').trim();
  const body = t(language, 'notes.menuTitle', { group: escapeHtml(user.group_name) });
  const text = prefixText ? `${prefixText}\n\n${body}` : body;
  await editOrSendMessage(env, chatId, messageId, text, {
    reply_markup: inlineNotesMenuKeyboard(language)
  });
}

async function renderInlineNotesOverview(env, chatId, messageId, language, user) {
  if (!user?.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const lessons = await getWeekLessonsByGroup(env.DB, user.group_name);
  const lessonsWithNotes = await attachLessonNotes(env.DB, chatId, user.group_name, lessons);
  await clearUserNoteFlow(env.DB, chatId);
  await editOrSendMessage(env, chatId, messageId, formatLessonNotesOverview(language, user.group_name, lessonsWithNotes), {
    reply_markup: inlineNotesOverviewKeyboard(language)
  });
}

async function sendNoteWeekdayPrompt(env, chatId, language, user, mode) {
  if (!user?.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const step = mode === 'delete' ? 'notes:delete:day' : 'notes:add:day';
  await setUserNoteFlow(env.DB, chatId, step, null, null);
  const text = mode === 'delete'
    ? t(language, 'notes.chooseDayDelete')
    : t(language, 'notes.chooseDayAdd');
  await sendMessage(env, chatId, text, {
    reply_markup: noteWeekdayKeyboard(language)
  });
}

async function renderInlineNoteWeekdayMenu(env, chatId, messageId, language, user, mode) {
  if (!user?.group_name) {
    await sendNoGroupSelected(env, chatId, language);
    return;
  }

  const step = mode === 'delete' ? 'notes:delete:day' : 'notes:add:day';
  await setUserNoteFlow(env.DB, chatId, step, null, null);
  const text = mode === 'delete'
    ? t(language, 'notes.chooseDayDelete')
    : t(language, 'notes.chooseDayAdd');
  await editOrSendMessage(env, chatId, messageId, text, {
    reply_markup: inlineNoteWeekdayKeyboard(language, mode)
  });
}

async function sendNoteLessonPrompt(env, chatId, language, user, weekday, mode) {
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, weekday);
  if (!lessons.length) {
    const prompt = mode === 'delete'
      ? t(language, 'notes.noLessonsForDeleteDay')
      : t(language, 'notes.noLessonsForDay');
    await sendNoteWeekdayPrompt(env, chatId, language, user, mode);
    await sendMessage(env, chatId, prompt, {
      reply_markup: noteWeekdayKeyboard(language)
    });
    return;
  }

  const lessonsForSelection = mode === 'delete'
    ? (await attachLessonNotes(env.DB, chatId, user.group_name, lessons)).filter((lesson) => lesson.note)
    : lessons;

  if (!lessonsForSelection.length) {
    await setUserNoteFlow(env.DB, chatId, 'notes:delete:day', null, null);
    await sendMessage(env, chatId, t(language, 'notes.noNotesForDay'), {
      reply_markup: noteWeekdayKeyboard(language)
    });
    return;
  }

  const step = mode === 'delete' ? 'notes:delete:lesson' : 'notes:add:lesson';
  await setUserNoteFlow(env.DB, chatId, step, weekday, null);
  const text = mode === 'delete'
    ? t(language, 'notes.chooseLessonDelete', { day: escapeHtml(t(language, `weekdays.${weekday}`)) })
    : t(language, 'notes.chooseLessonAdd', { day: escapeHtml(t(language, `weekdays.${weekday}`)) });
  await sendMessage(env, chatId, text, {
    reply_markup: noteLessonKeyboard(language, lessonsForSelection)
  });
}

async function renderInlineNoteLessonMenu(env, chatId, messageId, language, user, weekday, mode) {
  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, weekday);
  if (!lessons.length) {
    const prompt = mode === 'delete'
      ? t(language, 'notes.noLessonsForDeleteDay')
      : t(language, 'notes.noLessonsForDay');
    await editOrSendMessage(env, chatId, messageId, prompt, {
      reply_markup: inlineNoteWeekdayKeyboard(language, mode)
    });
    return;
  }

  const lessonsForSelection = mode === 'delete'
    ? (await attachLessonNotes(env.DB, chatId, user.group_name, lessons)).filter((lesson) => lesson.note)
    : lessons;

  if (!lessonsForSelection.length) {
    await setUserNoteFlow(env.DB, chatId, 'notes:delete:day', null, null);
    await editOrSendMessage(env, chatId, messageId, t(language, 'notes.noNotesForDay'), {
      reply_markup: inlineNoteWeekdayKeyboard(language, mode)
    });
    return;
  }

  const step = mode === 'delete' ? 'notes:delete:lesson' : 'notes:add:lesson';
  await setUserNoteFlow(env.DB, chatId, step, weekday, null);
  const text = mode === 'delete'
    ? t(language, 'notes.chooseLessonDelete', { day: escapeHtml(t(language, `weekdays.${weekday}`)) })
    : t(language, 'notes.chooseLessonAdd', { day: escapeHtml(t(language, `weekdays.${weekday}`)) });
  await editOrSendMessage(env, chatId, messageId, text, {
    reply_markup: inlineNoteLessonKeyboard(language, lessonsForSelection, mode, weekday)
  });
}

async function tryHandleNoteFlowInput({ env, chatId, user, language, text }) {
  const action = detectAction(text);
  if (action === 'back') {
    await sendNotesMenu(env, chatId, language, user);
    return true;
  }

  switch (user.note_flow_step) {
    case 'notes:add:day':
      return onNoteDayInput({ env, chatId, user, language, text, mode: 'add' });
    case 'notes:delete:day':
      return onNoteDayInput({ env, chatId, user, language, text, mode: 'delete' });
    case 'notes:add:lesson':
      return onNoteLessonInput({ env, chatId, user, language, text, mode: 'add' });
    case 'notes:delete:lesson':
      return onNoteLessonInput({ env, chatId, user, language, text, mode: 'delete' });
    case 'notes:add:text':
      return onNoteTextInput({ env, chatId, user, language, text });
    default:
      return false;
  }
}

async function onNoteDayInput({ env, chatId, user, language, text, mode }) {
  const weekday = parseWeekdayChoice(text);
  if (!weekday) {
    return false;
  }

  await sendNoteLessonPrompt(env, chatId, language, user, weekday, mode);
  return true;
}

async function onNoteLessonInput({ env, chatId, user, language, text, mode }) {
  const weekday = Number(user.note_flow_weekday);
  if (!Number.isFinite(weekday)) {
    await sendNotesMenu(env, chatId, language, user, t(language, 'notes.flowReset'));
    return true;
  }

  const lessons = await getLessonsByGroupAndWeekday(env.DB, user.group_name, weekday);
  const lessonsForSelection = mode === 'delete'
    ? (await attachLessonNotes(env.DB, chatId, user.group_name, lessons)).filter((lesson) => lesson.note)
    : lessons;
  const selectedLesson = findLessonBySelectionLabel(text, lessonsForSelection);
  if (!selectedLesson) {
    return false;
  }

  if (mode === 'delete') {
    await deleteLessonNote(env.DB, chatId, user.group_name, weekday, selectedLesson.lesson_number);
    await sendNotesMenu(env, chatId, language, user, t(language, 'notes.deleted'));
    return true;
  }

  await setUserNoteFlow(env.DB, chatId, 'notes:add:text', weekday, selectedLesson.lesson_number);
  const lessonLabel = buildLessonSelectionLabel(selectedLesson);
  await sendMessage(env, chatId, t(language, 'notes.sendText', {
    lesson: escapeHtml(lessonLabel),
    day: escapeHtml(t(language, `weekdays.${weekday}`))
  }), {
    reply_markup: noteTextKeyboard(language)
  });
  return true;
}

async function onNoteTextInput({ env, chatId, user, language, text }) {
  const note = String(text ?? '').trim();
  if (!note) {
    await sendMessage(env, chatId, t(language, 'notes.empty'), {
      reply_markup: noteTextKeyboard(language)
    });
    return true;
  }

  if (note.length > 200) {
    await sendMessage(env, chatId, t(language, 'notes.tooLong'), {
      reply_markup: noteTextKeyboard(language)
    });
    return true;
  }

  const weekday = Number(user.note_flow_weekday);
  const lessonNumber = Number(user.note_flow_lesson_number);
  if (!user.group_name || !Number.isFinite(weekday) || !Number.isFinite(lessonNumber)) {
    await sendNotesMenu(env, chatId, language, user, t(language, 'notes.flowReset'));
    return true;
  }

  const saved = await upsertLessonNote(env.DB, chatId, user.group_name, weekday, lessonNumber, note);
  await sendNotesMenu(
    env,
    chatId,
    language,
    user,
    t(language, saved ? 'notes.saved' : 'notes.saveFailed')
  );
  return true;
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
      [menu.muteToday, menu.morningToggle],
      [menu.favoritesManage, menu.morningTime],
      [menu.notes, menu.mySettings],
      [menu.changeGroup],
      [menu.back]
    ],
    resize_keyboard: true
  };
}

function inlineSettingsKeyboard(language) {
  const menu = getLocale(language).menu;
  return {
    inline_keyboard: [
      [
        { text: menu.language, callback_data: 'settings:language' },
        { text: menu.notifications, callback_data: 'settings:notifications' }
      ],
      [
        { text: menu.morningTime, callback_data: 'settings:morning-time' },
        { text: menu.morningToggle, callback_data: 'settings:morning-toggle' }
      ],
      [
        { text: menu.favoritesManage, callback_data: 'settings:favorites' },
        { text: menu.notes, callback_data: 'settings:notes' }
      ],
      [
        { text: menu.mySettings, callback_data: 'settings:my-settings' },
        { text: menu.changeGroup, callback_data: 'settings:change-group' }
      ],
      [
        { text: menu.back, callback_data: 'settings:close' }
      ]
    ]
  };
}

function inlineMySettingsKeyboard(language) {
  return {
    inline_keyboard: [[{ text: getLocale(language).menu.back, callback_data: 'settings:my-settings:back' }]]
  };
}

function inlineLanguageKeyboard(language) {
  const menu = getLocale(language).menu;
  const labels = getLocale(language).labels;
  return {
    inline_keyboard: [
      [
        { text: labels.russian, callback_data: 'settings:language:ru' },
        { text: labels.english, callback_data: 'settings:language:en' }
      ],
      [
        { text: labels.chinese, callback_data: 'settings:language:zh' }
      ],
      [
        { text: menu.back, callback_data: 'settings:back' }
      ]
    ]
  };
}

function inlineNotificationsKeyboard(language) {
  const menu = getLocale(language).menu;
  const labels = getLocale(language).labels;
  return {
    inline_keyboard: [
      [
        { text: '30 min', callback_data: 'settings:notifications:30 min' },
        { text: '10 min', callback_data: 'settings:notifications:10 min' }
      ],
      [
        { text: '5 min', callback_data: 'settings:notifications:5 min' },
        { text: labels.off, callback_data: 'settings:notifications:off' }
      ],
      [
        { text: menu.back, callback_data: 'settings:back' }
      ]
    ]
  };
}

function languageKeyboard(language) {
  const menu = getLocale(language).menu;
  const labels = getLocale(language).labels;
  return {
    keyboard: [[labels.russian, labels.english], [labels.chinese], [menu.back]],
    resize_keyboard: true
  };
}

function notificationsKeyboard(language) {
  const menu = getLocale(language).menu;
  const labels = getLocale(language).labels;
  return {
    keyboard: [['30 min', '10 min'], ['5 min', labels.off], [menu.back]],
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

function inlineFavoritesKeyboard(language, favoriteGroups = []) {
  const menu = getLocale(language).menu;
  const favorites = new Set(Array.isArray(favoriteGroups) ? favoriteGroups : []);
  const rows = [];

  for (let index = 0; index < CONFIG.GROUPS.length; index += 2) {
    rows.push(
      CONFIG.GROUPS.slice(index, index + 2).map((groupName) => ({
        text: `${favorites.has(groupName) ? '✅' : '⭐'} ${groupName}`,
        callback_data: `settings:favorites:toggle:${groupName}`
      }))
    );
  }

  rows.push([{ text: menu.back, callback_data: 'settings:favorites:back' }]);

  return { inline_keyboard: rows };
}

function favoritesViewKeyboard(language, favoriteGroups = []) {
  const menu = getLocale(language).menu;
  const rows = [];

  for (const groupName of favoriteGroups) {
    rows.push([`${getLocale(language).menu.today} ${groupName}`, `${getLocale(language).menu.tomorrow} ${groupName}`]);
    rows.push([`${getLocale(language).menu.fullWeek} ${groupName}`]);
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

function inlineMorningTimeKeyboard(language, currentValue) {
  const menu = getLocale(language).menu;
  const options = CONFIG.MORNING_TIME_OPTIONS;
  const rows = [];

  for (let index = 0; index < options.length; index += 2) {
    rows.push(
      options.slice(index, index + 2).map((value) => ({
        text: value === currentValue ? `✅ ${value}` : value,
        callback_data: `settings:morning-time:${value}`
      }))
    );
  }

  rows.push([{ text: menu.back, callback_data: 'settings:back' }]);

  return { inline_keyboard: rows };
}

function notesMenuKeyboard(language) {
  const menu = getLocale(language).menu;
  const notes = getLocale(language).notes;
  return {
    keyboard: [
      [notes.add, notes.view],
      [notes.delete],
      [menu.settings]
    ],
    resize_keyboard: true
  };
}

function inlineNotesMenuKeyboard(language) {
  const menu = getLocale(language).menu;
  const notes = getLocale(language).notes;
  return {
    inline_keyboard: [
      [
        { text: notes.add, callback_data: 'settings:notes:add' },
        { text: notes.view, callback_data: 'settings:notes:view' }
      ],
      [
        { text: notes.delete, callback_data: 'settings:notes:delete' }
      ],
      [
        { text: menu.back, callback_data: 'settings:notes:back' }
      ]
    ]
  };
}

function noteWeekdayKeyboard(language) {
  const menu = getLocale(language).menu;
  const rows = [];
  for (let weekday = 1; weekday <= 7; weekday += 2) {
    const row = [buildWeekdayChoiceLabel(language, weekday)];
    if (weekday + 1 <= 7) {
      row.push(buildWeekdayChoiceLabel(language, weekday + 1));
    }
    rows.push(row);
  }

  return {
    keyboard: [...rows, [menu.back]],
    resize_keyboard: true
  };
}

function inlineNoteWeekdayKeyboard(language, mode) {
  const rows = [];
  for (let weekday = 1; weekday <= 7; weekday += 2) {
    const row = [
      {
        text: buildWeekdayChoiceLabel(language, weekday),
        callback_data: `settings:notes:${mode}:day:${weekday}`
      }
    ];
    if (weekday + 1 <= 7) {
      row.push({
        text: buildWeekdayChoiceLabel(language, weekday + 1),
        callback_data: `settings:notes:${mode}:day:${weekday + 1}`
      });
    }
    rows.push(row);
  }

  rows.push([{ text: getLocale(language).menu.back, callback_data: 'settings:notes:menu' }]);
  return { inline_keyboard: rows };
}

function noteLessonKeyboard(language, lessons = []) {
  const menu = getLocale(language).menu;
  const rows = lessons.map((lesson) => [buildLessonSelectionLabel(lesson)]);
  return {
    keyboard: [...rows, [menu.back]],
    resize_keyboard: true
  };
}

function inlineNoteLessonKeyboard(language, lessons = [], mode, weekday) {
  const rows = lessons.map((lesson) => [{
    text: buildLessonSelectionLabel(lesson),
    callback_data: `settings:notes:${mode}:lesson:${weekday}:${lesson.lesson_number}`
  }]);

  rows.push([{ text: getLocale(language).menu.back, callback_data: `settings:notes:${mode}` }]);

  return { inline_keyboard: rows };
}

function noteTextKeyboard(language) {
  const menu = getLocale(language).menu;
  return {
    keyboard: [[menu.back]],
    resize_keyboard: true
  };
}

function inlineNoteTextKeyboard(language) {
  const menu = getLocale(language).menu;
  return {
    inline_keyboard: [[{ text: menu.back, callback_data: 'settings:notes:menu' }]]
  };
}

function inlineNotesOverviewKeyboard(language) {
  const menu = getLocale(language).menu;
  return {
    inline_keyboard: [[{ text: menu.back, callback_data: 'settings:notes:menu' }]]
  };
}

function groupKeyboard(language) {
  const menu = getLocale(language).menu;
  const rows = [];
  for (let index = 0; index < CONFIG.GROUPS.length; index += 2) {
    rows.push(CONFIG.GROUPS.slice(index, index + 2).map((groupName) => buildGroupChoiceLabel(groupName)));
  }

  return {
    keyboard: [...rows, [menu.back]],
    resize_keyboard: true
  };
}

function inlineGroupKeyboard(language) {
  const menu = getLocale(language).menu;
  const rows = [];

  for (let index = 0; index < CONFIG.GROUPS.length; index += 2) {
    rows.push(
      CONFIG.GROUPS.slice(index, index + 2).map((groupName) => ({
        text: buildGroupChoiceLabel(groupName),
        callback_data: `settings:change-group:select:${groupName}`
      }))
    );
  }

  rows.push([{ text: menu.back, callback_data: 'settings:change-group:back' }]);
  return { inline_keyboard: rows };
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
  const value = String(text ?? '').trim();
  const matched = value.match(/^(📅|📆|📖)\s+(.+)$/);
  const icon = matched?.[1] ?? '';
  const groupName = matched?.[2]?.trim() ?? '';
  if (!CONFIG.GROUPS.includes(groupName)) {
    for (const language of SUPPORTED_LANGUAGES) {
      const menu = getLocale(language).menu;
      if (value.startsWith(`${menu.today} `)) {
        const candidate = value.slice(`${menu.today} `.length).trim();
        return CONFIG.GROUPS.includes(candidate)
          ? { groupName: candidate, viewType: 'today' }
          : null;
      }
      if (value.startsWith(`${menu.tomorrow} `)) {
        const candidate = value.slice(`${menu.tomorrow} `.length).trim();
        return CONFIG.GROUPS.includes(candidate)
          ? { groupName: candidate, viewType: 'tomorrow' }
          : null;
      }
      if (value.startsWith(`${menu.fullWeek} `)) {
        const candidate = value.slice(`${menu.fullWeek} `.length).trim();
        return CONFIG.GROUPS.includes(candidate)
          ? { groupName: candidate, viewType: 'week' }
          : null;
      }
    }
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

function parseWeekdayChoice(text) {
  const value = String(text ?? '').trim().replace(/^🗓\s*/, '');
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    for (const language of SUPPORTED_LANGUAGES) {
      if (value === t(language, `weekdays.${weekday}`)) {
        return weekday;
      }
    }
  }
  return null;
}

function parseGroupChoice(text) {
  const value = String(text ?? '').trim();
  if (CONFIG.GROUPS.includes(value)) {
    return value;
  }

  const matched = value.match(/^(?:🟢|🔵|🟠|🔴|🟣|⚫)\s+(.+)$/);
  const candidate = matched?.[1]?.trim() ?? '';
  return CONFIG.GROUPS.includes(candidate) ? candidate : null;
}

function buildGroupChoiceLabel(groupName) {
  return `${getGroupBadge(groupName)} ${groupName}`;
}

function getGroupBadge(groupName) {
  const level = Number(String(groupName ?? '').split('-')[0]);
  switch (level) {
    case 1:
      return '🟢';
    case 2:
      return '🔵';
    case 3:
      return '🟠';
    case 4:
      return '🔴';
    case 5:
      return '🟣';
    case 6:
      return '⚫';
    default:
      return '🎓';
  }
}

function buildWeekdayChoiceLabel(language, weekday) {
  return `🗓 ${t(language, `weekdays.${weekday}`)}`;
}

function buildLessonSelectionLabel(lesson) {
  const lessonNumber = Number(lesson?.lesson_number);
  const prefix = Number.isFinite(lessonNumber) ? `${lessonNumber}.` : '-';
  const range = [lesson?.start_time, lesson?.end_time].filter(Boolean).join('-');
  const subject = String(lesson?.subject ?? '').trim();
  return subject ? `${prefix} ${range} — ${subject}` : `${prefix} ${range}`;
}

function findLessonBySelectionLabel(text, lessons = []) {
  const value = String(text ?? '').trim();
  return lessons.find((lesson) => buildLessonSelectionLabel(lesson) === value) ?? null;
}

async function attachLessonNotes(db, chatId, groupName, lessons) {
  const list = Array.isArray(lessons) ? lessons : [];
  if (!groupName || !list.length) {
    return list;
  }

  const notes = await getLessonNotesForUserGroup(db, chatId, groupName);
  if (!notes.length) {
    return list;
  }

  const notesMap = new Map(
    notes.map((note) => [`${note.weekday}:${note.lesson_number}`, note.note])
  );

  return list.map((lesson) => ({
    ...lesson,
    note: notesMap.get(`${lesson.weekday}:${lesson.lesson_number}`) ?? null
  }));
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
