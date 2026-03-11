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
      chinese: '中文',
      off: 'Off'
    },
    common: {
      accessDenied: '⛔ Access denied.',
      privateOnly: '🔒 This bot works only in private chat.',
      unknownCommand: 'I did not understand that. Use the menu below.',
      chooseGroup: '👥 Choose your group:\n\nTap a button below. If your group is missing, message @thcalmdx.',
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
      todayDateLine: '📆 Today, {date}',
      tomorrowDateLine: '📆 Tomorrow, {date}',
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
      dateLine: '📆 Tomorrow, {date}',
      noLessons: '🎉 Tomorrow there are no classes.',
      noLessonsHint: 'Enjoy a calmer evening.',
      summary: '📚 Classes tomorrow: <b>{count}</b>',
      firstLesson: '⏰ First class: <b>{time}</b>',
      lessonsTitle: '📆 <b>Tomorrow:</b>'
    },
    help: {
      title: '❓ <b>Help</b>',
      body: 'This bot helps you check your class schedule, follow the next lesson, manage reminders, save favorite groups, keep lesson notes and receive morning updates.\n\nButtons:\n📅 Today - schedule for today\n📆 Tomorrow - schedule for tomorrow\n📖 Full week - full weekly schedule\n📚 Next class - current or upcoming lesson\n⭐ Favorites - quick view for favorite groups\n⚙️ Settings - language, reminders, favorites and personal options\n\nSettings buttons:\n🌐 Language - switch RU / EN / 中文\n🔔 Notifications - choose reminder time\n🔕 Mute today - pause reminders until tomorrow\n⭐ Manage favorites - pin up to 2 groups\n📝 Notes - save a note for a specific weekday and lesson\n🕗 Morning time - choose 07:00 / 07:30 / 08:00\n🧾 My settings - view current settings\n🔄 Change group - change your main group\n🌅 Daily updates - turn morning messages on or off\n\nCommands:\n/start - start bot\n/help - show this help\n/today - today schedule\n/today 2-8 - quick schedule for any supported group\n/tomorrow - tomorrow schedule\n/tomorrow 2-8 - quick tomorrow schedule for any supported group\n/week - full week\n/week 2-8 - quick full week for any supported group\n/next - next or current class\n/settings - open settings\n/mysettings - show your settings\n/changegroup - choose group\n/favorites - manage favorite groups\n/morning - toggle daily updates\n/morningtime - choose morning message time\n/mutetoday - mute reminders until tomorrow',
      admin: '\n\nAdmin:\n/stats - bot stats\n/user 123456789 - user card\n/inactive - list inactive users\n/cleanupinactive - remove inactive users from database\n/morningtest - send morning message to admin\n/eveningtest - send evening preview to admin\n/broadcast text - send to all users\n/broadcastgroup 2-7 text - send to one group'
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
      chinese: '中文',
      off: 'Выкл'
    },
    common: {
      accessDenied: '⛔ Доступ запрещен.',
      privateOnly: '🔒 Этот бот работает только в личном чате.',
      unknownCommand: 'Не понял команду. Используйте меню ниже.',
      chooseGroup: '👥 Выберите свою группу:\n\nНажмите на кнопку ниже. Если вашей группы пока нет, напишите @thcalmdx.',
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
      todayDateLine: '📆 Сегодня, {date}',
      tomorrowDateLine: '📆 Завтра, {date}',
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
      dateLine: '📆 Завтра, {date}',
      noLessons: '🎉 Завтра занятий нет.',
      noLessonsHint: 'Можно немного выдохнуть.',
      summary: '📚 Пар завтра: <b>{count}</b>',
      firstLesson: '⏰ Первая пара: <b>{time}</b>',
      lessonsTitle: '📆 <b>Завтра:</b>'
    },
    help: {
      title: '❓ <b>Помощь</b>',
      body: 'Бот помогает быстро смотреть расписание, видеть ближайшую пару, получать напоминания, сохранять избранные группы, добавлять заметки к парам и получать утренние сообщения.\n\nКнопки:\n📅 Сегодня - расписание на сегодня\n📆 Завтра - расписание на завтра\n📖 Вся неделя - полное расписание на неделю\n📚 Следующая пара - текущая или ближайшая пара\n⭐ Избранное - быстрый просмотр закреплённых групп\n⚙️ Настройки - язык, напоминания, избранное и личные параметры\n\nКнопки в настройках:\n🌐 Язык - переключение RU / EN / 中文\n🔔 Уведомления - выбор времени напоминаний\n🔕 На сегодня - выключить напоминания до завтра\n⭐ Настроить избранное - закрепить до 2 групп\n📝 Заметки - добавить заметку к конкретной паре\n🕗 Время утра - выбрать 07:00 / 07:30 / 08:00\n🧾 Мои настройки - посмотреть текущие настройки\n🔄 Сменить группу - сменить основную группу\n🌅 Ежедневные сообщения - включить или выключить утренние сообщения\n\nКоманды:\n/start - запуск бота\n/help - это сообщение\n/today - расписание на сегодня\n/today 2-8 - быстро посмотреть любую доступную группу\n/tomorrow - расписание на завтра\n/tomorrow 2-8 - быстро посмотреть завтра для любой доступной группы\n/week - расписание на неделю\n/week 2-8 - быстро посмотреть неделю любой доступной группы\n/next - следующая или текущая пара\n/settings - открыть настройки\n/mysettings - показать ваши настройки\n/changegroup - выбрать группу\n/favorites - настроить избранные группы\n/morning - переключить ежедневные сообщения\n/morningtime - выбрать время утреннего сообщения\n/mutetoday - отключить напоминания до завтра',
      admin: '\n\nАдмин:\n/stats - статистика\n/user 123456789 - карточка пользователя\n/inactive - список неактивных пользователей\n/cleanupinactive - удалить неактивных из базы\n/morningtest - отправить себе утреннее сообщение\n/eveningtest - отправить себе вечерний preview\n/broadcast текст - рассылка всем\n/broadcastgroup 2-7 текст - рассылка одной группе'
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

const zhOverrides = {
  menu: {
    today: '📅 今天',
    tomorrow: '📆 明天',
    fullWeek: '📖 本周',
    nextClass: '📚 下一节课',
    favoritesView: '⭐ 收藏分组',
    settings: '⚙️ 设置',
    language: '🌐 语言',
    notifications: '🔔 提醒',
    muteToday: '🔕 今日静音',
    favoritesManage: '⭐ 管理收藏',
    notes: '📝 备注',
    morningTime: '🕗 早间时间',
    morningToggle: '🌅 每日消息',
    mySettings: '🧾 我的设置',
    changeGroup: '🔄 更换分组',
    back: '⬅️ 返回'
  },
  labels: {
    russian: 'Русский',
    english: 'English',
    chinese: '中文',
    off: '关闭'
  },
  common: {
    accessDenied: '⛔ 无权限。',
    privateOnly: '🔒 这个机器人只支持私聊。',
    unknownCommand: '未识别该指令。请使用下面的菜单。',
    chooseGroup: '👥 请选择你的分组：\n\n点击下方按钮。如果没有你的分组，请联系 @thcalmdx。',
    pickLanguage: '请选择语言：',
    pickNotifications: '请选择提醒设置：',
    pickFavorites: '最多选择 2 个收藏分组：',
    pickFavoriteView: '请选择要查看的收藏分组：',
    pickMorningTime: '请选择早间消息时间：',
    invalidGroup: '❌ 未知分组。可用分组：{groups}',
    todayUsage: '用法：<code>/today 2-8</code>',
    tomorrowUsage: '用法：<code>/tomorrow 2-8</code>',
    weekUsage: '用法：<code>/week 2-8</code>',
    favoritesUsage: '用法：<code>/favorites 2-7 2-8</code>',
    mainMenu: '✅ 主菜单'
  },
  start: {
    newUser: '👋 <b>欢迎使用 Schedule Helper Bot！</b>\n\n我可以帮你查看课表、接收提醒和早间消息。',
    knownUser: '👋 <b>欢迎回来！</b>\n\n打开菜单即可查看课表。'
  },
  groups: {
    saved: '✅ 已保存分组：<b>{group}</b>',
    changed: '✅ 分组已更改为 <b>{group}</b>'
  },
  schedule: {
    todayTitle: '📅 <b>今天</b>',
    tomorrowTitle: '📆 <b>明天</b>',
    todayDateLine: '📆 今天，{date}',
    tomorrowDateLine: '📆 明天，{date}',
    weekTitle: '📖 <b>本周课表</b>',
    noLessonsToday: '🎉 今天没有课。',
    noLessonsTomorrow: '🎉 明天没有课。',
    noLessonsWeek: '🎉 本周没有课。',
    noLessonsDay: '无课程',
    noGroup: '👥 请先选择你的分组。',
    statusStartsIn: '🟢 {time} 后开始',
    statusEndsIn: '🟠 {time} 后结束',
    statusFinished: '⚪ 已结束',
    nextClassTitle: '📚 <b>下一节课</b>',
    currentClassTitle: '📚 <b>当前课程</b>',
    noMoreToday: '✅ 今天没有更多课程了。',
    quickGroupHeader: '👥 快速查看分组：<b>{group}</b>'
  },
  settings: {
    title: '⚙️ <b>设置</b>',
    languageUpdated: '🌐 语言已更新：<b>{language}</b>',
    notificationsUpdated: '🔔 提醒已更新：<b>{value}</b>',
    muteTodayUpdated: '🔕 课前提醒已关闭到明天。',
    muteTodayAlready: '🔕 今天的课前提醒已经关闭。',
    morningUpdated: '🌅 每日消息：<b>{value}</b>',
    mySettingsTitle: '🧾 <b>我的设置</b>',
    group: '👥 分组',
    favorites: '⭐ 收藏分组',
    language: '🌐 语言',
    notifications: '🔔 提醒',
    reminder: '⏰ 提前提醒',
    reminderMute: '🔕 提醒静音',
    morningTime: '🕗 早间时间',
    morning: '🌅 每日消息',
    enabled: '开启',
    disabled: '关闭',
    notSelected: '未选择',
    noFavorites: '未选择',
    noFavoritesView: '⭐ 还没有收藏分组。请先在设置中添加。',
    favoritesUpdated: '⭐ 收藏分组已更新：<b>{value}</b>',
    favoritesLimit: '⚠️ 最多只能固定 2 个分组。',
    morningTimeUpdated: '🕗 早间时间已更新：<b>{value}</b>',
    mutedToday: '今天',
    notMuted: '否'
  },
  notes: {
    menuTitle: '📝 <b>课程备注</b>\n\n当前分组：<b>{group}</b>',
    listTitle: '📝 <b>{group} 的已保存备注</b>',
    add: '➕ 添加备注',
    view: '🗂 我的备注',
    delete: '🗑 删除备注',
    chooseDayAdd: '请选择要添加备注的星期：',
    chooseDayDelete: '请选择要删除备注的星期：',
    chooseLessonAdd: '请选择 <b>{day}</b> 的课程：',
    chooseLessonDelete: '请选择 <b>{day}</b> 有备注的课程：',
    sendText: '请发送 <b>{day}</b> 这节课的备注内容：\n\n<b>{lesson}</b>',
    saved: '✅ 备注已保存。',
    saveFailed: '⚠️ 暂时无法保存备注。',
    deleted: '🗑 备注已删除。',
    none: '还没有备注。',
    noLessonsForDay: '这一天没有课程。',
    noLessonsForDeleteDay: '这一天没有课程。',
    noNotesForDay: '这一天没有已保存备注。',
    empty: '请发送非空备注内容。',
    tooLong: '备注太长。最多 200 个字符。',
    flowReset: '⚠️ 备注流程已重置，请重新开始。'
  },
  weather: {
    title: '杭州天气：',
    unavailable: '天气暂时不可用。',
    adviceUmbrella: '☔ 建议带伞',
    adviceHot: '🥤 天气较热，记得带水',
    adviceCold: '🧥 天气较冷，注意保暖',
    adviceGood: '✨ 祝你今天顺利',
    clear: '晴',
    mainlyClear: '大致晴朗',
    partlyCloudy: '局部多云',
    cloudy: '多云',
    fog: '雾',
    drizzle: '毛毛雨',
    rain: '雨',
    showers: '阵雨',
    snow: '雪',
    thunder: '雷暴',
    unknown: '未知天气'
  },
  morning: {
    title: '🌤 <b>早上好！</b>',
    nearestClassIn: '⏰ 距离最近一节课还有：<b>{time}</b>',
    summary: '📚 今天共 <b>{count}</b> 节课',
    todayLessons: '📅 <b>今天：</b>',
    noLessons: '🎉 今天没有课。'
  },
  reminders: {
    title: '⏰ <b>上课提醒</b>',
    startsIn: '<b>{time}</b> 后开始'
  },
  admin: {
    broadcastUsage: '用法：/broadcast 你的文本',
    broadcastGroupUsage: '用法：/broadcastgroup 2-7 你的文本',
    broadcastDone: '📣 群发完成\n\n✅ 成功：<b>{sent}</b>\n❌ 失败：<b>{failed}</b>',
    broadcastGroupDone: '📣 分组群发完成\n\n👥 分组：<b>{group}</b>\n✅ 成功：<b>{sent}</b>\n❌ 失败：<b>{failed}</b>',
    statsTitle: '📊 <b>机器人统计</b>',
    totalUsers: '👥 总用户数：<b>{count}</b>',
    inactiveUsers: '🚫 非活跃用户：<b>{count}</b>',
    notificationsOn: '🔔 已开启提醒：<b>{count}</b>',
    byGroupTitle: '分组：',
    usersByGroupTitle: '👤 各分组用户：',
    inactiveTitle: '🚫 <b>非活跃用户</b>',
    inactiveNone: '没有非活跃用户',
    userUsage: '用法：/user 123456789',
    userNotFound: '未找到该用户',
    userCardTitle: '👤 <b>用户卡片</b>',
    status: '状态',
    active: '活跃',
    inactive: '不活跃',
    cleanupInactiveDone: '🧹 已删除非活跃用户：<b>{count}</b>',
    lastSeen: '最后活跃',
    deactivatedAt: '停用时间',
    noUsers: '没有用户',
    noUsername: '没有 username',
    dailyTitle: '📈 <b>每日投递统计（{date}）</b>',
    morningLine: '🌅 早间消息：成功 <b>{sent}</b>，失败 <b>{failed}</b>',
    reminderLine: '🔔 课前提醒：成功 <b>{sent}</b>，失败 <b>{failed}</b>',
    eveningLine: '🌙 晚间预览：成功 <b>{sent}</b>，失败 <b>{failed}</b>'
  },
  evening: {
    title: '🌙 <b>明日预览</b>',
    dateLine: '📆 明天，{date}',
    noLessons: '🎉 明天没有课。',
    noLessonsHint: '今晚可以轻松一点。',
    summary: '📚 明天共 <b>{count}</b> 节课',
    firstLesson: '⏰ 第一节课：<b>{time}</b>',
    lessonsTitle: '📆 <b>明天：</b>'
  },
  help: {
    title: '❓ <b>帮助</b>',
    body: '这个机器人可以帮助你快速查看课表、查看下一节课、接收提醒、保存收藏分组、给课程添加备注，并接收早间消息。\n\n按钮：\n📅 今天 - 查看今天的课表\n📆 明天 - 查看明天的课表\n📖 本周 - 查看整周课表\n📚 下一节课 - 当前或下一节课\n⭐ 收藏分组 - 快速查看收藏分组\n⚙️ 设置 - 语言、提醒、收藏和个人设置\n\n设置中的按钮：\n🌐 语言 - 切换 RU / EN / 中文\n🔔 提醒 - 选择提醒时间\n🔕 今日静音 - 关闭今天的提醒\n⭐ 管理收藏 - 固定最多 2 个分组\n📝 备注 - 给某一天某一节课添加备注\n🕗 早间时间 - 选择 07:00 / 07:30 / 08:00\n🧾 我的设置 - 查看当前设置\n🔄 更换分组 - 更换主分组\n🌅 每日消息 - 开启或关闭早间消息\n\n命令：\n/start - 启动机器人\n/help - 查看帮助\n/today - 今天课表\n/today 2-8 - 快速查看任意支持分组\n/tomorrow - 明天课表\n/tomorrow 2-8 - 快速查看任意支持分组的明天课表\n/week - 本周课表\n/week 2-8 - 快速查看任意支持分组的周课表\n/next - 当前或下一节课\n/settings - 打开设置\n/mysettings - 查看你的设置\n/changegroup - 选择分组\n/favorites - 管理收藏分组\n/morning - 切换每日消息\n/morningtime - 选择早间消息时间\n/mutetoday - 关闭提醒到明天',
    admin: '\n\n管理员：\n/stats - 查看统计\n/user 123456789 - 查看用户卡片\n/inactive - 查看非活跃用户\n/cleanupinactive - 从数据库中删除非活跃用户\n/morningtest - 给管理员发送测试早间消息\n/eveningtest - 给管理员发送测试晚间预览\n/broadcast 文本 - 群发给所有用户\n/broadcastgroup 2-7 文本 - 群发给单个分组'
  },
  weekdays: {
    1: '星期一',
    2: '星期二',
    3: '星期三',
    4: '星期四',
    5: '星期五',
    6: '星期六',
    7: '星期日'
  },
  time: {
    min: '分钟',
    hour: '小时'
  }
};

TRANSLATIONS.zh = mergeLocale(TRANSLATIONS.en, zhOverrides);

function mergeLocale(base, overrides) {
  const result = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = mergeLocale(base?.[key] ?? {}, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function resolveLanguage(language) {
  if (language === 'ru') {
    return 'ru';
  }
  if (language === 'zh') {
    return 'zh';
  }
  return 'en';
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

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'zh'];
