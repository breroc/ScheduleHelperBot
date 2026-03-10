import { handleUpdate } from './bot.js';
import { handleScheduled } from './cron.js';
import { ensureSchema } from './db.js';

export default {
  async fetch(request, env, ctx) {
    try {
      await ensureSchema(env.DB);
      if (!env.BOT_TOKEN) {
        console.error('missing_bot_token');
      }

      const url = new URL(request.url);
      if (request.method === 'GET' && url.pathname === '/health') {
        return new Response('ok', { status: 200 });
      }

      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }

      if (!isAuthorizedWebhookRequest(request, env, url)) {
        return new Response('Forbidden', { status: 403 });
      }

      let update;
      try {
        update = await request.json();
      } catch (error) {
        console.error('webhook_invalid_json', { error: String(error) });
        return new Response('Bad Request', { status: 400 });
      }

      console.log('webhook_request', {
        updateId: Number(update?.update_id ?? 0) || null,
        hasMessage: Boolean(update?.message),
        hasEditedMessage: Boolean(update?.edited_message),
        hasCallbackQuery: Boolean(update?.callback_query)
      });

      ctx.waitUntil((async () => {
        try {
          await handleUpdate(update, env);
        } catch (error) {
          console.error('update_handler_error', error);
        }
      })());
      return new Response('ok', { status: 200 });
    } catch (error) {
      console.error('fetch_handler_error', error);
      return new Response('Internal Error', { status: 500 });
    }
  },

  async scheduled(event, env, ctx) {
    try {
      await ensureSchema(env.DB);
      if (!env.BOT_TOKEN) {
        console.error('missing_bot_token');
      }
      ctx.waitUntil((async () => {
        try {
          await handleScheduled(event, env);
        } catch (error) {
          console.error('scheduled_task_error', error);
        }
      })());
    } catch (error) {
      console.error('scheduled_handler_error', error);
    }
  }
};

function isAuthorizedWebhookRequest(request, env, url) {
  const expectedPath = getWebhookPath(env);
  if (!expectedPath || normalizePath(url.pathname) !== expectedPath) {
    return false;
  }

  const expectedSecret = String(env.WEBHOOK_SECRET ?? '').trim();
  if (!expectedSecret) {
    return true;
  }

  const headerSecret = String(request.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? '').trim();
  return headerSecret === expectedSecret;
}

function getWebhookPath(env) {
  const customPath = String(env.WEBHOOK_PATH ?? '').trim();
  if (customPath) {
    return normalizePath(customPath);
  }

  const token = String(env.BOT_TOKEN ?? '').trim();
  if (!token) {
    return '';
  }

  return normalizePath(`/${token}`);
}

function normalizePath(pathname) {
  const normalized = String(pathname || '').trim();
  if (!normalized || normalized === '/') {
    return '/';
  }

  const withLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
}
