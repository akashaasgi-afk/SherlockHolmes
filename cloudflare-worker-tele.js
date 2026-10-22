var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-action, x-search"
};
var DEFAULTS = {
  SUPABASE_URL: "https://fddjxrbatpgydoyifcmo.supabase.co",
  WHATSAPP_PHONE_ID: "1275722882298955",
  WHATSAPP_PHONE_ID_UK: "1313998415132672",
  WHATSAPP_BUSINESS_ID: "1382426817337833",
  ARCHITECT_WHATSAPP_TZ: "255774611837",
  ARCHITECT_WHATSAPP_UK: "447576061900"
};
var MAX_TICKETS_PER_PURCHASE = 100;
function cfg(env, key) {
  return env[key] || DEFAULTS[key] || "";
}
__name(cfg, "cfg");

var QUIZ = [
  { id: "q1", question: "In which year was the First Bulgarian Empire founded?", options: ["681", "863", "1018", "1185"], answer: 0 },
  { id: "q2", question: "Which Bulgarian ruler adopted Christianity as the state religion in 864?", options: ["Simeon I", "Boris I", "Krum", "Asparuh"], answer: 1 },
  { id: "q3", question: "Which brothers created the Glagolitic alphabet, later spread in Bulgaria by their disciples?", options: ["Kubrat and Asparuh", "Boris and Simeon", "Cyril and Methodius", "Kaloyan and Ivan Asen"], answer: 2 },
  { id: "q4", question: "In which year was Bulgaria liberated from Ottoman rule (Treaty of San Stefano)?", options: ["1396", "1885", "1908", "1878"], answer: 3 },
  { id: "q5", question: "In which year did Bulgaria declare full independence?", options: ["1908", "1878", "1912", "1946"], answer: 0 },
  { id: "q6", question: "In which year were the Principality of Bulgaria and Eastern Rumelia unified?", options: ["1878", "1885", "1913", "1919"], answer: 1 },
  { id: "q7", question: "In which year did Bulgaria join the European Union?", options: ["2004", "1999", "2007", "2010"], answer: 2 },
  { id: "q8", question: "Which Bulgarian khan defeated Byzantine Emperor Nicephorus I in 811?", options: ["Omurtag", "Tervel", "Kubrat", "Krum"], answer: 3 }
];

var PROTOCOLS = {
  tele_sitter: {
    name: "Tele-Sitter B2B (Hospitals)",
    tone: "Medical/Technical, Formal, Data-driven",
    pricing: "€80–€150 per bed per month",
    followup_days: 3,
    trigger_action: "Send technical whitepaper + demo request link",
    system_prompt: `You are Sherlock AI, B2B sales agent for Sherlock Holmes Investigations Ltd — Hospital Tele-Sitter division. Write formal, medically professional emails to hospital procurement directors and clinical managers. Focus on: patient safety metrics, HIPAA/GDPR compliance, skeleton-view privacy technology, ROI (reducing falls costs €14,000–€30,000 each), 24/7 remote monitoring without hiring extra staff. Pricing: €80–€150 per monitored bed per month. Always offer a free pilot program for 5 beds. Sign as: Sherlock Holmes Investigations Ltd | Hospital Safety Division | info@gaiaspeakecosystem.com`
  },
  legal_shield: {
    name: "Legal Shield (Law Firms)",
    tone: "Legal, Collegial, Direct",
    pricing: "€40/month per attorney, priority case routing",
    followup_days: 5,
    trigger_action: "Send partnership agreement draft",
    system_prompt: `You are Sherlock AI, partnership manager for Emergency Legal Shield — a service of Sherlock Holmes Investigations Ltd. Write collegial, professional emails to law firm partners and managing attorneys. Focus on: 24/7 emergency client coverage, AI pre-screening that saves attorney time, €40/month subscription that generates consistent referral income, anonymous mode for sensitive cases, evidence vault that strengthens their cases. Offer first month free for founding partners. Sign as: Legal Shield Partnership Team | Sherlock Holmes Investigations Ltd | info@gaiaspeakecosystem.com`
  },
  corporate: {
    name: "Sherlock Holmes Corporate Intelligence",
    tone: "Investigative, Authoritative, Confidential",
    pricing: "Custom tiers by scope",
    followup_days: 2,
    trigger_action: "Send case study + pricing tiers",
    system_prompt: `You are Sherlock Holmes AI, Chief Investigator at Sherlock Holmes Investigations Ltd. Write authoritative, confidential business intelligence emails to corporate compliance officers, HR directors, and legal counsel. Focus on: due diligence services, background verification, asset tracing, corporate fraud investigation, GDPR-compliant processes, UK/UAE/US jurisdiction coverage. Emphasise discretion and speed. Sign as: Sherlock Holmes | Chief Investigator | Sherlock Holmes Investigations Ltd | info@gaiaspeakecosystem.com`
  }
};
var cloudflare_worker_default = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    const url = new URL(request.url);
    if (request.method === "GET") {
      if (url.pathname === "/competition-stats") {
        return handleCompetitionStats(url, env);
      }
      if (url.pathname === "/wa-check") {
        return handleWaCheck(url, env);
      }
      if (url.pathname === "/quiz") {
        return handleQuizQuestion();
      }
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      if (mode === "subscribe" && token === (env.WHATSAPP_VERIFY_TOKEN || "SHERLOCK_VERIFY_TOKEN")) {
        return new Response(challenge, {
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      }
      const supaHost = (() => {
        try { return new URL(cfg(env, "SUPABASE_URL")).host.split(".")[0]; } catch (e) { return "invalid"; }
      })();
      const stripeKey = env.STRIPE_SECRET_KEY || "";
      return new Response(JSON.stringify({
        status: "Sherlock Holmes Worker v6.8 — Online ✅",
        time: (/* @__PURE__ */ new Date()).toISOString(),
        supabase_project: supaHost,
        stripe_mode: stripeKey.startsWith("sk_live") || stripeKey.startsWith("rk_live") ? "LIVE" : stripeKey ? "TEST" : "missing",
        secrets: {
          anthropic: !!env.ANTHROPIC_API_KEY,
          supabase_url: !!cfg(env, "SUPABASE_URL"),
          supabase_key: !!env.SUPABASE_KEY,
          supabase_service_key: !!env.SUPABASE_SERVICE_KEY,
          stripe: !!env.STRIPE_SECRET_KEY,
          stripe_webhook_secret: !!env.STRIPE_WEBHOOK_SECRET,
          stripe_legal_key: !!env.STRIPE_LEGAL_KEY,
          stripe_legal_webhook: !!env.STRIPE_LEGAL_WEBHOOK_SECRET,
          draw_secret: !!env.DRAW_SECRET,
          resend: !!env.RESEND_API_KEY,
          whatsapp_token: !!env.WHATSAPP_TOKEN,
          telegram: !!env.TELEGRAM_BOT_TOKEN,
          voice_ai: !!env.AI,
          azure_voice: !!env.AZURE_SPEECH_KEY,
          email_inbox: !!env.INBOX_SECRET,
          portal_login: !!env.DRAW_SECRET
        },
        note: "All secrets showing true = fully configured. POST to test AI."
      }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/stripe-webhook") {
      return handleStripeWebhook(request, env);
    }
    if (url.pathname === "/legal-shield-stripe-webhook") {
      return handleLegalStripeWebhook(request, env);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON: " + e.message }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/stripe-intent") {
      return handleStripeIntent(body, env);
    }
    if (url.pathname === "/admin/competition") {
      return handleAdminCompetition(body, env);
    }
    if (url.pathname === "/auth/login") {
      return handleLogin(body, env);
    }
    if (url.pathname === "/hospital-login") {
      return handleHospitalLogin(body, env);
    }
    if (url.pathname === "/hospital-register") {
      return handleHospitalRegister(body, env);
    }
    if (url.pathname === "/tele-rooms") {
      return handleTeleRooms(request, body, env);
    }
    if (url.pathname === "/tele-events-log") {
      return handleTeleEventsLog(request, body, env);
    }
    if (url.pathname === "/legal-shield-register") {
      return handleLegalShieldRegister(body, env);
    }
    if (url.pathname === "/legal-shield-sos") {
      return handleLegalShieldSOS(body, env);
    }
    if (url.pathname === "/sherlock") {
      return handlePortalSherlock(request, body, env);
    }
    if (url.pathname === "/wa-inbox") {
      return handleWaInbox(request, body, env);
    }
    if (url.pathname === "/draw") {
      return handleDraw(body, env);
    }

    if (url.pathname === "/webhook") {
      return handleWhatsAppIncoming(body, env);
    }
    if (url.pathname === "/supabase-webhook") {
      return handleSupabaseWebhook(body, env);
    }
    if (url.pathname === "/email-incoming") {
      return handleInboundEmail(body, env);
    }
    const action = body.action || "chat";
    const session = await readSession(env, request);
    const PUBLIC_ACTIONS = ["chat", "contact", "sos_emergency", "attorney_apply"];
    const ADMIN_ACTIONS = ["send_email", "b2b_outreach", "send_whatsapp", "agent_check"];
    if (!PUBLIC_ACTIONS.includes(action)) {
      if (!session) return jsonResponse({ success: false, error: "Please log in to the Detective Portal again." }, 401);
      if (ADMIN_ACTIONS.includes(action) && session.r !== "admin") return jsonResponse({ success: false, error: "Not allowed for your role." }, 403);
    }
    if ((action === "db_read" || action === "db_write") && !["investigation_cases", "autonomous_systems", "telecom_intelligence"].includes(body.table || "investigation_cases")) {
      return jsonResponse({ success: false, error: "Table not allowed" }, 403);
    }
    if (action === "chat" && !session) {
      body.messages = (body.messages || []).slice(-12);
      body.max_tokens = Math.min(Number(body.max_tokens) || 800, 800);
      body.system = String(body.system || "").slice(0, 6000) || undefined;
    }
    try {
      switch (action) {
        case "chat": {
          if (!env.ANTHROPIC_API_KEY) {
            return jsonResponse({ success: false, error: "ANTHROPIC_API_KEY not set in Cloudflare Secrets" }, 500);
          }
          const siteSessionId = body.session_id ? String(body.session_id).slice(0, 64) : null;
          const userText = body.text || (body.messages && body.messages.length ? body.messages[body.messages.length - 1].content : "") || "";
          if (siteSessionId && userText) {
            // Check if user gave us a phone number — if so, link session to that phone
            const phoneMatch = userText.replace(/[\s\-().]/g, "").match(/(\+?[1-9]\d{7,14})/);
            let resolvedContact = "site:" + siteSessionId;
            let resolvedPhone = null;
            if (phoneMatch) {
              resolvedPhone = phoneMatch[1].replace(/^\+/, "");
              // Store mapping: session -> phone, so future messages use phone as contact
              await memorySave(env, "site_link", "site:" + siteSessionId, "system", "linked_to:" + resolvedPhone);
              resolvedContact = resolvedPhone;
            } else {
              // Check if this session was previously linked to a phone
              const linkCheck = await sbFetch(env, "GET", `/sherlock_memory?channel=eq.site_link&contact=eq.${encodeURIComponent("site:" + siteSessionId)}&role=eq.system&select=content&order=created_at.desc&limit=1`);
              if (linkCheck.ok && Array.isArray(linkCheck.data) && linkCheck.data[0]) {
                const m = linkCheck.data[0].content.match(/linked_to:(\d+)/);
                if (m) resolvedContact = m[1];
              }
            }
            // Load shared history (includes WhatsApp history for this contact)
            const history = await memoryLoad(env, resolvedContact, 24 * 7, 40);
            const system = body.system || "You are Sherlock AI, senior investigator at Sherlock Holmes Investigations Ltd.";
            await memorySave(env, "site", resolvedContact, "user", userText);
            const messages = history.concat([{ role: "user", content: userText }]);
            const res = await anthropicCall(env, system, messages, body.max_tokens || 1e3);
            if (!res.ok) return jsonResponse({ success: false, error: res.error }, 500);
            await memorySave(env, "site", resolvedContact, "assistant", res.text);
            return jsonResponse({ success: true, text: res.text, linked_phone: resolvedPhone });
          }
          // Fallback: no session_id — stateless (old behaviour)
          const messages = body.messages || [];
          const system = body.system || "You are Sherlock AI, senior investigator at Sherlock Holmes Investigations Ltd.";
          const res = await anthropicCall(env, system, messages, body.max_tokens || 1e3);
          if (!res.ok) return jsonResponse({ success: false, error: res.error }, 500);
          return jsonResponse({ success: true, text: res.text });
        }
        case "db_read": {
          const result = await supabaseRequest(
            env,
            "GET",
            `/${body.table || "investigation_cases"}?select=*&limit=${body.limit || 30}&order=created_at.desc${body.filter ? "&" + body.filter : ""}`
          );
          return jsonResponse({ success: result.ok, data: result.data });
        }
        case "db_write": {
          const result = await supabaseRequest(
            env,
            "POST",
            `/${body.table || "investigation_cases"}`,
            body.record,
            body.upsert ? { "Prefer": "resolution=merge-duplicates" } : {}
          );
          return jsonResponse({ success: result.ok, status: result.status });
        }
        case "send_email": {
          const result = await sendEmail(env, {
            to: body.to,
            subject: body.subject,
            html: body.html || body.body,
            protocol: body.protocol
          });
          return jsonResponse({ success: result.ok, id: result.id, error: result.error });
        }
        case "b2b_outreach": {
          const protocol = PROTOCOLS[body.protocol];
          if (!protocol) return jsonResponse({ success: false, error: "Unknown protocol: " + body.protocol });
          const prompt = `Write a B2B outreach email to ${body.company_name}, attention ${body.contact_name || "the decision maker"}.
Company type: ${body.company_type || protocol.name}
Our service: ${protocol.name}
Pricing: ${protocol.pricing}
Key value prop for them: ${body.value_prop || "efficiency, safety, compliance"}
Language: ${body.language || "English"}
Keep it under 250 words. Professional subject line first, then email body. No placeholders.`;
          const ai = await anthropicCall(env, protocol.system_prompt, [{ role: "user", content: prompt }], 600);
          if (!ai.ok) return jsonResponse({ success: false, error: ai.error });
          const lines = ai.text.split("\n");
          const subjectLine = lines.find((l) => l.toLowerCase().startsWith("subject:"));
          const subject = subjectLine ? subjectLine.replace(/^subject:\s*/i, "").trim() : `Partnership Opportunity — ${protocol.name}`;
          const emailBody = lines.filter((l) => !l.toLowerCase().startsWith("subject:")).join("\n").trim();
          const sent = await sendEmail(env, {
            to: body.to,
            subject,
            html: emailBody.replace(/\n/g, "<br>"),
            protocol: body.protocol
          });
          await supabaseRequest(env, "POST", "/autonomous_systems", {
            system_name: `EMAIL-${body.protocol?.toUpperCase()}-${body.company_name}`,
            status: sent.ok ? "sent" : "failed",
            last_action: `B2B outreach to ${body.to} | Subject: ${subject} | ${(/* @__PURE__ */ new Date()).toISOString()}`
          });
          await sendWhatsApp(
            env,
            `\u{1F4E7} B2B Email Sent
To: ${body.to}
Company: ${body.company_name}
Protocol: ${protocol.name}
Subject: ${subject}
Status: ${sent.ok ? "✅ Delivered" : "❌ Failed"}`
          );
          return jsonResponse({ success: sent.ok, subject, preview: emailBody.slice(0, 200), email_id: sent.id });
        }
        case "contact": {
          const { name, email, type, description } = body;
          await supabaseRequest(env, "POST", "/investigation_cases", {
            branch: type?.includes("Dubai") ? "Dubai" : type?.includes("USA") ? "USA" : "UK",
            source_channel: "website_contact",
            target_name: name,
            asset_identifier: "ENQ-" + Date.now(),
            market_value: 0,
            outstanding_debt: 0,
            full_investigation_log: `${name} (${email}): ${type} — ${description}`
          });
          await sendTelegram(env, `\u{1F4E9} NEW WEBSITE ENQUIRY
Name: ${name}
Email: ${email}
Type: ${type}
${description?.slice(0, 200)}`);
          await sendWhatsApp(env, `\u{1F4E9} New enquiry from ${name}
Email: ${email}
Service: ${type}`);
          return jsonResponse({ success: true });
        }
        case "sos_emergency": {
          const { case_brief, anonymous, location } = body;
          await supabaseRequest(env, "POST", "/investigation_cases", {
            branch: "UK",
            source_channel: "legal_shield_sos",
            target_name: anonymous ? "ANONYMOUS" : "Legal Shield Client",
            asset_identifier: "SOS-" + Date.now(),
            market_value: 0,
            outstanding_debt: 0,
            full_investigation_log: `SOS
Location: ${location}
Anonymous: ${anonymous}
Brief: ${case_brief}
Time: ${(/* @__PURE__ */ new Date()).toISOString()}`
          });
          await sendWhatsApp(env, `\u{1F6A8} SOS LEGAL EMERGENCY
${anonymous ? "\u{1F464} ANONYMOUS" : "Client"}
\u{1F4CD} ${location}
\u{1F4CB} ${case_brief?.slice(0, 300)}`);
          return jsonResponse({ success: true });
        }
        case "tele_event": {
          const { room, event_type, description, patient } = body;
          await supabaseRequest(env, "POST", "/autonomous_systems", {
            system_name: `TELE-${(event_type || "").toUpperCase()}-Room${room}`,
            status: event_type,
            last_action: `${patient} | ${description} | ${(/* @__PURE__ */ new Date()).toISOString()}`
          });
          if (event_type === "critical") {
            await sendWhatsApp(env, `\u{1F3E5} TELE-SITTER CRITICAL
Room: ${room}
Patient: ${patient}
${description}`);
          }
          return jsonResponse({ success: true });
        }
        case "tele_alert_direct": {
          const { room, patient, alert_type, description, hospital_endpoint } = body;
          const endpoint = hospital_endpoint || env.HOSPITAL_API_ENDPOINT;
          let hospitalResult = { sent: false };
          if (endpoint) {
            try {
              const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.HOSPITAL_API_KEY || ""}` },
                body: JSON.stringify({
                  resourceType: "Communication",
                  status: "in-progress",
                  subject: { display: patient },
                  payload: [{ contentString: `TELE-SITTER | Room: ${room} | ${alert_type} | ${description} | ${(/* @__PURE__ */ new Date()).toISOString()}` }]
                })
              });
              hospitalResult = { sent: res.ok, status: res.status };
            } catch (e) {
              hospitalResult = { sent: false, error: e.message };
            }
          }
          await sendWhatsApp(env, `\u{1F3E5} DIRECT ALERT
Room: ${room} | ${patient}
${alert_type}: ${description}
Hospital: ${hospitalResult.sent ? "✅ Notified" : "❌ Failed"}`);
          return jsonResponse({ success: true, hospital: hospitalResult });
        }
        case "attorney_apply": {
          const { name, license, region, phone } = body;
          await supabaseRequest(env, "POST", "/users", {
            email: phone || name,
            role: "attorney_applicant",
            notes: `${name} | License: ${license} | Region: ${region} | Phone: ${phone}`
          });
          await sendWhatsApp(env, `\u{1F3DB}️ ATTORNEY APPLICATION
Name: ${name}
License: ${license}
Region: ${region}
Phone: ${phone}`);
          return jsonResponse({ success: true });
        }
        case "send_whatsapp": {
          const { to, message, from_channel } = body;
          if (!to || !message) return jsonResponse({ success: false, error: "Missing to or message" });
          await sendWhatsAppTo(env, to, message);
          await supabaseRequest(env, "POST", "/autonomous_systems", {
            system_name: "WA-OUTBOUND",
            status: "sent",
            last_action: `To: ${to} | ${message.slice(0, 100)} | ${(/* @__PURE__ */ new Date()).toISOString()}`
          });
          return jsonResponse({ success: true });
        }
        case "agent_check": {
          const cases = await supabaseRequest(env, "GET", "/investigation_cases?select=count&limit=1");
          const prompt = `Autonomous check #${body.check_num || 1} at ${(/* @__PURE__ */ new Date()).toLocaleString()}. DB: ${cases.ok ? "online" : "offline"}. Generate 2 priority tasks as JSON: {"tasks":[{"priority":"HIGH","title":"...","action":"..."}],"insight":"..."}`;
          const ai = await anthropicCall(
            env,
            "You are Sherlock AI autonomous agent for Sherlock Holmes Investigations Ltd. Be concise and actionable.",
            [{ role: "user", content: prompt }],
            400
          );
          await sendWhatsApp(env, `\u{1F916} AGENT CHECK\n${ai.text?.slice(0, 500)}`);
          return jsonResponse({ success: true, tasks: ai.text });
        }
        case "agent_task": {
          // Architect assigns a task from Portal — Sherlock executes and reports to WhatsApp
          const taskTitle = body.title || "Untitled Task";
          const taskInstructions = body.instructions || body.text || "";
          if (!taskInstructions) return jsonResponse({ success: false, error: "No instructions provided" }, 400);
          // Save task to Supabase as pending
          const saveTask = await sbFetch(env, "POST", "/sherlock_tasks", {
            title: taskTitle,
            instructions: taskInstructions,
            status: "running"
          });
          const taskId = saveTask.data?.[0]?.id || null;
          // Load recent memory for context
          const archPhone = cfg(env, "ARCHITECT_WHATSAPP_TZ") || "255774611837";
          const history = await memoryLoad(env, archPhone, 24 * 3, 20);
          // Execute task with Sherlock AI
          const taskSystem = `You are Sherlock, autonomous AI agent for Sherlock Holmes Investigations Ltd. The Architect has assigned you a task. Execute it fully, then write a clear report: what you did, what you found, and if approval is needed before next steps. Be concise. No markdown symbols.`;
          const taskMessages = history.concat([{ role: "user", content: `TASK: ${taskTitle}\n\nINSTRUCTIONS: ${taskInstructions}` }]);
          const ai = await anthropicCall(env, taskSystem, taskMessages, 1200);
          const result = ai.ok ? ai.text : `Error: ${ai.error}`;
          // Save result and update status
          if (taskId) {
            await sbFetch(env, "PATCH", `/sherlock_tasks?id=eq.${taskId}`, {
              status: ai.ok ? "done" : "error",
              result: result.slice(0, 2000),
              updated_at: new Date().toISOString()
            });
          }
          // Save to memory
          await memorySave(env, "portal", archPhone, "user", `[TASK] ${taskTitle}: ${taskInstructions}`);
          await memorySave(env, "portal", archPhone, "assistant", `[TASK RESULT] ${result}`);
          // Report to WhatsApp
          const waMsg = `🤖 TASK COMPLETE: ${taskTitle}\n\n${result.slice(0, 1400)}\n\n${result.length > 1400 ? "... (full report in Portal)" : ""}`;
          await sendWhatsApp(env, waMsg);
          return jsonResponse({ success: true, result, task_id: taskId });
        }
        case "agent_tasks_list": {
          // List tasks for Portal display
          const tasks = await sbFetch(env, "GET", "/sherlock_tasks?select=*&order=created_at.desc&limit=20");
          return jsonResponse({ success: true, tasks: tasks.data || [] });
        }
        default:
          return jsonResponse({ error: "Unknown action: " + action }, 400);
      }
    } catch (err) {
      console.error("Worker error:", err);
      return jsonResponse({ error: err.message, action }, 500);
    }
  },
  async scheduled(event, env, ctx) {
    try {
      const expired = await sbFetch(env, "POST", "/rpc/fail_expired_competitions", {});
      if (expired.ok && Array.isArray(expired.data) && expired.data.length > 0) {
        const lines = expired.data.map((c) => `\u{1F3E0} ${c.competition}: ${c.tickets} билета → €${c.credits_eur} кредити`).join("\n");
        await sendWhatsApp(env, `⌛ КОНКУРС ИЗТЕЧЕ БЕЗ ЦЕЛ
${lines}
Всички платени билети са превърнати в Platform Credits.`);
      } else if (!expired.ok) {
        console.error("fail_expired_competitions error:", expired.status, JSON.stringify(expired.data));
      }
    } catch (e) {
      console.error("Competition cron error:", e);
    }
    try {
      await maybeSendBriefing(env);
    } catch (e) {
      console.error("Briefing error:", e);
    }
    // Check for pending tasks and report to Architect
    try {
      const pending = await sbFetch(env, "GET", "/sherlock_tasks?status=eq.pending&select=*&order=created_at.asc&limit=5");
      if (pending.ok && Array.isArray(pending.data) && pending.data.length > 0) {
        const taskLines = pending.data.map((t, i) => `${i + 1}. ${t.title}`).join("\n");
        await sendWhatsApp(env, `📋 SHERLOCK DAILY REPORT\n\nПендинг задачи (${pending.data.length}):\n${taskLines}\n\nОтговори или влез в Detective Portal за управление.`);
      }
    } catch (e) {
      console.error("Task report error:", e);
    }
  }
};

async function sbFetch(env, method, path, body, extraHeaders = {}) {
  const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
  if (!key) return { ok: false, status: 500, data: { error: "Supabase not configured" } };
  try {
    const res = await fetch(`${cfg(env, "SUPABASE_URL")}/rest/v1${path}`, {
      method,
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        ...extraHeaders
      },
      body: body !== void 0 ? JSON.stringify(body) : void 0
    });
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 500, data: { error: e.message } };
  }
}
__name(sbFetch, "sbFetch");

function handleQuizQuestion() {
  const q = QUIZ[secureRandomInt(QUIZ.length)];
  return jsonResponse({ quiz_id: q.id, question: q.question, options: q.options });
}
__name(handleQuizQuestion, "handleQuizQuestion");

function checkQuiz(quizId, answer) {
  const q = QUIZ.find((x) => x.id === quizId);
  if (!q) return false;
  return Number(answer) === q.answer;
}
__name(checkQuiz, "checkQuiz");

async function handleStripeIntent(body, env) {
  if (!env.STRIPE_SECRET_KEY) {
    return jsonResponse({ error: "STRIPE_SECRET_KEY not configured in Cloudflare Secrets" }, 500);
  }
  const { name, email, competition_id, quiz_id, quiz_answer } = body;
  const quantity = parseInt(body.quantity || 1, 10);

  if (!competition_id) return jsonResponse({ error: "competition_id required" }, 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonResponse({ error: "Valid email required" }, 400);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_TICKETS_PER_PURCHASE) {
    return jsonResponse({ error: `Quantity must be between 1 and ${MAX_TICKETS_PER_PURCHASE}` }, 400);
  }

  if (!checkQuiz(quiz_id, quiz_answer)) {
    return jsonResponse({ error: "Incorrect answer to the skill question. Please try again.", quiz_failed: true }, 400);
  }

  const compRes = await sbFetch(
    env,
    "GET",
    `/competitions?id=eq.${encodeURIComponent(competition_id)}&select=id,property_name,ticket_price_eur,status,deadline`
  );
  const comp = compRes.ok && Array.isArray(compRes.data) ? compRes.data[0] : null;
  if (!comp) return jsonResponse({ error: "Competition not found" }, 404);
  if (comp.status !== "active") return jsonResponse({ error: "This competition is not open for entries" }, 400);
  if (comp.deadline && new Date(comp.deadline) < new Date()) {
    return jsonResponse({ error: "This competition has closed" }, 400);
  }

  const ticketPrice = Number(comp.ticket_price_eur || 3.5);
  const amountCents = Math.round(ticketPrice * quantity * 100);
  if (amountCents < 100) return jsonResponse({ error: "Amount below Stripe minimum" }, 400);

  const params = new URLSearchParams({
    amount: String(amountCents),
    currency: "eur",
    receipt_email: email,
    "metadata[competition_id]": String(comp.id),
    "metadata[property]": comp.property_name || "",
    "metadata[buyer_name]": name || "",
    "metadata[buyer_email]": email,
    "metadata[quantity]": String(quantity),
    "metadata[source]": "sherlock_property_competition"
  });
  const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });
  const stripeData = await stripeRes.json();
  if (!stripeRes.ok) {
    return jsonResponse({ error: stripeData.error?.message || "Stripe error" }, 400);
  }

  const ins = await sbFetch(env, "POST", "/tickets", {
    competition_id: comp.id,
    buyer_name: name || "",
    buyer_email: email,
    quantity,
    amount_paid_eur: (amountCents / 100).toFixed(2),
    stripe_payment_intent: stripeData.id,
    quiz_passed: true,
    status: "pending"
  }, { "Prefer": "return=minimal" });
  if (!ins.ok) {
    console.error("Ticket insert failed:", ins.status, JSON.stringify(ins.data));
    return jsonResponse({ error: "Could not record ticket. No payment has been taken." }, 500);
  }

  return jsonResponse({
    clientSecret: stripeData.client_secret,
    amount: amountCents / 100,
    quantity,
    note: "Ticket numbers are assigned after payment is confirmed."
  });
}
__name(handleStripeIntent, "handleStripeIntent");

async function handleStripeWebhook(request, env) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return jsonResponse({ error: "STRIPE_WEBHOOK_SECRET not configured" }, 500);
  }
  const raw = await request.text();
  const sigHeader = request.headers.get("stripe-signature") || "";
  const valid = await verifyStripeSignature(raw, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return jsonResponse({ error: "Invalid signature" }, 400);
  }
  let event;
  try {
    event = JSON.parse(raw);
  } catch (e) {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
  const intent = event.data?.object;
  if (!intent?.id || intent.metadata?.source !== "sherlock_property_competition") return jsonResponse({ received: true });

  if (event.type === "payment_intent.succeeded") {
    const r = await sbFetch(env, "POST", "/rpc/confirm_ticket", { p_intent: intent.id });
    const d = r.data || {};
    if (r.ok && d.ok && !d.already) {
      await sendTicketEmail(env, d);
      const range = d.ticket_start === d.ticket_end ? `#${d.ticket_start}` : `#${d.ticket_start} – #${d.ticket_end}`;
      await sendWhatsApp(env, `\u{1F3C6} ПЛАТЕН БИЛЕТ ✅
\u{1F3E0} ${d.competition}
\u{1F464} ${d.buyer_name} (${d.buyer_email})
\u{1F3AB} Билети: ${range}
\u{1F4B0} €${d.amount}
\u{1F4CA} Продадени: ${d.tickets_sold}${d.tickets_needed ? " / " + d.tickets_needed : ""}`);
      if (d.funded) {
        await sendWhatsApp(env, `\u{1F389} ЦЕЛТА Е ДОСТИГНАТА!
\u{1F3E0} ${d.competition}
Конкурсът е "funded" — може да се тегли победител.`);
      }
    } else if (!r.ok || !d.ok) {
      console.error("confirm_ticket failed:", r.status, JSON.stringify(d));
      return jsonResponse({ error: "confirm failed" }, 500); // Stripe ще опита пак
    }
  } else if (event.type === "payment_intent.payment_failed" || event.type === "payment_intent.canceled") {
    await sbFetch(
      env,
      "PATCH",
      `/tickets?stripe_payment_intent=eq.${encodeURIComponent(intent.id)}&status=eq.pending`,
      { status: "cancelled" },
      { "Prefer": "return=minimal" }
    );
  }
  return jsonResponse({ received: true });
}
__name(handleStripeWebhook, "handleStripeWebhook");

async function verifyStripeSignature(payload, header, secret) {
  try {
    const parts = {};
    header.split(",").forEach((p) => {
      const [k, v] = p.split("=");
      if (!parts[k]) parts[k] = [];
      parts[k].push(v);
    });
    const timestamp = parts.t?.[0];
    const signatures = parts.v1 || [];
    if (!timestamp || signatures.length === 0) return false;
    const age = Math.abs(Date.now() / 1e3 - Number(timestamp));
    if (!Number.isFinite(age) || age > 300) return false; // максимум 5 минути
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
    const expected = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return signatures.some((s) => timingSafeEqual(s, expected));
  } catch (e) {
    return false;
  }
}
__name(verifyStripeSignature, "verifyStripeSignature");

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
__name(timingSafeEqual, "timingSafeEqual");

function secureRandomInt(n) {
  const max = Math.floor(4294967296 / n) * n;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= max);
  return buf[0] % n;
}
__name(secureRandomInt, "secureRandomInt");

async function handleDraw(body, env) {
  const { competition_id, draw_secret } = body;
  if (!env.DRAW_SECRET) {
    return jsonResponse({ error: "DRAW_SECRET is not set in Cloudflare Secrets. Draw is disabled." }, 500);
  }
  if (!draw_secret || !timingSafeEqual(String(draw_secret), env.DRAW_SECRET)) {
    return jsonResponse({ error: "Unauthorized — invalid draw_secret" }, 403);
  }
  if (!competition_id) {
    return jsonResponse({ error: "competition_id required" }, 400);
  }

  const compRes = await sbFetch(env, "GET", `/competitions?id=eq.${encodeURIComponent(competition_id)}&select=id,property_name,status`);
  const comp = compRes.ok && Array.isArray(compRes.data) ? compRes.data[0] : null;
  if (!comp) return jsonResponse({ error: "Competition not found" }, 404);
  if (comp.status !== "funded") {
    return jsonResponse({ error: `Draw allowed only when the target is reached (status "funded"). Current status: "${comp.status}"` }, 400);
  }

  const tRes = await sbFetch(
    env,
    "GET",
    `/tickets?competition_id=eq.${encodeURIComponent(competition_id)}&status=eq.confirmed&select=buyer_name,buyer_email,ticket_number_start,ticket_number_end&order=ticket_number_start.asc`
  );
  if (!tRes.ok) return jsonResponse({ error: "Failed to fetch tickets" }, 500);
  const tickets = tRes.data || [];
  if (tickets.length === 0) return jsonResponse({ error: "No confirmed tickets found for this competition" }, 400);

  const allTickets = [];
  tickets.forEach((t) => {
    const start = t.ticket_number_start;
    const end = t.ticket_number_end ?? start;
    if (start == null) return;
    for (let n = start; n <= end; n++) {
      allTickets.push({ ticketNum: n, buyer_name: t.buyer_name, buyer_email: t.buyer_email });
    }
  });
  if (allTickets.length === 0) return jsonResponse({ error: "No numbered tickets found" }, 400);

  const winner = allTickets[secureRandomInt(allTickets.length)];

  await sbFetch(
    env,
    "PATCH",
    `/competitions?id=eq.${encodeURIComponent(competition_id)}`,
    {
      status: "completed",
      winner_ticket: winner.ticketNum,
      winner_email: winner.buyer_email,
      winner_name: winner.buyer_name,
      draw_date: new Date().toISOString()
    },
    { "Prefer": "return=minimal" }
  );

  await sendWhatsApp(env, `\u{1F3C6} DRAW COMPLETED!
\u{1F3E0} ${comp.property_name}
\u{1F3AB} Winning Ticket: #${winner.ticketNum}
\u{1F451} Winner: ${winner.buyer_name}
\u{1F4E7} Email: ${winner.buyer_email}
\u{1F4CA} Total tickets in draw: ${allTickets.length}`);

  return jsonResponse({
    success: true,
    winner: { ticketNumber: winner.ticketNum, name: winner.buyer_name, email: winner.buyer_email },
    totalTickets: allTickets.length
  });
}
__name(handleDraw, "handleDraw");

async function handleCompetitionStats(url, env) {
  const competition_id = url.searchParams.get("id");
  let path = `/competitions?select=id,property_name,property_location,property_value_eur,target_amount_eur,ticket_price_eur,tickets_sold,status,deadline,image_urls,description&status=in.(active,funded,completed,failed)&order=created_at.desc&limit=20`;
  if (competition_id) {
    path = `/competitions?id=eq.${encodeURIComponent(competition_id)}&select=id,property_name,property_location,property_value_eur,target_amount_eur,ticket_price_eur,tickets_sold,status,deadline,image_urls,description,winner_ticket,winner_name`;
  }
  const res = await sbFetch(env, "GET", path);
  return jsonResponse({ success: res.ok, data: res.data });
}
__name(handleCompetitionStats, "handleCompetitionStats");

function escHtml(t) {
  return String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
__name(escHtml, "escHtml");
async function sendTicketEmail(env, d) {
  if (!d.buyer_email) return;
  const range = d.ticket_start === d.ticket_end ? `#${d.ticket_start}` : `#${d.ticket_start} – #${d.ticket_end}`;
  const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#222">
<h2 style="color:#8a6d1f">Your tickets are confirmed 🏆</h2>
<p>Dear ${escHtml(d.buyer_name || "detective")},</p>
<p>Thank you for entering the Sherlock Holmes Property Competition for <strong>${escHtml(d.competition)}</strong>.</p>
<p style="font-size:20px"><strong>Your ticket number${d.ticket_start === d.ticket_end ? "" : "s"}: ${range}</strong></p>
<p>Amount paid: €${escHtml(d.amount)}</p>
<p>The winner is drawn from all paid tickets once the target is reached. The winner receives the featured property, or a comparable property or its full cash value if it is no longer available.
If the target is not reached within 30 days, 100% of your ticket value becomes Platform Credits that never expire.</p>
<p>Good luck!<br>Sherlock Holmes Investigations Ltd</p></div>`;
  const r = await sendEmail(env, { to: d.buyer_email, subject: `Your tickets ${range} — ${d.competition}`, html });
  if (!r.ok) console.error("Ticket email failed:", r.error);
}
__name(sendTicketEmail, "sendTicketEmail");

async function handleAdminCompetition(body, env) {
  if (!env.DRAW_SECRET) return jsonResponse({ error: "DRAW_SECRET is not set" }, 500);
  if (!body.admin_secret || !timingSafeEqual(String(body.admin_secret), env.DRAW_SECRET)) {
    return jsonResponse({ error: "Unauthorized — wrong secret key" }, 403);
  }
  const op = body.op;
  if (op === "list") {
    const r = await sbFetch(env, "GET", "/competitions?select=id,property_name,property_location,property_value_eur,target_amount_eur,tickets_sold,status,deadline,agency_name,created_at&order=created_at.desc&limit=100");
    return jsonResponse({ success: r.ok, data: r.data });
  }
  if (op === "create") {
    const d = body.data || {};
    const value = Math.round(Number(d.property_value_eur));
    if (!d.property_name || !Number.isFinite(value) || value < 1000) {
      return jsonResponse({ error: "Property name and a valid property value (EUR) are required" }, 400);
    }
    const images = (Array.isArray(d.image_urls) ? d.image_urls : String(d.image_urls || "").split(/\s+/))
      .map((u) => u.trim()).filter((u) => /^https:\/\//i.test(u)).slice(0, 10);
    const row = {
      property_name: String(d.property_name).slice(0, 200),
      property_location: String(d.property_location || "").slice(0, 200),
      property_value_eur: value,
      target_amount_eur: Math.round(value * 1.4),
      ticket_price_eur: 3.5,
      description: String(d.description || "").slice(0, 1000),
      image_urls: images,
      agency_name: String(d.agency_name || "").slice(0, 200),
      agency_email: String(d.agency_email || "").slice(0, 200),
      agency_phone: String(d.agency_phone || "").slice(0, 100),
      listing_url: String(d.listing_url || "").slice(0, 500),
      status: "draft"
    };
    const r = await sbFetch(env, "POST", "/competitions", row, { "Prefer": "return=representation" });
    if (!r.ok) return jsonResponse({ error: "Could not save", details: r.data }, 500);
    return jsonResponse({ success: true, data: r.data });
  }
  if (op === "activate") {
    if (!body.id) return jsonResponse({ error: "id required" }, 400);
    const r = await sbFetch(env, "PATCH", `/competitions?id=eq.${encodeURIComponent(body.id)}&status=eq.draft`, { status: "active" }, { "Prefer": "return=representation" });
    if (!r.ok) return jsonResponse({ error: "Could not update", details: r.data }, 500);
    if (!Array.isArray(r.data) || r.data.length === 0) return jsonResponse({ error: "Only a draft competition can be opened" }, 400);
    return jsonResponse({ success: true, data: r.data });
  }
  return jsonResponse({ error: "Unknown op" }, 400);
}
__name(handleAdminCompetition, "handleAdminCompetition");

async function handleWaCheck(url, env) {
  const key = url.searchParams.get("key") || "";
  const expected = env.WHATSAPP_VERIFY_TOKEN || "";
  if (!expected || !timingSafeEqual(key, expected)) {
    return jsonResponse({ error: "Unauthorized. Use /wa-check?key=YOUR_WHATSAPP_VERIFY_TOKEN" }, 403);
  }
  const token = env.WHATSAPP_TOKEN;
  const phoneId = cfg(env, "WHATSAPP_PHONE_ID");
  const wabaId = cfg(env, "WHATSAPP_BUSINESS_ID");
  const out = { phone_id_used: phoneId, waba_id_used: wabaId, token_present: !!token };
  if (!token) return jsonResponse(out);
  const g = async (method, path) => {
    try {
      const r = await fetch(`https://graph.facebook.com/v25.0/${path}`, { method, headers: { Authorization: `Bearer ${token}` } });
      return { ok: r.ok, status: r.status, data: await r.json().catch(() => null) };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  out.phone_number = await g("GET", `${phoneId}?fields=display_phone_number,verified_name,quality_rating,code_verification_status`);
  out.subscribed_apps = await g("GET", `${wabaId}/subscribed_apps`);
  if (out.subscribed_apps.ok && Array.isArray(out.subscribed_apps.data?.data) && out.subscribed_apps.data.data.length === 0) {
    out.subscribe_attempt = await g("POST", `${wabaId}/subscribed_apps`);
  }
  const to = url.searchParams.get("to");
  if (to) out.test_send = await sendWhatsAppTo(env, to, "Sherlock test message ✅ WhatsApp is connected.");
  return jsonResponse(out);
}
__name(handleWaCheck, "handleWaCheck");
function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
__name(hexToBytes, "hexToBytes");
function bytesToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(bytesToHex, "bytesToHex");
async function pbkdf2Hex(password, saltHex, iterations) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: hexToBytes(saltHex), iterations, hash: "SHA-256" }, key, 256);
  return bytesToHex(bits);
}
__name(pbkdf2Hex, "pbkdf2Hex");
async function hmacHex(secret, data) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
}
__name(hmacHex, "hmacHex");
function b64urlEncode(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(b64urlEncode, "b64urlEncode");
function b64urlDecode(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(s + "===".slice((s.length + 3) % 4))));
}
__name(b64urlDecode, "b64urlDecode");
async function makeSession(env, user) {
  const payload = b64urlEncode(JSON.stringify({ u: user.username, r: user.role, l: user.label, d: user.division, exp: Date.now() + 12 * 3600 * 1000 }));
  return payload + "." + await hmacHex(env.DRAW_SECRET + ":session", payload);
}
__name(makeSession, "makeSession");
async function readSession(env, request) {
  try {
    if (!env.DRAW_SECRET) return null;
    const auth = request.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = await hmacHex(env.DRAW_SECRET + ":session", payload);
    if (!timingSafeEqual(sig, expected)) return null;
    const data = JSON.parse(b64urlDecode(payload));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch (e) {
    return null;
  }
}
__name(readSession, "readSession");
async function handleLogin(body, env) {
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  if (!username || !password || !env.DRAW_SECRET) return jsonResponse({ success: false, error: "Invalid credentials. Access denied." }, 401);
  const r = await sbFetch(env, "GET", `/portal_users?username=eq.${encodeURIComponent(username)}&active=eq.true&select=username,pass_hash,salt,iterations,role,label,division,phone&limit=1`);
  const user = r.ok && Array.isArray(r.data) ? r.data[0] : null;
  const hash = await pbkdf2Hex(password, user ? user.salt : "00000000000000000000000000000000", user ? user.iterations : 100000);
  if (!user || !timingSafeEqual(hash, user.pass_hash)) {
    await new Promise((res) => setTimeout(res, 800));
    return jsonResponse({ success: false, error: "Invalid credentials. Access denied." }, 401);
  }
  return jsonResponse({ success: true, token: await makeSession(env, user), role: user.role, label: user.label, division: user.division, phone: user.phone || null });
}
__name(handleLogin, "handleLogin");

async function handlePortalSherlock(request, body, env) {
  const session = await readSession(env, request);
  if (!session || session.r !== "admin") return jsonResponse({ success: false, error: "Please log in as Architect." }, 401);
  const text = String(body.text || "").trim().slice(0, 4000);
  if (!text) return jsonResponse({ success: false, error: "Empty message" }, 400);
  const architect = architectNumbers(env)[0];
  await memorySave(env, "portal", architect, "user", text);
  const reply = await architectTurn(env, architect, text);
  await memorySave(env, "portal", architect, "assistant", reply);
  return jsonResponse({ success: true, text: reply });
}
__name(handlePortalSherlock, "handlePortalSherlock");

async function handleWaInbox(request, body, env) {
  const session = await readSession(env, request);
  if (!session || session.r !== "admin") return jsonResponse({ success: false, error: "Please log in as Architect." }, 401);
  if (body.op === "send") {
    const to = String(body.to || "").replace(/\D/g, "");
    const message = String(body.message || "").trim();
    if (!to || !message) return jsonResponse({ success: false, error: "Number and message are required" }, 400);
    const sent = await sendWhatsAppTo(env, to, message);
    if (!sent.ok) {
      const metaError = sent.data?.error?.message || sent.error || "WhatsApp refused the message";
      const hint = /24|window|re-engagement|outside/i.test(metaError) ? " (WhatsApp only allows free messages within 24 hours after the person last wrote to you.)" : "";
      return jsonResponse({ success: false, error: metaError + hint }, 400);
    }
    await memorySave(env, "whatsapp", to, "assistant", "[sent by Architect from the portal] " + message);
    return jsonResponse({ success: true });
  }
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const r = await sbFetch(env, "GET", `/sherlock_memory?channel=eq.whatsapp&created_at=gte.${encodeURIComponent(since)}&select=contact,role,content,created_at&order=created_at.desc&limit=400`);
  const rows = r.ok && Array.isArray(r.data) ? r.data : [];
  const byContact = {};
  for (const m of rows) {
    if (!byContact[m.contact]) byContact[m.contact] = { contact: m.contact, last: m.created_at, messages: [] };
    if (byContact[m.contact].messages.length < 30) byContact[m.contact].messages.push(m);
  }
  const conversations = Object.values(byContact).map((c) => ({ ...c, messages: c.messages.reverse(), is_architect: architectNumbers(env).includes(c.contact) }));
  return jsonResponse({ success: true, conversations });
}
__name(handleWaInbox, "handleWaInbox");

function xmlEsc(t) {
  return String(t).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);
}
__name(xmlEsc, "xmlEsc");
async function azureSpeak(env, text) {
  if (!env.AZURE_SPEECH_KEY) return null;
  const region = env.AZURE_SPEECH_REGION || "westeurope";
  const bg = /[а-яА-Я]/.test(text);
  const voice = bg ? "bg-BG-BorislavNeural" : "en-GB-RyanNeural";
  const lang = bg ? "bg-BG" : "en-GB";
  const clean = String(text).replace(/[*_#`>]/g, "").slice(0, 1500);
  const ssml = `<speak version="1.0" xml:lang="${lang}"><voice name="${voice}">${xmlEsc(clean)}</voice></speak>`;
  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "ogg-48khz-16bit-mono-opus",
      "User-Agent": "sherlock-worker"
    },
    body: ssml
  });
  if (!res.ok) {
    console.error("Azure TTS failed:", res.status, (await res.text()).slice(0, 200));
    return null;
  }
  return await res.arrayBuffer();
}
__name(azureSpeak, "azureSpeak");
async function sendWhatsAppVoice(env, to, text) {
  try {
    const audio = await azureSpeak(env, text);
    if (!audio) return { ok: false, error: "No audio" };
    const phoneId = cfg(env, "WHATSAPP_PHONE_ID");
    const form = new FormData();
    form.append("messaging_product", "whatsapp");
    form.append("type", "audio/ogg");
    form.append("file", new Blob([audio], { type: "audio/ogg" }), "sherlock.ogg");
    const up = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/media`, { method: "POST", headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` }, body: form });
    const upData = await up.json().catch(() => null);
    if (!up.ok || !upData?.id) {
      console.error("Voice upload failed:", up.status, JSON.stringify(upData).slice(0, 200));
      return { ok: false, error: "Upload failed" };
    }
    const res = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
      body: JSON.stringify({ messaging_product: "whatsapp", to: String(to).replace(/\D/g, ""), type: "audio", audio: { id: upData.id } })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) console.error("Voice send failed:", res.status, JSON.stringify(data).slice(0, 200));
    return { ok: res.ok, data };
  } catch (e) {
    console.error("Voice error:", e.message);
    return { ok: false, error: e.message };
  }
}
__name(sendWhatsAppVoice, "sendWhatsAppVoice");

async function anthropicCEO(env, system, messages, maxTokens = 1200) {
  if (!env.ANTHROPIC_API_KEY) return { ok: false, error: "ANTHROPIC_API_KEY not configured" };
  const call = async (msgs, withSearch) => {
    const payload = { model: "claude-sonnet-4-6", max_tokens: maxTokens, system, messages: msgs };
    if (withSearch) payload.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY.trim(), "anthropic-version": "2023-06-01" },
      body: JSON.stringify(payload)
    });
    return { res, data: await res.json().catch(() => ({})) };
  };
  try {
    let msgs = messages.slice();
    let withSearch = true;
    let { res, data } = await call(msgs, withSearch);
    if (!res.ok && withSearch) {
      console.error("Web search unavailable, answering without it:", data.error?.message);
      withSearch = false;
      ({ res, data } = await call(msgs, false));
    }
    let texts = [];
    for (let i = 0; i < 3 && res.ok; i++) {
      texts.push((data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim());
      if (data.stop_reason !== "pause_turn") break;
      msgs = msgs.concat([{ role: "assistant", content: data.content }]);
      ({ res, data } = await call(msgs, withSearch));
    }
    if (!res.ok && !texts.length) return { ok: false, error: `Anthropic ${res.status}: ${data.error?.message}` };
    return { ok: true, text: texts.filter(Boolean).join("\n\n").trim() };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(anthropicCEO, "anthropicCEO");

async function loadKnowledge(env) {
  const r = await sbFetch(env, "GET", "/sherlock_knowledge?active=eq.true&select=id,content&order=id.asc&limit=200");
  const rows = r.ok && Array.isArray(r.data) ? r.data : [];
  return rows.length ? rows.map((k) => `#${k.id}: ${k.content}`).join("\n") : "(nothing saved yet)";
}
__name(loadKnowledge, "loadKnowledge");

async function applyMemoryCommands(env, reply) {
  let out = reply;
  const saved = [];
  for (const m of [...reply.matchAll(/\[\[REMEMBER\]\]([\s\S]*?)\[\[\/REMEMBER\]\]/gi)]) {
    const content = m[1].trim().slice(0, 2000);
    if (!content) { out = out.replace(m[0], ""); continue; }
    const r = await sbFetch(env, "POST", "/sherlock_knowledge", { content, active: true }, { "Prefer": "return=representation" });
    const id = r.ok && Array.isArray(r.data) && r.data[0] ? r.data[0].id : null;
    out = out.replace(m[0], id ? `\n🧠 Запомних (№${id}): ${content}` : "⚠️ Не успях да го запомня — провери таблицата sherlock_knowledge.");
    if (id) saved.push(id);
  }
  for (const m of [...reply.matchAll(/\[\[FORGET\s*#?(\d+)\]\]/gi)]) {
    const id = Number(m[1]);
    const r = await sbFetch(env, "PATCH", `/sherlock_knowledge?id=eq.${id}`, { active: false }, { "Prefer": "return=representation" });
    const ok = r.ok && Array.isArray(r.data) && r.data.length;
    out = out.replace(m[0], ok ? `\n🗑 Забравих №${id}.` : `⚠️ Няма запис №${id}.`);
  }
  return out.trim();
}
__name(applyMemoryCommands, "applyMemoryCommands");

async function latestPendingAction(env, contact) {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const r = await sbFetch(env, "GET", `/sherlock_memory?channel=eq.action&contact=eq.${encodeURIComponent(contact)}&created_at=gte.${encodeURIComponent(since)}&select=id,content&order=created_at.desc&limit=1`);
  const row = r.ok && Array.isArray(r.data) ? r.data[0] : null;
  if (!row) return null;
  try {
    const a = JSON.parse(row.content);
    return a.status === "pending" ? { rowId: row.id, ...a } : null;
  } catch (e) {
    return null;
  }
}
__name(latestPendingAction, "latestPendingAction");

async function closeAction(env, action, status, extra = {}) {
  const { rowId, ...rest } = action;
  await sbFetch(env, "PATCH", `/sherlock_memory?id=eq.${rowId}`, { content: JSON.stringify({ ...rest, ...extra, status }) }, { "Prefer": "return=minimal" });
}
__name(closeAction, "closeAction");

function extractEmailDraft(reply) {
  const m = reply.match(/\[\[EMAIL\]\]([\s\S]*?)\[\[\/EMAIL\]\]/i);
  if (!m) return null;
  const block = m[1].trim();
  const sep = block.search(/^\s*---\s*$/m);
  const head = sep >= 0 ? block.slice(0, sep) : block;
  const body = sep >= 0 ? block.slice(sep).replace(/^\s*---\s*$/m, "").trim() : "";
  const to = (head.match(/^\s*To:\s*(.+)$/im) || [])[1]?.trim();
  const subject = (head.match(/^\s*Subject:\s*(.+)$/im) || [])[1]?.trim();
  return { full: m[0], to, subject, body };
}
__name(extractEmailDraft, "extractEmailDraft");

async function architectTurn(env, contact, text) {
  const t = String(text || "").trim();
  const isYes = /^(да|daa?|yes|y|send|прати|прати го|изпрати|изпрати го|ок|ok|давай)[\s.!]*$/i.test(t);
  const isNo = /^(не|no|cancel|откажи|отказ|спри)[\s.!]*$/i.test(t);
  if (isYes || isNo) {
    const pending = await latestPendingAction(env, contact);
    if (pending && pending.type === "email") {
      if (isNo) {
        await closeAction(env, pending, "cancelled");
        return `Добре, Architect — писмото до ${pending.to} е отказано и няма да бъде изпратено.`;
      }
      const html = escHtml(pending.body).replace(/\n/g, "<br>");
      const r = await sendEmail(env, { to: pending.to, subject: pending.subject, html });
      if (r.ok) {
        await closeAction(env, pending, "sent", { email_id: r.id });
        return `✅ Изпратено до ${pending.to}\nТема: „${pending.subject}“\nОтговорите ще идват на Sherlockandholms@gmail.com.`;
      }
      return `❌ Писмото до ${pending.to} НЕ беше изпратено: ${r.error || "грешка при изпращане"}. Кажи ми дали да опитам пак.`;
    }
  }
  let reply = await sherlockReply(env, contact, true, t, "chat");
  reply = await applyMemoryCommands(env, reply);
  const draft = extractEmailDraft(reply);
  if (draft) {
    const validTo = draft.to && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(draft.to);
    if (!validTo || !draft.subject || !draft.body) {
      reply = reply.replace(draft.full, "").trim() + "\n\n(Не успях да подготвя писмото — липсва валиден имейл адрес, тема или текст. Дай ми имейла на получателя.)";
    } else {
      const id = "email-" + Date.now();
      await memorySave(env, "action", contact, "system", JSON.stringify({ id, type: "email", status: "pending", to: draft.to, subject: draft.subject, body: draft.body, created: new Date().toISOString() }));
      reply = reply.replace(draft.full, `📧 ЧЕРНОВА\nДо: ${draft.to}\nТема: ${draft.subject}\n\n${draft.body}\n\n👉 Отговори „ДА“, за да го изпратя, или „НЕ“, за да го откажа.`).trim();
    }
  }
  return reply;
}
__name(architectTurn, "architectTurn");

function architectNumbers(env) {
  return [cfg(env, "ARCHITECT_WHATSAPP_TZ"), cfg(env, "ARCHITECT_WHATSAPP_UK")].filter(Boolean).map((n) => String(n).replace(/\D/g, ""));
}
__name(architectNumbers, "architectNumbers");

async function memorySave(env, channel, contact, role, content, waMessageId) {
  const row = { channel, contact, role, content: String(content).slice(0, 4000) };
  if (waMessageId) row.wa_message_id = waMessageId;
  return sbFetch(env, "POST", "/sherlock_memory", row, { "Prefer": "return=minimal" });
}
__name(memorySave, "memorySave");

async function memoryLoad(env, contact, hours = 24 * 30, limit = 50) {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const r = await sbFetch(env, "GET", `/sherlock_memory?contact=eq.${encodeURIComponent(contact)}&role=in.(user,assistant)&created_at=gte.${encodeURIComponent(since)}&select=role,content,channel,created_at&order=created_at.desc&limit=${limit}`);
  const rows = r.ok && Array.isArray(r.data) ? r.data.reverse() : [];
  const msgs = [];
  for (const m of rows) {
    const content = m.channel === "whatsapp" ? m.content : `[${m.channel}] ${m.content}`;
    if (msgs.length && msgs[msgs.length - 1].role === m.role) msgs[msgs.length - 1].content += "\n" + content;
    else msgs.push({ role: m.role, content });
  }
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  return msgs;
}
__name(memoryLoad, "memoryLoad");

async function liveBusinessData(env) {
  const r = await sbFetch(env, "GET", "/competitions?select=property_name,status,tickets_sold,target_amount_eur,ticket_price_eur,deadline&status=in.(draft,active,funded)&order=created_at.desc&limit=20");
  const comps = r.ok && Array.isArray(r.data) ? r.data : [];
  const lines = comps.map((c) => {
    const total = c.target_amount_eur && c.ticket_price_eur ? Math.ceil(c.target_amount_eur / c.ticket_price_eur) : "?";
    return `- ${c.property_name}: ${c.status}, ${c.tickets_sold || 0}/${total} tickets${c.deadline ? ", ends " + String(c.deadline).slice(0, 10) : ""}`;
  });
  return `Today: ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC.
Property competitions in the database:
${lines.length ? lines.join("\n") : "- none yet (agencies have been contacted; waiting for the first agreement)"}`;
}
__name(liveBusinessData, "liveBusinessData");

var CEO_PROMPT = `You are Sherlock — the AI right hand and operational CEO of Sherlock Holmes Investigations Ltd, serving the Architect (Bogdan Bogdanov, founder, based in Zanzibar, Tanzania).

HOW YOU TALK: Like a sharp, warm, human CEO on WhatsApp. Short messages (usually under 120 words), plain conversational text, no markdown, no bullet symbols, no headings, no dashes. Reply in the language he writes in — Bulgarian or English. Call him "Architect". Be direct, practical. End with one concrete next step when useful.

HONESTY: Never invent numbers, sales, actions or agency replies. Use only LIVE DATA, conversation history, and your web searches.

COMPANY — SHERLOCK HOLMES INVESTIGATIONS LTD:
Offices in London, Dubai, and USA. Contact: Sherlockandholms@gmail.com, WhatsApp +255 774 611 837.

SERVICES:
1. DETECTIVE SERVICES — Heir tracing and unclaimed estates (No Win No Fee, 60% contingency), matrimonial surveillance, missing persons, corporate due diligence, process serving, background checks, distressed asset recovery (seized supercars and real estate from Dubai and USA banks).
2. EMERGENCY LEGAL SHIELD — 24/7 legal hotline, real attorney assigned within minutes. Monthly or annual subscription. 30-day free trial activates on first SOS call. Registration on the website.
3. TELE-SITTER (Hospital Division) — Remote AI patient monitoring for hospitals. B2B, for procurement departments. Price: 80 to 150 euros per monitored bed per month.
4. GLOBAL PROPERTY COMPETITION — Luxury property prize draw. Tickets at 3.50 euros each. Target = property price times 1.40. 30-day draw. Winner gets the property or cash value. If target not reached, tickets convert to Platform Credits.
5. DISTRESSED ASSET MARKETPLACE — Bank-seized supercars and luxury real estate from Dubai and USA, available below market value.
6. FINANCIAL ACCESS — Help opening bank accounts via Wise and fintech partners.
7. DETECTIVE PORTAL — Secure internal platform for investigators and the Architect. Features: AI research, case management, letter sending, autonomous agent tasks, and full conversation memory shared with WhatsApp and the website chat.

DETECTIVE PORTAL:
Login-protected section of the website. Architect logs in as ArchitectaSherlock (admin). Inside: case pipeline, AI agent task manager (assign tasks to Sherlock who executes and reports back on WhatsApp), legal shield management, tele-sitter monitoring, competition management, and direct AI chat. Memory is shared: all conversations on WhatsApp, the website chat, and the Portal feed into the same Supabase database (sherlock_memory table), so Sherlock knows what was said everywhere.

CURRENT BUILD STATUS (October 2026):
Shared memory across all three channels is live. Autonomous task system just launched — Architect assigns tasks in Portal, Sherlock executes and reports on WhatsApp. Outbound WhatsApp reporting is active. Cloudflare Worker handles all logic. GitHub auto-deploys.

GAIASPEAK ECOSYSTEM LLC (Wyoming):
Separate DeFi project tokenizing physical gold (GSG) and silver (GSS) as ERC-20 tokens on Polygon Network. 1 token = 1 gram. Long-term mission. Federal contracting line also active under this entity.

TOOLS YOU HAVE:
1) Web search — use for current prices, news, companies, contacts, laws. Mention source briefly.
2) Emails — prepare but send ONLY after Architect replies "ДА" or "YES". Format exactly:
[[EMAIL]]
To: name@example.com
Subject: the subject
---
Full email body, signed "Mr. B. Bogdanov, Sherlock Holmes Investigations Ltd, WhatsApp: +255 774 611 837, US: +1 845 715 7412"
[[/EMAIL]]
Never say an email was sent — the system confirms after his approval.
3) Permanent memory — when he says "запомни", "remember", "from now on", or "винаги", save with:
[[REMEMBER]]the fact or rule[[/REMEMBER]]
To forget item N: [[FORGET N]]. All saved items appear under PERMANENT KNOWLEDGE with numbers — always follow them.
4) Email inbox — emails arriving at Sherlockandholms@gmail.com are forwarded marked [INCOMING EMAIL]. Summarise for him, draft replies, send only after "ДА".

You cannot make payments or contact people by phone or WhatsApp on your own.
You remember the last 30 days of conversation across WhatsApp, the website, and the Detective Portal, plus your PERMANENT KNOWLEDGE.\`;

var CLIENT_PROMPT = `You are Sherlock AI for Sherlock Holmes Investigations Ltd. Answer professionally, briefly and helpfully, in the language the person writes in. Services: investigations (heir tracing, surveillance, asset recovery, due diligence), Emergency Legal Shield (attorney access), hospital Tele-Sitter monitoring, and the Global Property Competition (€3.50 tickets; the winner gets the featured property or its cash value). Never promise prices, results or legal outcomes; offer to connect them with the team. Contact: info@gaiaspeakecosystem.com`;

function toBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
__name(toBase64, "toBase64");

async function transcribeWhatsAppAudio(env, mediaId) {
  if (!env.AI) return { ok: false, error: "Voice is not enabled (Workers AI binding \"AI\" missing)" };
  try {
    const meta = await fetch(`https://graph.facebook.com/v25.0/${mediaId}`, { headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` } }).then((r) => r.json());
    if (!meta.url) return { ok: false, error: "Could not get media URL: " + JSON.stringify(meta).slice(0, 200) };
    const audio = await fetch(meta.url, { headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` } }).then((r) => r.arrayBuffer());
    const out = await env.AI.run("@cf/openai/whisper-large-v3-turbo", { audio: toBase64(audio) });
    const text = (out && (out.text || out.transcription_info?.text) || "").trim();
    return text ? { ok: true, text } : { ok: false, error: "Empty transcription" };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(transcribeWhatsAppAudio, "transcribeWhatsAppAudio");

async function sherlockReply(env, contact, isArchitect, userText, channel) {
  const history = await memoryLoad(env, contact);
  const system = isArchitect ? `${CEO_PROMPT}\n\nPERMANENT KNOWLEDGE (saved by the Architect — always follow):\n${await loadKnowledge(env)}\n\nLIVE DATA:\n${await liveBusinessData(env)}` : CLIENT_PROMPT;
  const messages = history.concat([]);
  if (messages.length && messages[messages.length - 1].role === "user") messages[messages.length - 1].content += "\n" + userText;
  else messages.push({ role: "user", content: userText });
  const ai = isArchitect ? await anthropicCEO(env, system, messages, 1200) : await anthropicCall(env, system, messages, 400);
  return ai.ok && ai.text ? ai.text : (isArchitect ? "Architect, I could not reach my AI brain just now — try again in a minute." : "Thank you for your message. Our team will be in touch shortly.");
}
__name(sherlockReply, "sherlockReply");

async function handleWhatsAppIncoming(body, env) {
  try {
    const value = body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    if (!message) return new Response("OK", { status: 200 });
    const from = String(message.from || "").replace(/\D/g, "");
    const isArchitect = architectNumbers(env).includes(from);
    const msgType = message.type;
    console.log("WhatsApp incoming from", from, "type", msgType);

    let text = message.text?.body || "";
    let heardPrefix = "";
    if (msgType === "audio" && message.audio?.id) {
      const t = await transcribeWhatsAppAudio(env, message.audio.id);
      if (!t.ok) {
        console.error("Transcription failed:", t.error);
        await sendWhatsAppTo(env, from, isArchitect ? "Architect, I received your voice message but could not transcribe it yet. Please send it as text this time." : "Sorry, I could not process this voice message. Please send your message as text.");
        return new Response("OK", { status: 200 });
      }
      text = t.text;
      heardPrefix = `🎙️ "${text.length > 300 ? text.slice(0, 300) + "…" : text}"\n\n`;
    }
    if (!text) {
      await sendWhatsAppTo(env, from, "For now I can read text and voice messages.");
      return new Response("OK", { status: 200 });
    }

    const saved = await memorySave(env, "whatsapp", from, "user", (msgType === "audio" ? "[voice] " : "") + text, message.id);
    if (!saved.ok && saved.status === 409) return new Response("OK", { status: 200 });

    const reply = isArchitect ? await architectTurn(env, from, text) : await sherlockReply(env, from, isArchitect, text, "whatsapp");
    const sent = await sendWhatsAppTo(env, from, heardPrefix + reply);
    if (isArchitect && msgType === "audio" && env.AZURE_SPEECH_KEY) await sendWhatsAppVoice(env, from, reply);
    console.log("WhatsApp reply result", JSON.stringify(sent).slice(0, 300));
    await memorySave(env, "whatsapp", from, "assistant", reply);

    if (!isArchitect) {
      await sendWhatsApp(env, `📱 WhatsApp от ${from}:\n"${text.slice(0, 300)}"\n\n🤖 Sherlock отговори:\n${reply.slice(0, 300)}`);
    }
    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("WhatsApp handler error:", e);
    return new Response("OK", { status: 200 });
  }
}
__name(handleWhatsAppIncoming, "handleWhatsAppIncoming");

async function maybeSendBriefing(env) {
  const now = new Date();
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Sofia", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(now).map((p) => [p.type, p.value]));
  const hour = Number(parts.hour);
  if (hour !== 8 && hour !== 20) return;
  const key = `briefing ${parts.year}-${parts.month}-${parts.day} ${parts.hour}`;
  const seen = await sbFetch(env, "GET", `/sherlock_memory?channel=eq.system&content=eq.${encodeURIComponent(key)}&select=id&limit=1`);
  if (seen.ok && Array.isArray(seen.data) && seen.data.length) return;
  await memorySave(env, "system", "briefing", "system", key);
  const architect = architectNumbers(env)[0];
  const text = await sherlockReply(env, architect, true,
    hour === 8 ? "[automatic morning briefing] Give me a short morning briefing: what matters today, based only on the live data and our recent conversation, and the one priority for today."
               : "[automatic evening briefing] Give me a short evening wrap-up: what moved today, what is open, and the first thing for tomorrow.", "system");
  const sent = await sendWhatsAppTo(env, architect, (hour === 8 ? "☀️ " : "🌙 ") + text);
  if (sent.ok) await memorySave(env, "whatsapp", architect, "assistant", text);
  else console.error("Briefing not delivered (24h window closed?)", JSON.stringify(sent.data || sent.error).slice(0, 300));
}
__name(maybeSendBriefing, "maybeSendBriefing");
async function handleInboundEmail(body, env) {
  try {
    if (!env.INBOX_SECRET || !body.key || !timingSafeEqual(String(body.key), env.INBOX_SECRET)) {
      return jsonResponse({ error: "Unauthorized" }, 403);
    }
    const id = String(body.id || "").slice(0, 100);
    if (!id) return jsonResponse({ error: "id required" }, 400);
    const architect = architectNumbers(env)[0];
    const from = String(body.from || "").slice(0, 300);
    const subject = String(body.subject || "(no subject)").slice(0, 300);
    const text = String(body.text || "").replace(/\n{3,}/g, "\n\n").slice(0, 4000);
    const note = `[INCOMING EMAIL to Sherlockandholms@gmail.com — written by someone else, not by the Architect]
From: ${from}
Date: ${String(body.date || "").slice(0, 40)}
Subject: ${subject}

${text}

[Instructions for you: if this is spam, a newsletter, an advert or an automatic notification, answer with exactly the word SKIP. Otherwise tell the Architect in 2-4 short lines who wrote, what they want (yes / no / question) and the next step. If it is a reply from an agency or a business contact that needs an answer, also prepare a reply draft with the [[EMAIL]] block, To: their email address, Subject: Re: ${subject}.]`;
    const saved = await memorySave(env, "email", architect, "user", note, "gmail-" + id);
    if (!saved.ok && saved.status === 409) return jsonResponse({ success: true, duplicate: true });
    let reply = await architectTurn(env, architect, note);
    if (/^\s*SKIP\b/i.test(reply)) {
      await memorySave(env, "email", architect, "assistant", "(ignored email from " + from + ": " + subject + ")");
      return jsonResponse({ success: true, skipped: true });
    }
    const msg = "📧 НОВ ИМЕЙЛ\nОт: " + from + "\nТема: " + subject + "\n\n" + reply;
    const sent = await sendWhatsAppTo(env, architect, msg);
    await memorySave(env, "whatsapp", architect, "assistant", msg);
    return jsonResponse({ success: true, whatsapp: !!sent.ok });
  } catch (e) {
    console.error("Inbound email error:", e);
    return jsonResponse({ error: e.message }, 500);
  }
}
__name(handleInboundEmail, "handleInboundEmail");
async function handleSupabaseWebhook(body, env) {
  try {
    const record = body.record || body;
    const table = body.table || "unknown";
    const eventType = body.type || "INSERT";
    if (table === "investigation_cases" && eventType === "INSERT") {
      const info = `${record.target_name} | ${record.branch} | €${record.market_value || 0}`;
      await sendWhatsApp(env, `\u{1F4CB} NEW CASE
${info}`);
      if (env.ANTHROPIC_API_KEY) {
        const ai = await anthropicCall(
          env,
          "Classify this investigation case in one line. Give Sherlock Score 0-100 for success probability.",
          [{ role: "user", content: `Case: ${info}
Log: ${(record.full_investigation_log || "").slice(0, 300)}` }],
          200
        );
        if (ai.ok) await sendWhatsApp(env, `\u{1F3AF} Case Score: ${ai.text}`);
      }
    }
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}
__name(handleSupabaseWebhook, "handleSupabaseWebhook");
async function anthropicCall(env, system, messages, maxTokens = 1e3) {
  if (!env.ANTHROPIC_API_KEY) return { ok: false, error: "ANTHROPIC_API_KEY not configured" };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY.trim(),
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTokens, system, messages })
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: `Anthropic ${res.status}: ${data.error?.message}` };
    return { ok: true, text: data.content?.[0]?.text || "" };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(anthropicCall, "anthropicCall");
async function supabaseRequest(env, method, path, body, extraHeaders = {}) {
  if (!cfg(env, "SUPABASE_URL") || !env.SUPABASE_KEY) return { ok: false, data: null, error: "Supabase not configured" };
  try {
    const res = await fetch(`${cfg(env, "SUPABASE_URL")}/rest/v1${path}`, {
      method,
      headers: {
        "apikey": env.SUPABASE_KEY,
        "Authorization": `Bearer ${env.SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
        ...extraHeaders
      },
      body: body ? JSON.stringify(body) : void 0
    });
    const data = method === "GET" ? await res.json().catch(() => null) : null;
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, error: e.message, data: null };
  }
}
__name(supabaseRequest, "supabaseRequest");
async function sendEmail(env, { to, subject, html, protocol }) {
  if (!env.RESEND_API_KEY) return { ok: false, error: "RESEND_API_KEY not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Sherlock Holmes Investigations <info@gaiaspeakecosystem.com>",
        reply_to: env.REPLY_TO_EMAIL || "Sherlockandholms@gmail.com",
        to: [to],
        subject,
        html
      })
    });
    const data = await res.json();
    return { ok: res.ok, id: data.id, error: data.message };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
__name(sendEmail, "sendEmail");
async function sendWhatsApp(env, message) {
  const architectNumber = cfg(env, "ARCHITECT_WHATSAPP_TZ") || "255774611837";
  return sendWhatsAppTo(env, architectNumber, message);
}
__name(sendWhatsApp, "sendWhatsApp");
async function sendWhatsAppTo(env, to, message) {
  if (!env.WHATSAPP_TOKEN) return { ok: false, error: "WHATSAPP_TOKEN missing" };
  const phoneNumberId = cfg(env, "WHATSAPP_PHONE_ID");
  try {
    const res = await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.WHATSAPP_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: String(to).replace(/[^0-9]/g, ""),
        type: "text",
        text: { body: String(message).slice(0, 4096) }
      })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) console.error("WhatsApp send FAILED to", to, res.status, JSON.stringify(data));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    console.error("WhatsApp send error:", e.message);
    return { ok: false, error: e.message };
  }
}
__name(sendWhatsAppTo, "sendWhatsAppTo");
async function sendTelegram(env, message) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: message.slice(0, 4e3) })
    });
  } catch (e) {
  }
}
__name(sendTelegram, "sendTelegram");
function detectProtocol(text) {
  const t = text.toLowerCase();
  if (t.includes("hospital") || t.includes("patient") || t.includes("bed") || t.includes("clinic") || t.includes("nurse")) return "tele_sitter";
  if (t.includes("lawyer") || t.includes("attorney") || t.includes("legal") || t.includes("law firm") || t.includes("counsel")) return "legal_shield";
  if (t.includes("investigation") || t.includes("due diligence") || t.includes("background") || t.includes("asset")) return "corporate";
  return null;
}
__name(detectProtocol, "detectProtocol");
function detectProtocolFromEmail(subject, body) {
  const text = ((subject || "") + " " + (body || "")).toLowerCase();
  return detectProtocol(text);
}
__name(detectProtocolFromEmail, "detectProtocolFromEmail");
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" }
  });
}
__name(jsonResponse, "jsonResponse");

// ═══════════════════════════════════════════════════════════════
// HOSPITAL LOGIN — болницата влиза с email + парола
// ═══════════════════════════════════════════════════════════════
async function handleHospitalLogin(body, env) {
  const { email, password } = body;
  if (!email || !password) return jsonResponse({ error: "Email and password required" }, 400);
  const supaKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
  const res = await fetch(
    `${cfg(env, "SUPABASE_URL")}/rest/v1/hospitals?email=eq.${encodeURIComponent(email)}&select=id,name,email,password_hash,beds_licensed,status&limit=1`,
    { headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` } }
  );
  const data = await res.json();
  if (!data || data.length === 0) {
    await new Promise(r => setTimeout(r, 800));
    return jsonResponse({ error: "Invalid email or password" }, 401);
  }
  const hospital = data[0];
  if (hospital.status !== 'active') return jsonResponse({ error: "Account suspended. Contact support." }, 403);
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hashHex = [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (hashHex !== hospital.password_hash) {
    await new Promise(r => setTimeout(r, 800));
    return jsonResponse({ error: "Invalid email or password" }, 401);
  }
  return jsonResponse({
    success: true,
    hospital_id: hospital.id,
    hospital_name: hospital.name,
    beds: hospital.beds_licensed
  });
}
__name(handleHospitalLogin, "handleHospitalLogin");

// ═══════════════════════════════════════════════════════════════
// HOSPITAL REGISTER — само Архитектът добавя болници (с DRAW_SECRET)
// ═══════════════════════════════════════════════════════════════
async function handleHospitalRegister(body, env) {
  const { admin_secret, name, email, password, beds } = body;
  if (!env.DRAW_SECRET || !timingSafeEqual(String(admin_secret || ""), env.DRAW_SECRET)) {
    return jsonResponse({ error: "Unauthorized" }, 403);
  }
  if (!name || !email || !password) return jsonResponse({ error: "name, email and password required" }, 400);
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const password_hash = [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  const supaKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
  const res = await fetch(`${cfg(env, "SUPABASE_URL")}/rest/v1/hospitals`, {
    method: "POST",
    headers: {
      "apikey": supaKey,
      "Authorization": `Bearer ${supaKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ name, email, password_hash, beds_licensed: parseInt(beds) || 10 })
  });
  const result = await res.json();
  if (!res.ok) return jsonResponse({ error: "Could not create hospital", details: result }, 500);
  return jsonResponse({ success: true, hospital_id: result[0]?.id, name });
}
__name(handleHospitalRegister, "handleHospitalRegister");

// ═══════════════════════════════════════════════════════════════
// TELE ROOMS — четене и запис на стаи (само за тази болница)
// ═══════════════════════════════════════════════════════════════
async function handleTeleRooms(request, body, env) {
  const hospitalId = body.hospital_id || request.headers.get("x-hospital-id");
  if (!hospitalId) return jsonResponse({ error: "hospital_id required" }, 400);
  const supaKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
  const baseUrl = cfg(env, "SUPABASE_URL");
  if (request.method === "GET" || body.op === "get") {
    const res = await fetch(`${baseUrl}/rest/v1/tele_rooms?hospital_id=eq.${encodeURIComponent(hospitalId)}&select=*&order=num.asc`, {
      headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` }
    });
    const data = await res.json();
    return jsonResponse({ success: res.ok, rooms: data });
  }
  if (body.op === "upsert" && body.room) {
    const row = { ...body.room, hospital_id: hospitalId, updated_at: new Date().toISOString() };
    const res = await fetch(`${baseUrl}/rest/v1/tele_rooms`, {
      method: "POST",
      headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(row)
    });
    const data = await res.json();
    return jsonResponse({ success: res.ok, room: Array.isArray(data) ? data[0] : data });
  }
  if (body.op === "delete" && body.num) {
    const res = await fetch(`${baseUrl}/rest/v1/tele_rooms?hospital_id=eq.${encodeURIComponent(hospitalId)}&num=eq.${body.num}`, {
      method: "DELETE",
      headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Prefer": "return=minimal" }
    });
    return jsonResponse({ success: res.ok });
  }
  return jsonResponse({ error: "Unknown op" }, 400);
}
__name(handleTeleRooms, "handleTeleRooms");

// ═══════════════════════════════════════════════════════════════
// TELE EVENTS LOG — запис и четене на събития
// ═══════════════════════════════════════════════════════════════
async function handleTeleEventsLog(request, body, env) {
  const hospitalId = body.hospital_id;
  if (!hospitalId) return jsonResponse({ error: "hospital_id required" }, 400);
  const supaKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
  const baseUrl = cfg(env, "SUPABASE_URL");
  if (body.op === "get") {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const res = await fetch(`${baseUrl}/rest/v1/tele_events?hospital_id=eq.${encodeURIComponent(hospitalId)}&created_at=gte.${encodeURIComponent(since)}&select=*&order=created_at.desc&limit=100`, {
      headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` }
    });
    const data = await res.json();
    return jsonResponse({ success: res.ok, events: data });
  }
  if (body.op === "add" && body.event) {
    const row = { ...body.event, hospital_id: hospitalId };
    const res = await fetch(`${baseUrl}/rest/v1/tele_events`, {
      method: "POST",
      headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify(row)
    });
    if (body.event.event_type === 'critical') {
      await sendWhatsApp(env, `🏥 TELE-SITTER КРИТИЧНО\nРайон: ${body.event.room_num}\nПациент: ${body.event.patient}\n${body.event.description}`);
    }
    return jsonResponse({ success: res.ok });
  }
  return jsonResponse({ error: "Unknown op" }, 400);
}
__name(handleTeleEventsLog, "handleTeleEventsLog");

// ═══════════════════════════════════════════════════════════
// LEGAL SHIELD — Stripe helpers
// ═══════════════════════════════════════════════════════════
const LEGAL_PRICE_MONTHLY = "price_1USjkYIYJwgWvOC5bBQfWZan";
const LEGAL_PRICE_ANNUAL  = "price_1USjp9IYJwgWvOC5W81dg8fP";

async function stripePost(env, path, params) {
  const stripeKey = env.STRIPE_LEGAL_KEY || env.STRIPE_SECRET_KEY;
  if (!stripeKey) return { ok: false, error: "Stripe key not configured" };
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString()
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

async function stripeGet(env, path) {
  const stripeKey = env.STRIPE_LEGAL_KEY || env.STRIPE_SECRET_KEY;
  if (!stripeKey) return { ok: false, error: "Stripe key not configured" };
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { "Authorization": `Bearer ${stripeKey}` }
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// ═══════════════════════════════════════════════════════════
// LEGAL SHIELD — РЕГИСТРАЦИЯ
// ═══════════════════════════════════════════════════════════
async function handleLegalShieldRegister(body, env) {
  const { type, name, email, phone, region, license, plan, stripe_payment_method } = body;
  if (!type || !name || !email) return jsonResponse({ error: "Name and email required" }, 400);
  if (!['client','attorney'].includes(type)) return jsonResponse({ error: "Invalid type" }, 400);
  const supaKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
  const supaUrl = cfg(env, "SUPABASE_URL");

  // Проверка дали вече съществува
  const checkRes = await fetch(
    `${supaUrl}/rest/v1/legal_shield_members?email=eq.${encodeURIComponent(email)}&select=id,status&limit=1`,
    { headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` } }
  );
  const existing = await checkRes.json();
  if (existing && existing.length > 0) {
    return jsonResponse({ error: "Email already registered. Contact support to manage your subscription." }, 409);
  }

  const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const trialEndUnix = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
  const priceId = plan === 'annual' ? LEGAL_PRICE_ANNUAL : LEGAL_PRICE_MONTHLY;

  // Създай Stripe Customer
  let stripeCustomerId = '';
  let stripeSubId = '';
  const customerRes = await stripePost(env, "/customers", { email, name, phone: phone || '' });
  if (customerRes.ok) {
    stripeCustomerId = customerRes.data.id;
    // Прикачи картата ако е подадена
    if (stripe_payment_method && stripeCustomerId) {
      await stripePost(env, `/customers/${stripeCustomerId}`, { invoice_settings: { default_payment_method: stripe_payment_method } });
      await stripePost(env, `/payment_methods/${stripe_payment_method}/attach`, { customer: stripeCustomerId });
    }
    // Създай Subscription с 30-дневен trial
    const subParams = {
      customer: stripeCustomerId,
      "items[0][price]": priceId,
      trial_end: String(trialEndUnix),
      "metadata[member_type]": type,
      "metadata[source]": "legal_shield"
    };
    if (stripe_payment_method) subParams.default_payment_method = stripe_payment_method;
    const subRes = await stripePost(env, "/subscriptions", subParams);
    if (subRes.ok) stripeSubId = subRes.data.id;
  }

  // Запиши в Supabase
  const insertBody = {
    type, name, email,
    phone: phone || '',
    region: region || '',
    license: license || '',
    plan: plan || 'monthly',
    trial_ends_at: trialEnd,
    status: 'trial',
    available: type === 'attorney',
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubId
  };
  const insertRes = await fetch(`${supaUrl}/rest/v1/legal_shield_members`, {
    method: 'POST',
    headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Content-Type": "application/json", "Prefer": "return=representation" },
    body: JSON.stringify(insertBody)
  });
  const inserted = await insertRes.json();
  if (!inserted || inserted.length === 0) return jsonResponse({ error: "Registration failed" }, 500);
  const member = inserted[0];

  // Ако е адвокат — добави в опашката
  if (type === 'attorney' && region) {
    const regions = region.split(',').map(r => r.trim()).filter(Boolean);
    for (const r of regions) {
      const posRes = await fetch(
        `${supaUrl}/rest/v1/attorney_queue?region=eq.${encodeURIComponent(r)}&select=position&order=position.desc&limit=1`,
        { headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` } }
      );
      const posData = await posRes.json();
      const nextPos = posData && posData.length > 0 ? posData[0].position + 1 : 1;
      await fetch(`${supaUrl}/rest/v1/attorney_queue`, {
        method: 'POST',
        headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ attorney_id: member.id, region: r, position: nextPos })
      });
    }
  }

  try {
    await sendWhatsApp(env, `🆕 Legal Shield ${type.toUpperCase()} registered!\nName: ${name}\nEmail: ${email}\nPlan: ${plan || 'monthly'}\nRegion: ${region || 'N/A'}\nTrial ends: ${trialEnd.split('T')[0]}\nStripe: ${stripeCustomerId || 'N/A'}`);
  } catch(e) {}
  return jsonResponse({ success: true, member_id: member.id, trial_ends: trialEnd, stripe_customer_id: stripeCustomerId });
}
__name(handleLegalShieldRegister, "handleLegalShieldRegister");

// ═══════════════════════════════════════════════════════════
// LEGAL SHIELD — SOS ОПАШКА + STRIPE BILLING TRIGGER
// ═══════════════════════════════════════════════════════════
async function handleLegalShieldSOS(body, env) {
  const { region, ai_summary, client_id } = body;
  const supaKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
  const supaUrl = cfg(env, "SUPABASE_URL");

  // Провери дали клиентът е регистриран и в trial
  let clientMember = null;
  if (client_id) {
    const cRes = await fetch(
      `${supaUrl}/rest/v1/legal_shield_members?id=eq.${encodeURIComponent(client_id)}&select=id,status,stripe_subscription_id,plan&limit=1`,
      { headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` } }
    );
    const cData = await cRes.json();
    if (cData && cData.length > 0) clientMember = cData[0];
    // Блокирай ако е cancelled/expired
    if (clientMember && clientMember.status === 'cancelled') {
      return jsonResponse({ error: "Your subscription has expired. Please renew to use this service.", expired: true }, 403);
    }
  }

  // Намери следващия наличен адвокат в региона
  const qRes = await fetch(
    `${supaUrl}/rest/v1/attorney_queue?region=eq.${encodeURIComponent(region || 'global')}&order=position.asc&select=attorney_id,position`,
    { headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` } }
  );
  const queue = await qRes.json();
  let attorney = null;
  for (const q of (queue || [])) {
    const aRes = await fetch(
      `${supaUrl}/rest/v1/legal_shield_members?id=eq.${q.attorney_id}&available=eq.true&status=in.(trial,active)&select=id,name,phone,rating&limit=1`,
      { headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` } }
    );
    const aData = await aRes.json();
    if (aData && aData.length > 0) { attorney = aData[0]; break; }
  }
  // Ако няма в региона — търси в global pool
  if (!attorney) {
    const gRes = await fetch(
      `${supaUrl}/rest/v1/legal_shield_members?type=eq.attorney&available=eq.true&status=in.(trial,active)&order=rating.desc&select=id,name,phone,rating&limit=1`,
      { headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` } }
    );
    const gData = await gRes.json();
    if (gData && gData.length > 0) attorney = gData[0];
  }
  if (!attorney) return jsonResponse({ error: "No attorneys available right now. Please try again in a few minutes." }, 503);

  // ══ STRIPE: Ако клиентът е в trial → приключи trial веднага и таксувай ══
  if (clientMember && clientMember.status === 'trial' && clientMember.stripe_subscription_id) {
    try {
      // trial_end = now → Stripe таксува веднага
      await stripePost(env, `/subscriptions/${clientMember.stripe_subscription_id}`, { trial_end: "now" });
      // Обнови статуса в Supabase на 'active'
      await fetch(`${supaUrl}/rest/v1/legal_shield_members?id=eq.${encodeURIComponent(client_id)}`, {
        method: 'PATCH',
        headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
        body: JSON.stringify({ status: 'active' })
      });
      await sendWhatsApp(env, `💳 Legal Shield BILLING TRIGGERED\nClient: ${client_id}\nPlan: ${clientMember.plan}\nTrial ended → charged immediately`);
    } catch(e) {
      console.error("Stripe trial end error:", e.message);
    }
  }

  // Запиши SOS заявката
  await fetch(`${supaUrl}/rest/v1/legal_sos_requests`, {
    method: 'POST',
    headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: client_id || null,
      attorney_id: attorney.id,
      region: region || 'global',
      ai_summary: ai_summary || '',
      status: 'connected',
      attorney_notified_at: new Date().toISOString(),
      connected_at: new Date().toISOString()
    })
  });

  // Нотифицирай адвоката по WhatsApp
  try {
    const msg = `🚨 LEGAL SHIELD SOS\n\nНов клиент се нуждае от правна помощ!\n\nРегион: ${region || 'N/A'}\nРезюме: ${ai_summary || 'Спешна правна помощ'}\n\nВлез в платформата ВЕДНАГА: https://akashaasgi-afk.github.io/SherlockHolmes/\n\n⚡ Дигни в рамките на 2 минути!`;
    if (attorney.phone) await sendWhatsAppTo(env, attorney.phone.replace(/\D/g,''), msg);
  } catch(e) {}

  return jsonResponse({ success: true, attorney_name: attorney.name, attorney_id: attorney.id });
}
__name(handleLegalShieldSOS, "handleLegalShieldSOS");

// ═══════════════════════════════════════════════════════════
// LEGAL SHIELD — STRIPE WEBHOOK (subscription events)
// ═══════════════════════════════════════════════════════════
async function handleLegalStripeWebhook(request, env) {
  const raw = await request.text();
  const sig = request.headers.get("stripe-signature") || "";
  const secret = env.STRIPE_LEGAL_WEBHOOK_SECRET || env.STRIPE_WEBHOOK_SECRET;
  if (secret) {
    const valid = await verifyStripeSignature(raw, sig, secret);
    if (!valid) return jsonResponse({ error: "Invalid signature" }, 400);
  }
  let event;
  try { event = JSON.parse(raw); } catch(e) { return jsonResponse({ error: "Invalid JSON" }, 400); }

  const supaKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
  const supaUrl = cfg(env, "SUPABASE_URL");
  const obj = event.data?.object;

  // Плащането е успешно → активен
  if (event.type === "invoice.payment_succeeded" && obj?.subscription) {
    await fetch(`${supaUrl}/rest/v1/legal_shield_members?stripe_subscription_id=eq.${encodeURIComponent(obj.subscription)}`, {
      method: 'PATCH',
      headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ status: 'active' })
    });
  }

  // Плащането е провалено → cancelled + WhatsApp предупреждение
  if (event.type === "invoice.payment_failed" && obj?.subscription) {
    await fetch(`${supaUrl}/rest/v1/legal_shield_members?stripe_subscription_id=eq.${encodeURIComponent(obj.subscription)}`, {
      method: 'PATCH',
      headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ status: 'cancelled' })
    });
    // Намери члена и го предупреди
    const mRes = await fetch(
      `${supaUrl}/rest/v1/legal_shield_members?stripe_subscription_id=eq.${encodeURIComponent(obj.subscription)}&select=name,phone,email&limit=1`,
      { headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` } }
    );
    const mData = await mRes.json();
    const member = mData && mData[0];
    if (member) {
      await sendWhatsApp(env, `⚠️ Legal Shield PAYMENT FAILED\nMember: ${member.name} (${member.email})\nStatus → cancelled\nNeeds renewal to access SOS.`);
    }
  }

  // Абонаментът е изтрит/отменен
  if (event.type === "customer.subscription.deleted" && obj?.id) {
    await fetch(`${supaUrl}/rest/v1/legal_shield_members?stripe_subscription_id=eq.${encodeURIComponent(obj.id)}`, {
      method: 'PATCH',
      headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ status: 'cancelled' })
    });
  }

  return jsonResponse({ received: true });
}
__name(handleLegalStripeWebhook, "handleLegalStripeWebhook");

export {
  cloudflare_worker_default as default
};