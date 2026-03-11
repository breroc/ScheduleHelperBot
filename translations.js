const TRANSLATIONS = {
  en: {
    menu: {
      today: '📅 Today',
      tomorrow: '📆 Tomorrow',
      fullWeek: '📖 Full week',
      nextClass: '📚 Next class',
      favoritesView: '⭐ Favorites',
      settings: '⚙️ Settings',
      language: '🌐 Language',
      notifications: '🔔 Notifications',
      muteToday: '🔕 Mute today',
      favoritesManage: '⭐ Manage favorites',
      notes: '📝 Notes',
      morningTime: '🕗 Morning time',
      morningToggle: '🌅 Daily updates',
      mySettings: '🧾 My settings',
      changeGroup: '🔄 Change group',
      back: '⬅️ Back'
    },
    labels: {
      russian: 'Русский',
      english: 'English',
      off: 'Off'
    },
    common: {
      accessDenied: '⛔ Access denied.',
      privateOnly: '🔒 This bot works only in private chat.',
      unknownCommand: 'I did not understand that. Use the menu below.',
      chooseGroup: 'Choose your group:',
      pickLanguage: 'Choose language:',
      pickNotifications: 'Choose reminder settings:',
      pickFavorites: 'Toggle up to 2 favorite groups:',
      pickFavoriteView: 'Choose a favorite group view:',
      pickMorningTime: 'Choose morning message time:',
      invalidGroup: '❌ Unknown group. Available groups: {groups}',
      todayUsage: 'Usage: <code>/today 2-8</code>',
      tomorrowUsage: 'Usage: <code>/tomorrow 2-8</code>',
      weekUsage: 'Usage: <code>/week 2-8</code>',
      favoritesUsage: 'Usage: <code>/favorites 2-7 2-8</code>',
      mainMenu: '✅ Main menu'
    },
    start: {
      newUser: '👋 <b>Welcome to Schedule Helper Bot!</b>\n\nI will help you with classes, reminders and morning updates.',
      knownUser: '👋 <b>Welcome back!</b>\n\nOpen the menu to view your schedule.'
    },
    groups: {
      saved: '✅ Group saved: <b>{group}</b>',
      changed: '✅ Group changed to <b>{group}</b>'
    },
    schedule: {
      todayTitle: '📅 <b>Today</b>',
      tomorrowTitle: '📆 <b>Tomorrow</b>',
      weekTitle: '📖 <b>Full week</b>',
      noLessonsToday: '🎉 Today there are no classes.',
      noLessonsTomorrow: '🎉 Tomorrow there are no classes.',
      noLessonsWeek: '🎉 This week has no classes.',
      noLessonsDay: 'No classes',
      noGroup: '👥 Please choose your group first.',
      statusStartsIn: '🟢 Starts in {time}',
      statusEndsIn: '🟠 Ends in {time}',
      statusFinished: '⚪ Finished',
      nextClassTitle: '📚 <b>Next class</b>',
      currentClassTitle: '📚 <b>Current class</b>',
      noMoreToday: '✅ No more classes today.',
      quickGroupHeader: '👥 Quick view for group: <b>{group}</b>'
    },
    settings: {
      title: '⚙️ <b>Settings</b>',
      languageUpdated: '🌐 Language updated: <b>{language}</b>',
      notificationsUpdated: '🔔 Notifications updated: <b>{value}</b>',
      muteTodayUpdated: '🔕 Reminders muted until tomorrow.',
      muteTodayAlready: '🔕 Reminders are already muted for today.',
      morningUpdated: '🌅 Daily updates: <b>{value}</b>',
      mySettingsTitle: '🧾 <b>My settings</b>',
      group: '👥 Group',
      favorites: '⭐ Favorites',
      language: '🌐 Language',
      notifications: '🔔 Notifications',
      reminder: '⏰ Reminder',
      reminderMute: '🔕 Reminder mute',
      morningTime: '🕗 Morning time',
      morning: '🌅 Daily updates',
      enabled: 'On',
      disabled: 'Off',
      notSelected: 'Not selected',
      noFavorites: 'Not selected',
      noFavoritesView: '⭐ No favorite groups yet. Add them in settings first.',
      favoritesUpdated: '⭐ Favorites updated: <b>{value}</b>',
      favoritesLimit: '⚠️ You can pin up to 2 favorite groups.',
      morningTimeUpdated: '🕗 Morning time updated: <b>{value}</b>',
      mutedToday: 'Today',
      notMuted: 'No'
    },
    notes: {
      menuTitle: '📝 <b>Lesson notes</b>\n\nCurrent group: <b>{group}</b>',
      listTitle: '📝 <b>Saved notes for {group}</b>',
      add: '➕ Add note',
      view: '🗂 My notes',
      delete: '🗑 Delete note',
      chooseDayAdd: 'Choose a weekday for the note:',
      chooseDayDelete: 'Choose a weekday to delete a note:',
      chooseLessonAdd: 'Choose a lesson on <b>{day}</b>:',
      chooseLessonDelete: 'Choose a lesson with a note on <b>{day}</b>:',
      sendText: 'Send the note text for <b>{day}</b>:\n\n<b>{lesson}</b>',
      saved: '✅ Note saved.',
      saveFailed: '⚠️ Could not save the note right now.',
      deleted: '🗑 Note deleted.',
      none: 'No notes yet.',
      noLessonsForDay: 'No lessons on that day.',
      noLessonsForDeleteDay: 'No lessons on that day.',
      noNotesForDay: 'No saved notes for that day.',
      empty: 'Send non-empty note text.',
      tooLong: 'Note is too long. Limit: 200 characters.',
      flowReset: '⚠️ Note flow was reset. Start again.'
    },
    weather: {
      title: 'Weather in Hangzhou:',
      unavailable: 'Weather is temporarily unavailable.',
      adviceUmbrella: '☔ Take an umbrella',
      adviceHot: '🥤 It is hot, take water',
      adviceCold: '🧥 Dress warmly',
      adviceGood: '✨ Have a great day',
      clear: 'Clear',
      mainlyClear: 'Mainly clear',
      partlyCloudy: 'Partly cloudy',
      cloudy: 'Cloudy',
      fog: 'Fog',
      drizzle: 'Drizzle',
      rain: 'Rain',
      showers: 'Showers',
      snow: 'Snow',
      thunder: 'Thunderstorm',
      unknown: 'Unknown weather'
    },
    morning: {
      title: '🌤 <b>Good morning!</b>',
      nearestClassIn: '⏰ Nearest class in: <b>{time}</b>',
      summary: '📚 Classes today: <b>{count}</b>',
      todayLessons: '📅 <b>Today:</b>',
      noLessons: '🎉 Today there are no classes.'
    },
    reminders: {
      title: '⏰ <b>Upcoming class reminder</b>',
      startsIn: 'Starts in <b>{time}</b>'
    },
    admin: {
      broadcastUsage: 'Usage: /broadcast your text',
      broadcastGroupUsage: 'Usage: /broadcastgroup 2-7 your text',
      broadcastDone: '📣 Broadcast completed\n\n✅ Sent: <b>{sent}</b>\n❌ Failed: <b>{failed}</b>',
      broadcastGroupDone: '📣 Group broadcast completed\n\n👥 Group: <b>{group}</b>\n✅ Sent: <b>{sent}</b>\n❌ Failed: <b>{failed}</b>',
      statsTitle: '📊 <b>Bot stats</b>',
      totalUsers: '👥 Total users: <b>{count}</b>',
      inactiveUsers: '🚫 Inactive users: <b>{count}</b>',
      notificationsOn: '🔔 Notifications enabled: <b>{count}</b>',
      byGroupTitle: 'Groups:',
      usersByGroupTitle: '👤 Users by group:',
      inactiveTitle: '🚫 <b>Inactive users</b>',
      inactiveNone: 'No inactive users',
      userUsage: 'Usage: /user 123456789',
      userNotFound: 'User not found',
      userCardTitle: '👤 <b>User card</b>',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      cleanupInactiveDone: '🧹 Inactive users removed: <b>{count}</b>',
      lastSeen: 'last seen',
      deactivatedAt: 'deactivated',
      noUsers: 'No users',
      noUsername: 'no username',
      dailyTitle: '📈 <b>Daily deliveries ({date})</b>',
      morningLine: '🌅 Morning: sent <b>{sent}</b>, failed <b>{failed}</b>',
      reminderLine: '🔔 Reminders: sent <b>{sent}</b>, failed <b>{failed}</b>',
      eveningLine: '🌙 Evening preview: sent <b>{sent}</b>, failed <b>{failed}</b>'
    },
    evening: {
      title: '🌙 <b>Tomorrow preview</b>',
      noLessons: '🎉 Tomorrow there are no classes.',
      noLessonsHint: 'Enjoy a calmer evening.',
      summary: '📚 Classes tomorrow: <b>{count}</b>',
      firstLesson: '⏰ First class: <b>{time}</b>',
      lessonsTitle: '📆 <b>Tomorrow:</b>'
    },
    help: {
      title: '❓ <b>Help</b>',
      body: 'This bot helps you check your class schedule, follow the next lesson, manage reminders, save favorite groups, keep lesson notes and receive morning updates.\n\nButtons:\n📅 Today - schedule for today\n📆 Tomorrow - schedule for tomorrow\n📖 Full week - full weekly schedule\n📚 Next class - current or upcoming lesson\n⭐ Favorites - quick view for favorite groups\n⚙️ Settings - language, reminders, favorites and personal options\n\nSettings buttons:\n🌐 Language - switch RU / EN\n🔔 Notifications - choose reminder time\n🔕 Mute today - pause reminders until tomorrow\n⭐ Manage favorites - pin up to 2 groups\n📝 Notes - save a note for a specific weekday and lesson\n🕗 Morning time - choose 07:00 / 07:30 / 08:00\n🧾 My settings - view current settings\n🔄 Change group - change your main group\n🌅 Daily updates - turn morning messages on or off\n\nCommands:\n/start - start bot\n/help - show this help\n/today - today schedule\n/today 2-8 - quick schedule for any supported group\n/tomorrow - tomorrow schedule\n/tomorrow 2-8 - quick tomorrow schedule for any supported group\n/week - full week\n/week 2-8 - quick full week for any supported group\n/next - next or current class\n/settings - open settings\n/mysettings - show your settings\n/changegroup - choose group\n/favorites - manage favorite groups\n/morning - toggle daily updates\n/morningtime - choose morning message time\n/mutetoday - mute reminders until tomorrow',
      admin: '\n\nAdmin:\n/stats - bot stats\n/user 123456789 - user card\n/inactive - list inactive users\n/cleanupinactive - remove inactive users from database\n/broadcast text - send to all users\n/broadcastgroup 2-7 text - send to one group'
    },
    weekdays: {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
      7: 'Sunday'
    },
    time: {
      min: 'min',
      hour: 'h'
    }
  },
  ru: {
    menu: {
      today: '📅 Сегодня',
      tomorrow: '📆 Завтра',
      fullWeek: '📖 Вся неделя',
      nextClass: '📚 Следующая пара',
      favoritesView: '⭐ Избранное',
      settings: '⚙️ Настройки',
      language: '🌐 Язык',
      notifications: '🔔 Уведомления',
      muteToday: '🔕 На сегодня',
      favoritesManage: '⭐ Настроить избранное',
      notes: '📝 Заметки',
      morningTime: '🕗 Время утра',
      morningToggle: '🌅 Ежедневные сообщения',
      mySettings: '🧾 Мои настройки',
      changeGroup: '🔄 Сменить группу',
      back: '⬅️ Назад'
    },
    labels: {
      russian: 'Русский',
      english: 'English',
      off: 'Выкл'
    },
    common: {
      accessDenied: '⛔ Доступ запрещен.',
      privateOnly: '🔒 Этот бот работает только в личном чате.',
      unknownCommand: 'Не понял команду. Используйте меню ниже.',
      chooseGroup: 'Выберите вашу группу:',
      pickLanguage: 'Выберите язык:',
      pickNotifications: 'Выберите настройки напоминаний:',
      pickFavorites: 'Выберите до 2 избранных групп:',
      pickFavoriteView: 'Выберите просмотр избранной группы:',
      pickMorningTime: 'Выберите время утреннего сообщения:',
      invalidGroup: '❌ Неизвестная группа. Доступные группы: {groups}',
      todayUsage: 'Использование: <code>/today 2-8</code>',
      tomorrowUsage: 'Использование: <code>/tomorrow 2-8</code>',
      weekUsage: 'Использование: <code>/week 2-8</code>',
      favoritesUsage: 'Использование: <code>/favorites 2-7 2-8</code>',
      mainMenu: '✅ Главное меню'
    },
    start: {
      newUser: '👋 <b>Добро пожаловать в Schedule Helper Bot!</b>\n\nЯ помогу с расписанием, напоминаниями и утренними сообщениями.',
      knownUser: '👋 <b>С возвращением!</b>\n\nОткройте меню, чтобы посмотреть расписание.'
    },
    groups: {
      saved: '✅ Группа сохранена: <b>{group}</b>',
      changed: '✅ Группа изменена на <b>{group}</b>'
    },
    schedule: {
      todayTitle: '📅 <b>Сегодня</b>',
      tomorrowTitle: '📆 <b>Завтра</b>',
      weekTitle: '📖 <b>Вся неделя</b>',
      noLessonsToday: '🎉 Сегодня занятий нет.',
      noLessonsTomorrow: '🎉 Завтра занятий нет.',
      noLessonsWeek: '🎉 На этой неделе занятий нет.',
      noLessonsDay: 'Занятий нет',
      noGroup: '👥 Сначала выберите группу.',
      statusStartsIn: '🟢 До начала: {time}',
      statusEndsIn: '🟠 До конца: {time}',
      statusFinished: '⚪ Завершено',
      nextClassTitle: '📚 <b>Следующая пара</b>',
      currentClassTitle: '📚 <b>Текущая пара</b>',
      noMoreToday: '✅ На сегодня пар больше нет.',
      quickGroupHeader: '👥 Быстрый просмотр группы: <b>{group}</b>'
    },
    settings: {
      title: '⚙️ <b>Настройки</b>',
      languageUpdated: '🌐 Язык обновлен: <b>{language}</b>',
      notificationsUpdated: '🔔 Уведомления обновлены: <b>{value}</b>',
      muteTodayUpdated: '🔕 Напоминания отключены до завтра.',
      muteTodayAlready: '🔕 Напоминания уже отключены на сегодня.',
      morningUpdated: '🌅 Ежедневные сообщения: <b>{value}</b>',
      mySettingsTitle: '🧾 <b>Мои настройки</b>',
      group: '👥 Группа',
      favorites: '⭐ Избранное',
      language: '🌐 Язык',
      notifications: '🔔 Уведомления',
      reminder: '⏰ Напоминание',
      reminderMute: '🔕 Пауза напоминаний',
      morningTime: '🕗 Время утра',
      morning: '🌅 Ежедневные сообщения',
      enabled: 'Вкл',
      disabled: 'Выкл',
      notSelected: 'Не выбрана',
      noFavorites: 'Не выбрано',
      noFavoritesView: '⭐ У вас пока нет избранных групп. Добавьте их сначала в настройках.',
      favoritesUpdated: '⭐ Избранное обновлено: <b>{value}</b>',
      favoritesLimit: '⚠️ Можно закрепить не больше 2 групп.',
      morningTimeUpdated: '🕗 Время утра обновлено: <b>{value}</b>',
      mutedToday: 'На сегодня',
      notMuted: 'Нет'
    },
    notes: {
      menuTitle: '📝 <b>Заметки к парам</b>\n\nТекущая группа: <b>{group}</b>',
      listTitle: '📝 <b>Сохранённые заметки для {group}</b>',
      add: '➕ Добавить заметку',
      view: '🗂 Мои заметки',
      delete: '🗑 Удалить заметку',
      chooseDayAdd: 'Выберите день недели для заметки:',
      chooseDayDelete: 'Выберите день недели для удаления заметки:',
      chooseLessonAdd: 'Выберите пару на <b>{day}</b>:',
      chooseLessonDelete: 'Выберите пару с заметкой на <b>{day}</b>:',
      sendText: 'Отправьте текст заметки для <b>{day}</b>:\n\n<b>{lesson}</b>',
      saved: '✅ Заметка сохранена.',
      saveFailed: '⚠️ Сейчас не удалось сохранить заметку.',
      deleted: '🗑 Заметка удалена.',
      none: 'Заметок пока нет.',
      noLessonsForDay: 'На этот день пар нет.',
      noLessonsForDeleteDay: 'На этот день пар нет.',
      noNotesForDay: 'На этот день заметок нет.',
      empty: 'Отправьте непустой текст заметки.',
      tooLong: 'Заметка слишком длинная. Максимум 200 символов.',
      flowReset: '⚠️ Режим заметок был сброшен. Начните заново.'
    },
    weather: {
      title: 'Погода в Ханчжоу:',
      unavailable: 'Погода временно недоступна.',
      adviceUmbrella: '☔ Возьмите зонт',
      adviceHot: '🥤 Жарко, возьмите воду',
      adviceCold: '🧥 Одевайтесь теплее',
      adviceGood: '✨ Хорошего дня',
      clear: 'Ясно',
      mainlyClear: 'Преимущественно ясно',
      partlyCloudy: 'Переменная облачность',
      cloudy: 'Облачно',
      fog: 'Туман',
      drizzle: 'Морось',
      rain: 'Дождь',
      showers: 'Ливни',
      snow: 'Снег',
      thunder: 'Гроза',
      unknown: 'Неизвестная погода'
    },
    morning: {
      title: '🌤 <b>Доброе утро!</b>',
      nearestClassIn: '⏰ До ближайшей пары: <b>{time}</b>',
      summary: '📚 Пар сегодня: <b>{count}</b>',
      todayLessons: '📅 <b>Сегодня:</b>',
      noLessons: '🎉 Сегодня занятий нет.'
    },
    reminders: {
      title: '⏰ <b>Напоминание о паре</b>',
      startsIn: 'До начала: <b>{time}</b>'
    },
    admin: {
      broadcastUsage: 'Использование: /broadcast ваш текст',
      broadcastGroupUsage: 'Использование: /broadcastgroup 2-7 ваш текст',
      broadcastDone: '📣 Рассылка завершена\n\n✅ Отправлено: <b>{sent}</b>\n❌ Ошибок: <b>{failed}</b>',
      broadcastGroupDone: '📣 Рассылка по группе завершена\n\n👥 Группа: <b>{group}</b>\n✅ Отправлено: <b>{sent}</b>\n❌ Ошибок: <b>{failed}</b>',
      statsTitle: '📊 <b>Статистика бота</b>',
      totalUsers: '👥 Всего пользователей: <b>{count}</b>',
      inactiveUsers: '🚫 Неактивных пользователей: <b>{count}</b>',
      notificationsOn: '🔔 С уведомлениями: <b>{count}</b>',
      byGroupTitle: 'Группы:',
      usersByGroupTitle: '👤 Пользователи по группам:',
      inactiveTitle: '🚫 <b>Неактивные пользователи</b>',
      inactiveNone: 'Неактивных пользователей нет',
      userUsage: 'Использование: /user 123456789',
      userNotFound: 'Пользователь не найден',
      userCardTitle: '👤 <b>Карточка пользователя</b>',
      status: 'Статус',
      active: 'Активен',
      inactive: 'Неактивен',
      cleanupInactiveDone: '🧹 Удалено неактивных пользователей: <b>{count}</b>',
      lastSeen: 'последняя активность',
      deactivatedAt: 'деактивирован',
      noUsers: 'Нет пользователей',
      noUsername: 'без username',
      dailyTitle: '📈 <b>Доставка за день ({date})</b>',
      morningLine: '🌅 Утро: отправлено <b>{sent}</b>, ошибок <b>{failed}</b>',
      reminderLine: '🔔 Напоминания: отправлено <b>{sent}</b>, ошибок <b>{failed}</b>',
      eveningLine: '🌙 Вечерний preview: отправлено <b>{sent}</b>, ошибок <b>{failed}</b>'
    },
    evening: {
      title: '🌙 <b>Коротко о завтра</b>',
      noLessons: '🎉 Завтра занятий нет.',
      noLessonsHint: 'Можно немного выдохнуть.',
      summary: '📚 Пар завтра: <b>{count}</b>',
      firstLesson: '⏰ Первая пара: <b>{time}</b>',
      lessonsTitle: '📆 <b>Завтра:</b>'
    },
    help: {
      title: '❓ <b>Помощь</b>',
      body: 'Бот помогает быстро смотреть расписание, видеть ближайшую пару, получать напоминания, сохранять избранные группы, добавлять заметки к парам и получать утренние сообщения.\n\nКнопки:\n📅 Сегодня - расписание на сегодня\n📆 Завтра - расписание на завтра\n📖 Вся неделя - полное расписание на неделю\n📚 Следующая пара - текущая или ближайшая пара\n⭐ Избранное - быстрый просмотр закреплённых групп\n⚙️ Настройки - язык, напоминания, избранное и личные параметры\n\nКнопки в настройках:\n🌐 Язык - переключение RU / EN\n🔔 Уведомления - выбор времени напоминаний\n🔕 На сегодня - выключить напоминания до завтра\n⭐ Настроить избранное - закрепить до 2 групп\n📝 Заметки - добавить заметку к конкретной паре\n🕗 Время утра - выбрать 07:00 / 07:30 / 08:00\n🧾 Мои настройки - посмотреть текущие настройки\n🔄 Сменить группу - сменить основную группу\n🌅 Ежедневные сообщения - включить или выключить утренние сообщения\n\nКоманды:\n/start - запуск бота\n/help - это сообщение\n/today - расписание на сегодня\n/today 2-8 - быстро посмотреть любую доступную группу\n/tomorrow - расписание на завтра\n/tomorrow 2-8 - быстро посмотреть завтра для любой доступной группы\n/week - расписание на неделю\n/week 2-8 - быстро посмотреть неделю любой доступной группы\n/next - следующая или текущая пара\n/settings - открыть настройки\n/mysettings - показать ваши настройки\n/changegroup - выбрать группу\n/favorites - настроить избранные группы\n/morning - переключить ежедневные сообщения\n/morningtime - выбрать время утреннего сообщения\n/mutetoday - отключить напоминания до завтра',
      admin: '\n\nАдмин:\n/stats - статистика\n/user 123456789 - карточка пользователя\n/inactive - список неактивных пользователей\n/cleanupinactive - удалить неактивных из базы\n/broadcast текст - рассылка всем\n/broadcastgroup 2-7 текст - рассылка одной группе'
    },
    weekdays: {
      1: 'Понедельник',
      2: 'Вторник',
      3: 'Среда',
      4: 'Четверг',
      5: 'Пятница',
      6: 'Суббота',
      7: 'Воскресенье'
    },
    time: {
      min: 'мин',
      hour: 'ч'
    }
  }
};

export function resolveLanguage(language) {
  return language === 'ru' ? 'ru' : 'en';
}

export function t(language, key, params = {}) {
  const lang = resolveLanguage(language);
  const template = key.split('.').reduce((acc, part) => {
    if (!acc || typeof acc !== 'object') {
      return undefined;
    }
    return acc[part];
  }, TRANSLATIONS[lang]);

  if (typeof template !== 'string') {
    return key;
  }

  return template.replace(/\{(\w+)\}/g, (_, token) => {
    return String(params[token] ?? '');
  });
}

export function getLocale(language) {
  return TRANSLATIONS[resolveLanguage(language)];
}

export const SUPPORTED_LANGUAGES = ['en', 'ru'];
