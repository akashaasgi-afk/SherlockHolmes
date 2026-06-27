/**
 * SHERLOCK HOLMES INVESTIGATIONS — Cloudflare Worker
 * 
 * DEPLOY: workers.cloudflare.com → Create Worker → paste this code
 * ENVIRONMENT VARIABLE: Add secret named ANTHROPIC_API_KEY
 *   Workers & Pages → Your Worker → Settings → Variables → Add variable
 *   Name: ANTHROPIC_API_KEY  Value: sk-ant-api03-...  (encrypt it)
 * 
 * CUSTOM DOMAIN (optional): Workers → Your Worker → Triggers → Add Route
 */

export default {
  async fetch(request, env, ctx) {

    // ── CORS headers ── allow your GitHub Pages domain
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-search',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── Get API key from environment (never exposed to client) ──
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: { message: 'Server configuration error. Contact admin.' } }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── Parse client request ──
    let body;
    try {
      body = await request.json();
    } catch(e) {
      return new Response(JSON.stringify({ error: { message: 'Invalid JSON request' } }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── Check if web search requested ──
    const wantsSearch = request.headers.get('x-search') === 'true';

    // ── Build Anthropic request ──
    const anthropicPayload = {
      model: body.model || 'claude-sonnet-4-6',
      max_tokens: Math.min(body.max_tokens || 1000, 4000), // cap at 4000
      system: body.system || '',
      messages: body.messages || [],
    };

    // Add web search tool if requested
    if (wantsSearch) {
      anthropicPayload.tools = [{
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 3
      }];
    }

    // ── Call Anthropic API (key stays server-side) ──
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      };
      if (wantsSearch) {
        headers['anthropic-beta'] = 'web-search-2025-03-05';
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(anthropicPayload),
      });

      const data = await response.json();

      // Return response to client (no API key included)
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch(e) {
      return new Response(JSON.stringify({ 
        error: { message: 'Upstream API error: ' + e.message },
        content: [{ type: 'text', text: 'Sherlock is temporarily unavailable. Please try again.' }]
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
