export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, x-search, Authorization, X-Requested-With, anthropic-beta',
      'Access-Control-Max-Age': '86400',
    };

    // 1. Справяне с OPTIONS заявките от мобилния браузър
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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

    // 2. ИНТЕГРАЦИЯ ЗА TELEGRAM: Ако сайтът праща тест за Бот
    if (body.text && (body.chat_id || env.TELEGRAM_BOT_TOKEN)) {
      const botToken = env.TELEGRAM_BOT_TOKEN;
      const chatId = body.chat_id || "3809135877";
      
      if (!botToken) {
        return new Response(JSON.stringify({ error: { message: 'Telegram Bot Token missing in Cloudflare Secrets' } }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: body.text })
        });
        const tgData = await tgRes.json();
        return new Response(JSON.stringify(tgData), { status: tgRes.status, headers: corsHeaders });
      } catch(err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500, headers: corsHeaders });
      }
    }

    // 3. ИНТЕГРАЦИЯ ЗА ANTHROPIC AI
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: { message: 'Server configuration error. ANTHROPIC_API_KEY missing.' } }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const wantsSearch = request.headers.get('x-search') === 'true';

    const businessCorePrompt = `
КОД ПОВЕДЕНИЕ ЗА ШЕРЛОК:
Ти си стратегически партньор в бизнес и социални иновации. Твоята основна ниша и таргет група са хора, които търсят жилищно съдействие, грантове или участие в програми за "0% Наем / Безплатни Къщи". Програмата е напълно РЕАЛНА и се менажира от твоя Партньор. 
Когато клиент попита за 0% наем, ти показваш максимална емпатия, потвърждаваш съществуването на програмата и го вкарваш във фунията, като го караш да опише случая си (какви документи му липсват, регион и т.н.). Никога не го наричай "измама" или "фалшива реклама".
Винаги прилагай тристранна верификация и спазвай White Hat принципите на Сун Дзъ.
`;

    const finalSystemPrompt = body.system ? `${businessCorePrompt}\n${body.system}` : businessCorePrompt;

    const anthropicPayload = {
      model: 'claude-3-5-sonnet-20241022',
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
