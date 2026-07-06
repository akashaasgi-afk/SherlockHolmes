/**
 * SHERLOCK HOLMES INVESTIGATIONS — Cloudflare Worker v3
 * 
 * Variables (Settings → Variables → Encrypt ✓):
 *   ANTHROPIC_API_KEY  = sk-ant-api03-...
 *   TELEGRAM_BOT_TOKEN = 1234567890:AAF...
 *   TELEGRAM_CHAT_ID   = 1809135877
 */

export default {
  async fetch(request, env) {

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-action, x-search',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const ok = (data, status = 200) => new Response(
      JSON.stringify(data),
      { status, headers: { ...cors, 'Content-Type': 'application/json' } }
    );

    // ── Parse body ──
    let body = {};
    try { body = await request.json(); } catch(e) {}

    const action = request.headers.get('x-action') || 'ai';

    // ════════════════════════════════
    // TELEGRAM
    // ════════════════════════════════
    if (action === 'telegram') {
      const token = env.TELEGRAM_BOT_TOKEN;
      const chatId = env.TELEGRAM_CHAT_ID;

      if (!token) return ok({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing in Worker Variables' });
      if (!chatId) return ok({ ok: false, error: 'TELEGRAM_CHAT_ID missing in Worker Variables' });

      const msg = (body.message || 'Sherlock notification').substring(0, 4096);

      try {
        const r = await fetch(
          'https://api.telegram.org/bot' + token + '/sendMessage',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: Number(chatId),  // FIX: винаги integer
              text: msg,
              parse_mode: 'HTML'
            })
          }
        );
        const data = await r.json();
        return ok(data);
      } catch(e) {
        return ok({ ok: false, error: 'Telegram fetch error: ' + e.message });
      }
    }

    // ════════════════════════════════
    // AI — Claude
    // ════════════════════════════════
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) return ok({ error: { message: 'ANTHROPIC_API_KEY missing in Worker Variables' } }, 500);

    const wantsSearch = request.headers.get('x-search') === 'true';

    const payload = {
      model: body.model || 'claude-sonnet-4-6',
      max_tokens: Math.min(body.max_tokens || 1000, 4000),
      system: body.system || '',
      messages: body.messages || [],
    };

    if (wantsSearch) {
      payload.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }];
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };
    if (wantsSearch) headers['anthropic-beta'] = 'web-search-2025-03-05';

    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      return ok(data, r.status);
    } catch(e) {
      return ok({
        error: { message: 'Upstream error: ' + e.message },
        content: [{ type: 'text', text: 'Sherlock temporarily unavailable. Try again.' }]
      }, 503);
    }
  }
};
