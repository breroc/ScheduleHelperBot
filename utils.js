import { t } from './translations.js';

export const CONFIG = Object.freeze({
  TIMEZONE: 'Asia/Shanghai',
  GROUPS: ['2-7', '2-8', '5-2', '6-2'],
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_REMINDER_MINUTES: 10,
  MORNING_CRON_UTC: '*/1 * * * *',
  REMINDER_CRON_UTC: '*/2 * * * *',
  DEFAULT_ADMIN_ID: 123456789
});

const WEEKDAY_NAME_TO_INDEX = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7
};

const INDEX_TO_ENGLISH_WEEKDAY = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday'
};

export function getAdminId(env) {
  const fromEnv = Number(env.ADMIN_ID);
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return fromEnv;
  }
  return CONFIG.DEFAULT_ADMIN_ID;
}

export function escapeHtml(input) {
  return String(input ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function parseTimeToMinutes(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const [hours, minutes] = value.trim().split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

export function toTimeRange(startTime, endTime) {
  if (!startTime || !endTime) {
    return '';
  }
  return `${startTime}-${endTime}`;
}

function getFormatter(timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short'
  });
}

export function getZonedDateParts(date = new Date(), timeZone = CONFIG.TIMEZONE) {
  const parts = getFormatter(timeZone).formatToParts(date);
  const values = Object.create(null);
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }

  const weekdayShort = String(values.weekday ?? '').slice(0, 3).toLowerCase();
  const weekday = WEEKDAY_NAME_TO_INDEX[weekdayShort] ?? 1;

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    weekday
  };
}

export function getDateKey(parts) {
  const year = String(parts.year).padStart(4, '0');
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function getNowContext(now = new Date(), timeZone = CONFIG.TIMEZONE) {
  const zoned = getZonedDateParts(now, timeZone);
  return {
    date: now,
    zoned,
    nowMinutes: zoned.hour * 60 + zoned.minute,
    dateKey: getDateKey(zoned)
  };
}

export function minutesToHuman(minutes, language) {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return '0';
  }

  const hourLabel = t(language, 'time.hour');
  const minLabel = t(language, 'time.min');
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}${hourLabel} ${mins}${minLabel}`;
  }
  if (hours > 0) {
    return `${hours}${hourLabel}`;
  }
  return `${mins}${minLabel}`;
}

export function getLessonStatus(lesson, nowMinutes) {
  const start = parseTimeToMinutes(lesson.start_time);
  const end = parseTimeToMinutes(lesson.end_time);

  if (start === null || end === null) {
    return { type: 'unknown', minutesLeft: null };
  }

  if (nowMinutes < start) {
    return { type: 'upcoming', minutesLeft: start - nowMinutes };
  }

  if (nowMinutes >= start && nowMinutes < end) {
    return { type: 'in_progress', minutesLeft: 0 };
  }

  return { type: 'finished', minutesLeft: 0 };
}

export function normalizeWeekdayValue(value) {
  if (typeof value === 'number' && value >= 1 && value <= 7) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const numeric = Number(trimmed);
    if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 7) {
      return numeric;
    }

    const lowered = trimmed.slice(0, 3).toLowerCase();
    if (WEEKDAY_NAME_TO_INDEX[lowered]) {
      return WEEKDAY_NAME_TO_INDEX[lowered];
    }
  }

  return null;
}

export function getEnglishWeekdayName(weekdayIndex) {
  return INDEX_TO_ENGLISH_WEEKDAY[weekdayIndex] ?? 'Monday';
}

export function pickLanguageByTelegram(telegramLanguageCode) {
  if (typeof telegramLanguageCode === 'string' && telegramLanguageCode.toLowerCase().startsWith('ru')) {
    return 'ru';
  }
  return CONFIG.DEFAULT_LANGUAGE;
}

export function parseReminderChoice(text) {
  if (text === '5 min') {
    return { enabled: 1, minutes: 5 };
  }
  if (text === '10 min') {
    return { enabled: 1, minutes: 10 };
  }
  if (text === 'Off') {
    return { enabled: 0, minutes: CONFIG.DEFAULT_REMINDER_MINUTES };
  }
  return null;
}

export async function fetchHangzhouWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=30.2741&longitude=120.1551&timezone=Asia%2FShanghai&current=temperature_2m,weather_code';

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`weather_api_status_${response.status}`);
    }

    const payload = await response.json();
    const current = payload?.current;

    if (!current || typeof current.temperature_2m !== 'number' || typeof current.weather_code !== 'number') {
      throw new Error('weather_payload_invalid');
    }

    return {
      temperature: Math.round(current.temperature_2m),
      code: Number(current.weather_code)
    };
  } catch (error) {
    console.error('weather_fetch_error', error);
    return null;
  }
}

export function getWeatherPresentation(code, language) {
  const weather = weatherBucket(code);
  return {
    emoji: weather.emoji,
    text: t(language, weather.textKey),
    isRainy: weather.isRainy
  };
}

export function getWeatherAdvice({ temperature, code }, language) {
  const weather = weatherBucket(code);

  if (weather.isRainy) {
    return t(language, 'weather.adviceUmbrella');
  }

  if (temperature >= 30) {
    return t(language, 'weather.adviceHot');
  }

  if (temperature <= 10) {
    return t(language, 'weather.adviceCold');
  }

  return t(language, 'weather.adviceGood');
}

function weatherBucket(code) {
  if (code === 0) {
    return { emoji: '☀️', textKey: 'weather.clear', isRainy: false };
  }
  if (code === 1) {
    return { emoji: '🌤', textKey: 'weather.mainlyClear', isRainy: false };
  }
  if (code === 2) {
    return { emoji: '⛅️', textKey: 'weather.partlyCloudy', isRainy: false };
  }
  if (code === 3) {
    return { emoji: '☁️', textKey: 'weather.cloudy', isRainy: false };
  }
  if (code === 45 || code === 48) {
    return { emoji: '🌫', textKey: 'weather.fog', isRainy: false };
  }
  if ([51, 53, 55, 56, 57].includes(code)) {
    return { emoji: '🌦', textKey: 'weather.drizzle', isRainy: true };
  }
  if ([61, 63, 65, 66, 67].includes(code)) {
    return { emoji: '🌧', textKey: 'weather.rain', isRainy: true };
  }
  if ([80, 81, 82].includes(code)) {
    return { emoji: '🌧', textKey: 'weather.showers', isRainy: true };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { emoji: '🌨', textKey: 'weather.snow', isRainy: false };
  }
  if ([95, 96, 99].includes(code)) {
    return { emoji: '⛈', textKey: 'weather.thunder', isRainy: true };
  }

  return { emoji: '🌥', textKey: 'weather.unknown', isRainy: false };
}
