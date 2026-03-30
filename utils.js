import { t } from './translations.js';

export const CONFIG = Object.freeze({
  TIMEZONE: 'Asia/Shanghai',
  GROUPS: ['1-7', '2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '2-7', '2-8', '3-4', '3-6', '4-3', '4-4', '4-6', '4-7', '5-2', '6-2'],
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_REMINDER_MINUTES: 10,
  DEFAULT_MORNING_TIME: '07:00',
  MORNING_TIME_OPTIONS: ['07:00', '07:30', '08:00'],
  SEND_BATCH_SIZE: 10,
  SEND_BATCH_PAUSE_MS: 300,
  MORNING_CRON_UTC: ['*/30 23 * * *', '0 0 * * *'],
  EVENING_PREVIEW_CRON_UTC: '0 12 * * *',
  ADMIN_REPORT_CRON_UTC: '5 12 * * *',
  REMINDER_CRON_UTC: '*/2 * * * *',
  DEFAULT_ADMIN_ID: 123456789
});

const WEEKDAY_NAME_TO_INDEX = {
  mon: 1,
  monday: 1,
  пон: 1,
  понедельник: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  вт: 2,
  втр: 2,
  вторник: 2,
  wed: 3,
  weds: 3,
  wednesday: 3,
  ср: 3,
  среда: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  чт: 4,
  четверг: 4,
  fri: 5,
  friday: 5,
  пт: 5,
  пятница: 5,
  sat: 6,
  saturday: 6,
  сб: 6,
  суббота: 6,
  sun: 7,
  sunday: 7,
  вс: 7,
  воскресенье: 7
};

export function getAdminId(env) {
  const fromEnv = Number(env.ADMIN_ID);
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return fromEnv;
  }
  return CONFIG.DEFAULT_ADMIN_ID;
}

export function getBotInstanceId(env) {
  const token = String(env?.BOT_TOKEN ?? '').trim();
  if (!token || !token.includes(':')) {
    return '';
  }
  return token.split(':')[0] || '';
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

export function getClockKey(parts) {
  const hour = String(parts.hour ?? 0).padStart(2, '0');
  const minute = String(parts.minute ?? 0).padStart(2, '0');
  return `${hour}:${minute}`;
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
    return { type: 'in_progress', minutesLeft: end - nowMinutes };
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

    const lowered = trimmed.toLowerCase();
    if (WEEKDAY_NAME_TO_INDEX[lowered]) {
      return WEEKDAY_NAME_TO_INDEX[lowered];
    }

    const shortened = lowered.slice(0, 3);
    if (WEEKDAY_NAME_TO_INDEX[shortened]) {
      return WEEKDAY_NAME_TO_INDEX[shortened];
    }
  }

  return null;
}

export function pickLanguageByTelegram(telegramLanguageCode) {
  if (typeof telegramLanguageCode === 'string') {
    const code = telegramLanguageCode.toLowerCase();
    if (code.startsWith('ru')) {
      return 'ru';
    }
    if (code.startsWith('zh')) {
      return 'zh';
    }
  }
  return CONFIG.DEFAULT_LANGUAGE;
}

export function parseReminderChoice(text) {
  if (text === '30 min') {
    return { enabled: 1, minutes: 30 };
  }
  if (text === '5 min') {
    return { enabled: 1, minutes: 5 };
  }
  if (text === '10 min') {
    return { enabled: 1, minutes: 10 };
  }
  if (text === 'Off' || text === 'Выкл' || text === '关闭') {
    return { enabled: 0, minutes: CONFIG.DEFAULT_REMINDER_MINUTES };
  }
  return null;
}

export function parseMorningTimeChoice(text) {
  const rawValue = String(text ?? '').trim();
  const value = rawValue.replace(/^✅\s*/, '');
  if (CONFIG.MORNING_TIME_OPTIONS.includes(value)) {
    return value;
  }
  return null;
}

export async function runInBatches(items, handler, options = {}) {
  const list = Array.isArray(items) ? items : [];
  const batchSize = Math.max(1, Number(options.batchSize ?? CONFIG.SEND_BATCH_SIZE) || CONFIG.SEND_BATCH_SIZE);
  const pauseMs = Math.max(0, Number(options.pauseMs ?? CONFIG.SEND_BATCH_PAUSE_MS) || 0);
  const results = [];

  for (let index = 0; index < list.length; index += batchSize) {
    const batch = list.slice(index, index + batchSize);
    const settled = await Promise.allSettled(batch.map((item, batchIndex) => handler(item, index + batchIndex)));
    results.push(...settled);

    if (pauseMs > 0 && index + batchSize < list.length) {
      await sleep(pauseMs);
    }
  }

  return results;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchHangzhouWeather() {
  const headers = { 'Accept': 'application/json' };

  try {
    const primaryUrl = 'https://api.open-meteo.com/v1/forecast?latitude=30.2741&longitude=120.1551&timezone=Asia%2FShanghai&current=weather_code&daily=temperature_2m_max&forecast_days=1';
    const primaryResponse = await fetch(primaryUrl, { headers });
    if (!primaryResponse.ok) {
      throw new Error(`weather_primary_status_${primaryResponse.status}`);
    }

    const primaryPayload = await primaryResponse.json();
    const current = primaryPayload?.current;
    const dailyMax = primaryPayload?.daily?.temperature_2m_max?.[0];
    if (typeof dailyMax === 'number' && current && typeof current.weather_code === 'number') {
      return {
        temperature: Math.round(dailyMax),
        code: Number(current.weather_code)
      };
    }

    throw new Error('weather_primary_payload_invalid');
  } catch (primaryError) {
    try {
      const fallbackUrl = 'https://api.open-meteo.com/v1/forecast?latitude=30.2741&longitude=120.1551&timezone=Asia%2FShanghai&current_weather=true&daily=temperature_2m_max&forecast_days=1';
      const fallbackResponse = await fetch(fallbackUrl, { headers });
      if (!fallbackResponse.ok) {
        throw new Error(`weather_fallback_status_${fallbackResponse.status}`);
      }

      const fallbackPayload = await fallbackResponse.json();
      const currentWeather = fallbackPayload?.current_weather;
      const dailyMax = fallbackPayload?.daily?.temperature_2m_max?.[0];
      if (!currentWeather || typeof currentWeather.weathercode !== 'number') {
        throw new Error('weather_fallback_payload_invalid');
      }

      return {
        temperature: Math.round(typeof dailyMax === 'number' ? dailyMax : currentWeather.temperature),
        code: Number(currentWeather.weathercode)
      };
    } catch (fallbackError) {
      console.error('weather_fetch_error', {
        primary: String(primaryError),
        fallback: String(fallbackError)
      });
      return null;
    }
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
