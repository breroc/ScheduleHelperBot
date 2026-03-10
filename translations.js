const TRANSLATIONS = {
  en: {
    languageName: 'English',
    menu: {
      today: '📅 Today',
      tomorrow: '📆 Tomorrow',
      fullWeek: '📖 Full week',
      nextClass: '📚 Next class',
      settings: '⚙️ Settings',
      language: '🌐 Language',
      notifications: '🔔 Notifications',
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
      invalidGroup: '❌ Unknown group. Available groups: {groups}',
      todayUsage: 'Usage: <code>/today 2-8</code>',
      openingSettings: '⚙️ Settings menu',
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
      firstClassIn: 'First class in: <b>{time}</b>',
      quickGroupHeader: '👥 Quick view for group: <b>{group}</b>'
    },
    settings: {
      title: '⚙️ <b>Settings</b>',
      languageUpdated: '🌐 Language updated: <b>{language}</b>',
      notificationsUpdated: '🔔 Notifications updated: <b>{value}</b>',
      morningUpdated: '🌅 Daily updates: <b>{value}</b>',
      mySettingsTitle: '🧾 <b>My settings</b>',
      group: '👥 Group',
      language: '🌐 Language',
      notifications: '🔔 Notifications',
      reminder: '⏰ Reminder',
      morning: '🌅 Daily updates',
      enabled: 'On',
      disabled: 'Off',
      notSelected: 'Not selected'
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
      notificationsOn: '🔔 Notifications enabled: <b>{count}</b>',
      byGroupTitle: 'Groups:',
      usersByGroupTitle: '👤 Users by group:',
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
      body: 'Use buttons or commands below:\n\n/start - start bot\n/help - show this help\n/today - today schedule\n/today 2-8 - quick schedule for selected group\n/tomorrow - tomorrow schedule\n/week - full week\n/next - next or current class\n/settings - open settings\n/mysettings - show your settings\n/changegroup - choose group\n/morning - toggle daily updates\n\nButtons:\n📅 Today\n📆 Tomorrow\n📖 Full week\n📚 Next class\n⚙️ Settings\n\nSettings:\n🌐 Language\n🔔 Notifications\n🧾 My settings\n🔄 Change group\n🌅 Daily updates',
      admin: '\n\nAdmin:\n/stats - bot stats\n/broadcast text - send to all users\n/broadcastgroup 2-7 text - send to one group'
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
    languageName: 'Русский',
    menu: {
      today: '📅 Сегодня',
      tomorrow: '📆 Завтра',
      fullWeek: '📖 Вся неделя',
      nextClass: '📚 Следующая пара',
      settings: '⚙️ Настройки',
      language: '🌐 Язык',
      notifications: '🔔 Уведомления',
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
      invalidGroup: '❌ Неизвестная группа. Доступные группы: {groups}',
      todayUsage: 'Использование: <code>/today 2-8</code>',
      openingSettings: '⚙️ Меню настроек',
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
      firstClassIn: 'До первой пары: <b>{time}</b>',
      quickGroupHeader: '👥 Быстрый просмотр группы: <b>{group}</b>'
    },
    settings: {
      title: '⚙️ <b>Настройки</b>',
      languageUpdated: '🌐 Язык обновлен: <b>{language}</b>',
      notificationsUpdated: '🔔 Уведомления обновлены: <b>{value}</b>',
      morningUpdated: '🌅 Ежедневные сообщения: <b>{value}</b>',
      mySettingsTitle: '🧾 <b>Мои настройки</b>',
      group: '👥 Группа',
      language: '🌐 Язык',
      notifications: '🔔 Уведомления',
      reminder: '⏰ Напоминание',
      morning: '🌅 Ежедневные сообщения',
      enabled: 'Вкл',
      disabled: 'Выкл',
      notSelected: 'Не выбрана'
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
      notificationsOn: '🔔 С уведомлениями: <b>{count}</b>',
      byGroupTitle: 'Группы:',
      usersByGroupTitle: '👤 Пользователи по группам:',
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
      body: 'Используйте кнопки или команды:\n\n/start - запуск бота\n/help - это сообщение\n/today - расписание на сегодня\n/today 2-8 - быстро посмотреть группу\n/tomorrow - расписание на завтра\n/week - расписание на неделю\n/next - следующая или текущая пара\n/settings - открыть настройки\n/mysettings - показать ваши настройки\n/changegroup - выбрать группу\n/morning - переключить ежедневные сообщения\n\nКнопки:\n📅 Сегодня\n📆 Завтра\n📖 Вся неделя\n📚 Следующая пара\n⚙️ Настройки\n\nВ настройках:\n🌐 Язык\n🔔 Уведомления\n🧾 Мои настройки\n🔄 Сменить группу\n🌅 Ежедневные сообщения',
      admin: '\n\nАдмин:\n/stats - статистика\n/broadcast текст - рассылка всем\n/broadcastgroup 2-7 текст - рассылка одной группе'
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
