export async function callTelegram(env, method, payload) {
  const maxAttempts = 3;
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (response.ok && result.ok !== false) {
      return result.result;
    }

    const description = result?.description || `telegram_http_${response.status}`;
    const retryAfter = Number(result?.parameters?.retry_after ?? 0);
    const shouldRetry = attempt < maxAttempts && (response.status === 429 || response.status >= 500);
    if (shouldRetry) {
      const delayMs = Math.max(1000, Math.min(retryAfter || attempt, 5) * 1000);
      await sleep(delayMs);
      continue;
    }

    throw new Error(description);
  }
}

export async function sendMessage(env, chatId, text, options = {}) {
  return callTelegram(env, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...options
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
