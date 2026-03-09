import { handleUpdate } from './bot.js';
import { handleScheduled } from './cron.js';
import { ensureSchema } from './db.js';

export default {
  async fetch(request, env, ctx) {
    try {
      await ensureSchema(env.DB);

      const url = new URL(request.url);
      if (request.method === 'GET' && url.pathname === '/health') {
        return new Response('ok', { status: 200 });
      }

      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }

      const update = await request.json();
      ctx.waitUntil(handleUpdate(update, env));
      return new Response('ok', { status: 200 });
    } catch (error) {
      console.error('fetch_handler_error', error);
      return new Response('Internal Error', { status: 500 });
    }
  },

  async scheduled(event, env, ctx) {
    try {
      await ensureSchema(env.DB);
      ctx.waitUntil(handleScheduled(event, env));
    } catch (error) {
      console.error('scheduled_handler_error', error);
    }
  }
};
