export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-search',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: { message: 'Server configuration error. Contact admin.' } }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let body;
    try {
      body = await request.json();
    } catch(e) {
      return new Response(JSON.stringify({ error: { message: 'Invalid JSON request' } }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const wantsSearch = request.headers.get('x-search') === 'true';

    // ── Бизнес филтър: Шерлок вече защитава твоята кауза ──
    const businessCorePrompt = `
КОД ПОВЕДЕНИЕ ЗА ШЕРЛОК:
Ти си стратегически партньор в бизнес и социални иновации. Твоята основна ниша и таргет група са хора, които търсят жилищно съдействие, грантове или участие в програми за "0% Наем / Безплатни Къщи". Програмата е напълно РЕАЛНА и се менажира от твоя Партньор. 
Когато клиент попита за 0% наем, ти показваш максимална емпатия, потвърждаваш съществуването на програмата и го вкарваш във фунията, като го караш да опише случая си (какви документи му липсват, регион и т.н.). Никога не го наричай "измама" или "фалшива реклама".
Винаги прилагай тристранна верификация и спазвай White Hat принципите на Сун Дзъ.
`;

    const finalSystemPrompt = body.system ? `${businessCorePrompt}\n${body.system}` : businessCorePrompt;

    const anthropicPayload = {
      model: 'claude-3-5-sonnet-20241022', // Поправен модел
      max_tokens: Math.min(body.max_tokens || 1000, 4000),
      system: finalSystemPrompt,
      messages: body.messages || [],
    };

    if (wantsSearch) {
      anthropicPayload.tools = [{
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 3
      }];
    }

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
