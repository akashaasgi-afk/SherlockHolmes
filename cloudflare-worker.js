// ═══════════════════════════════════════════════════════════════
// SHERLOCK HOLMES INVESTIGATIONS — MASTER CLOUDFLARE WORKER v4.1
// URL: https://sherlockholmes.akashaasgi.workers.dev
// Integrations: Anthropic · Supabase · Resend · WhatsApp · Telegram
//
// CLOUDFLARE SECRETS (encrypted — never visible after saving):
//   ANTHROPIC_API_KEY      → sk-ant-... (Anthropic Console)
//   SUPABASE_KEY           → eyJhbGci... service_role (Supabase Legacy tab)
//   RESEND_API_KEY         → re_ZfsP1XPM_... (Resend Dashboard)
//   WHATSAPP_TOKEN         → Meta access token (Meta Developer Portal)
//   WHATSAPP_VERIFY_TOKEN  → SHERLOCK_VERIFY_TOKEN
//   TELEGRAM_BOT_TOKEN     → from @BotFather (optional)
//   HOSPITAL_API_KEY       → future hospital system key
//
// CLOUDFLARE PLAIN TEXT (visible, not sensitive):
//   SUPABASE_URL           → https://jauhmkxnaoikhfbpmnao.supabase.co
//   WHATSAPP_PHONE_ID      → 127572882298955 (US Meta number — sends to clients)
//   WHATSAPP_PHONE_ID_UK   → 1313998415132672 (UK +44 number — clients write here)
//   WHATSAPP_BUSINESS_ID   → 1520161833441818 (WhatsApp Business Account ID)
//   ARCHITECT_WHATSAPP_TZ  → 255774611837 (personal TZ — agent notifications)
//   ARCHITECT_WHATSAPP_UK  → 447576061900 (UK business)
//   TELEGRAM_CHAT_ID       → your Telegram chat ID (optional)
//   HOSPITAL_API_ENDPOINT  → future hospital system URL
//
// WHATSAPP NUMBER ROLES:
//   +1 (213) 515-5418  → Meta API sender (outbound to clients)
//   +44 7576 061900    → UK business (clients write here → AI replies)
//   +255 774 611 837   → Personal TZ (agent notifies you here)
// ═══════════════════════════════════════════════════════════════

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ═══ HARDCODED FALLBACKS — never break if env vars missing ═══
const DEFAULTS = {
  SUPABASE_URL:          "https://jauhmkxnaoikhfbpmnao.supabase.co",
  WHATSAPP_PHONE_ID:     "127572882298955",
  WHATSAPP_PHONE_ID_UK:  "1313998415132672",
  WHATSAPP_BUSINESS_ID:  "1520161833441818",
  ARCHITECT_WHATSAPP_TZ: "255774611837",
  ARCHITECT_WHATSAPP_UK: "447576061900"
};
function cfg(env, key) { return env[key] || DEFAULTS[key] || ""; }

// ═══ COMMUNICATION PROTOCOLS ═══
const PROTOCOLS = {
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

// ═══ MAIN HANDLER ═══
export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    // ── WHATSAPP WEBHOOK VERIFICATION (GET) ───────────────────
    if (request.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token === (env.WHATSAPP_VERIFY_TOKEN || "SHERLOCK_VERIFY_TOKEN")) {
        // Meta requires plain text response — no JSON, no headers
        return new Response(challenge, {
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      }

      // Health check (no hub params) — never calls Anthropic
      return new Response(JSON.stringify({
        status: "Sherlock Holmes Worker v4.1 — Online ✅",
        time: new Date().toISOString(),
        secrets: {
          anthropic: !!env.ANTHROPIC_API_KEY,
          supabase_url: !!cfg(env,"SUPABASE_URL"),
          supabase_key: !!env.SUPABASE_KEY,
          resend: !!env.RESEND_API_KEY,
          whatsapp_token: !!env.WHATSAPP_TOKEN,
          telegram: !!env.TELEGRAM_BOT_TOKEN
        },
        note: "All secrets showing true = fully configured. POST to test AI."
      }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // ── ALL POST ROUTES ───────────────────────────────────────
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    let body;
    try { body = await request.json(); }
    catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON: " + e.message }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    // ── WHATSAPP INCOMING MESSAGE (POST /webhook) ─────────────
    if (url.pathname === "/webhook") {
      return handleWhatsAppIncoming(body, env);
    }

    // ── SUPABASE DB WEBHOOK (POST /supabase-webhook) ──────────
    if (url.pathname === "/supabase-webhook") {
      return handleSupabaseWebhook(body, env);
    }

    // ── GMAIL INBOUND (POST /email-incoming) ──────────────────
    if (url.pathname === "/email-incoming") {
      return handleInboundEmail(body, env);
    }

    // ── MAIN ACTION ROUTER ────────────────────────────────────
    const action = body.action || "chat";

    try {
      switch (action) {

        // ── AI CHAT ──────────────────────────────────────────
        case "chat": {
          if (!env.ANTHROPIC_API_KEY) {
            return jsonResponse({ success: false, error: "ANTHROPIC_API_KEY not set in Cloudflare Secrets" }, 500);
          }
          const messages = body.messages || [];
          const system = body.system || "You are Sherlock AI, senior investigator at Sherlock Holmes Investigations Ltd.";
          const res = await anthropicCall(env, system, messages, body.max_tokens || 1000);
          if (!res.ok) return jsonResponse({ success: false, error: res.error }, 500);
          return jsonResponse({ success: true, text: res.text });
        }

        // ── SUPABASE READ ─────────────────────────────────────
        case "db_read": {
          const result = await supabaseRequest(env, "GET",
            `/${body.table || "investigation_cases"}?select=*&limit=${body.limit || 30}&order=created_at.desc${body.filter ? "&" + body.filter : ""}`
          );
          return jsonResponse({ success: result.ok, data: result.data });
        }

        // ── SUPABASE WRITE ────────────────────────────────────
        case "db_write": {
          const result = await supabaseRequest(env, "POST",
            `/${body.table || "investigation_cases"}`,
            body.record,
            body.upsert ? { "Prefer": "resolution=merge-duplicates" } : {}
          );
          return jsonResponse({ success: result.ok, status: result.status });
        }

        // ── SEND EMAIL ────────────────────────────────────────
        case "send_email": {
          const result = await sendEmail(env, {
            to: body.to,
            subject: body.subject,
            html: body.html || body.body,
            protocol: body.protocol
          });
          return jsonResponse({ success: result.ok, id: result.id, error: result.error });
        }

        // ── GENERATE & SEND B2B OUTREACH ──────────────────────
        case "b2b_outreach": {
          const protocol = PROTOCOLS[body.protocol];
          if (!protocol) return jsonResponse({ success: false, error: "Unknown protocol: " + body.protocol });

          // Generate email with AI
          const prompt = `Write a B2B outreach email to ${body.company_name}, attention ${body.contact_name || "the decision maker"}.
Company type: ${body.company_type || protocol.name}
Our service: ${protocol.name}
Pricing: ${protocol.pricing}
Key value prop for them: ${body.value_prop || "efficiency, safety, compliance"}
Language: ${body.language || "English"}
Keep it under 250 words. Professional subject line first, then email body. No placeholders.`;

          const ai = await anthropicCall(env, protocol.system_prompt, [{ role: "user", content: prompt }], 600);
          if (!ai.ok) return jsonResponse({ success: false, error: ai.error });

          // Parse subject + body from AI response
          const lines = ai.text.split('\n');
          const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:'));
          const subject = subjectLine ? subjectLine.replace(/^subject:\s*/i, '').trim() : `Partnership Opportunity — ${protocol.name}`;
          const emailBody = lines.filter(l => !l.toLowerCase().startsWith('subject:')).join('\n').trim();

          // Send email
          const sent = await sendEmail(env, {
            to: body.to,
            subject,
            html: emailBody.replace(/\n/g, '<br>'),
            protocol: body.protocol
          });

          // Log to Supabase
          await supabaseRequest(env, "POST", "/autonomous_systems", {
            system_name: `EMAIL-${body.protocol?.toUpperCase()}-${body.company_name}`,
            status: sent.ok ? "sent" : "failed",
            last_action: `B2B outreach to ${body.to} | Subject: ${subject} | ${new Date().toISOString()}`
          });

          // WhatsApp notification to Architect
          await sendWhatsApp(env,
            `📧 B2B Email Sent\nTo: ${body.to}\nCompany: ${body.company_name}\nProtocol: ${protocol.name}\nSubject: ${subject}\nStatus: ${sent.ok ? "✅ Delivered" : "❌ Failed"}`
          );

          return jsonResponse({ success: sent.ok, subject, preview: emailBody.slice(0, 200), email_id: sent.id });
        }

        // ── CONTACT ENQUIRY (from website) ───────────────────
        case "contact": {
          const { name, email, type, description } = body;
          await supabaseRequest(env, "POST", "/investigation_cases", {
            branch: type?.includes("Dubai") ? "Dubai" : type?.includes("USA") ? "USA" : "UK",
            source_channel: "website_contact",
            target_name: name,
            asset_identifier: "ENQ-" + Date.now(),
            market_value: 0, outstanding_debt: 0,
            full_investigation_log: `${name} (${email}): ${type} — ${description}`
          });
          await sendTelegram(env, `📩 NEW WEBSITE ENQUIRY\nName: ${name}\nEmail: ${email}\nType: ${type}\n${description?.slice(0,200)}`);
          await sendWhatsApp(env, `📩 New enquiry from ${name}\nEmail: ${email}\nService: ${type}`);
          return jsonResponse({ success: true });
        }

        // ── SOS LEGAL EMERGENCY ───────────────────────────────
        case "sos_emergency": {
          const { case_brief, anonymous, location } = body;
          await supabaseRequest(env, "POST", "/investigation_cases", {
            branch: "UK", source_channel: "legal_shield_sos",
            target_name: anonymous ? "ANONYMOUS" : "Legal Shield Client",
            asset_identifier: "SOS-" + Date.now(),
            market_value: 0, outstanding_debt: 0,
            full_investigation_log: `SOS\nLocation: ${location}\nAnonymous: ${anonymous}\nBrief: ${case_brief}\nTime: ${new Date().toISOString()}`
          });
          await sendWhatsApp(env, `🚨 SOS LEGAL EMERGENCY\n${anonymous ? "👤 ANONYMOUS" : "Client"}\n📍 ${location}\n📋 ${case_brief?.slice(0,300)}`);
          return jsonResponse({ success: true });
        }

        // ── TELE-SITTER EVENT ─────────────────────────────────
        case "tele_event": {
          const { room, event_type, description, patient } = body;
          await supabaseRequest(env, "POST", "/autonomous_systems", {
            system_name: `TELE-${(event_type||"").toUpperCase()}-Room${room}`,
            status: event_type,
            last_action: `${patient} | ${description} | ${new Date().toISOString()}`
          });
          if (event_type === "critical") {
            await sendWhatsApp(env, `🏥 TELE-SITTER CRITICAL\nRoom: ${room}\nPatient: ${patient}\n${description}`);
          }
          return jsonResponse({ success: true });
        }

        // ── TELE-SITTER DIRECT TO HOSPITAL ────────────────────
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
                  resourceType: "Communication", status: "in-progress",
                  subject: { display: patient },
                  payload: [{ contentString: `TELE-SITTER | Room: ${room} | ${alert_type} | ${description} | ${new Date().toISOString()}` }]
                })
              });
              hospitalResult = { sent: res.ok, status: res.status };
            } catch(e) { hospitalResult = { sent: false, error: e.message }; }
          }
          await sendWhatsApp(env, `🏥 DIRECT ALERT\nRoom: ${room} | ${patient}\n${alert_type}: ${description}\nHospital: ${hospitalResult.sent ? "✅ Notified" : "❌ Failed"}`);
          return jsonResponse({ success: true, hospital: hospitalResult });
        }

        // ── ATTORNEY APPLICATION ──────────────────────────────
        case "attorney_apply": {
          const { name, license, region, phone } = body;
          await supabaseRequest(env, "POST", "/users", {
            email: phone || name, role: "attorney_applicant",
            notes: `${name} | License: ${license} | Region: ${region} | Phone: ${phone}`
          });
          await sendWhatsApp(env, `🏛️ ATTORNEY APPLICATION\nName: ${name}\nLicense: ${license}\nRegion: ${region}\nPhone: ${phone}`);
          return jsonResponse({ success: true });
        }

        // ── SEND WHATSAPP FROM DASHBOARD ─────────────────────
        case "send_whatsapp": {
          const { to, message, from_channel } = body;
          if (!to || !message) return jsonResponse({ success: false, error: "Missing to or message" });
          await sendWhatsAppTo(env, to, message);
          await supabaseRequest(env, "POST", "/autonomous_systems", {
            system_name: "WA-OUTBOUND",
            status: "sent",
            last_action: `To: ${to} | ${message.slice(0,100)} | ${new Date().toISOString()}`
          });
          return jsonResponse({ success: true });
        }

        // ── AGENT CHECK ───────────────────────────────────────
        case "agent_check": {
          const cases = await supabaseRequest(env, "GET", "/investigation_cases?select=count&limit=1");
          const prompt = `Autonomous check #${body.check_num || 1} at ${new Date().toLocaleString()}. DB: ${cases.ok ? "online" : "offline"}. Generate 2 priority tasks as JSON: {"tasks":[{"priority":"HIGH","title":"...","action":"..."}],"insight":"..."}`;
          const ai = await anthropicCall(env,
            "You are Sherlock AI autonomous agent for Sherlock Holmes Investigations Ltd. Be concise and actionable.",
            [{ role: "user", content: prompt }], 400
          );
          await sendWhatsApp(env, `🤖 AGENT CHECK\n${ai.text?.slice(0, 500)}`);
          return jsonResponse({ success: true, tasks: ai.text });
        }

        default:
          return jsonResponse({ error: "Unknown action: " + action }, 400);
      }

    } catch (err) {
      console.error("Worker error:", err);
      return jsonResponse({ error: err.message, action }, 500);
    }
  },

  // ── CRON TRIGGER ─────────────────────────────────────────────
  async scheduled(event, env, ctx) {
    try {
      const cases = await supabaseRequest(env, "GET", "/investigation_cases?select=*&order=created_at.desc&limit=5");
      const caseCount = cases.data?.length || 0;
      const ai = await anthropicCall(env,
        "You are Sherlock AI. Generate a brief autonomous business check report with 1-2 priority actions. Be specific and actionable. Max 150 words.",
        [{ role: "user", content: `Cron check at ${new Date().toLocaleString()}. Recent cases in DB: ${caseCount}. Check business health and suggest priorities.` }],
        300
      );
      await sendWhatsApp(env, `⏰ SHERLOCK CRON (15min)\n${ai.text?.slice(0, 600)}`);
    } catch(e) {
      console.error("Cron error:", e);
    }
  }
};

// ═══════════════════════════════════════
// WHATSAPP INCOMING HANDLER
// ═══════════════════════════════════════
async function handleWhatsAppIncoming(body, env) {
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return new Response("OK", { status: 200 });

    const from = message.from;
    const text = message.text?.body || "";
    const msgType = message.type;

    if (!text && msgType !== "text") {
      return new Response("OK", { status: 200 });
    }

    // Detect protocol from message context
    const protocol = detectProtocol(text);

    // AI response
    const systemPrompt = protocol
      ? PROTOCOLS[protocol].system_prompt
      : `You are Sherlock AI for Sherlock Holmes Investigations Ltd. Answer professionally and helpfully. If asked about services: Tele-Sitter (hospital monitoring), Legal Shield (emergency attorney), Investigation services (heir tracing, surveillance, asset recovery). Always offer to connect them with the right team. Contact: info@gaiaspeakecosystem.com`;

    const ai = await anthropicCall(env, systemPrompt, [{ role: "user", content: text }], 400);
    const reply = ai.text || "Thank you for your message. Our team will be in touch shortly.";

    // Send WhatsApp reply
    await sendWhatsAppTo(env, from, reply);

    // Notify Architect
    await sendTelegram(env, `📱 WhatsApp from ${from}:\n"${text}"\n\n🤖 AI replied:\n${reply.slice(0, 300)}`);

    // Log to Supabase
    await supabaseRequest(env, "POST", "/telecom_intelligence", {
      contact_name: `WhatsApp-${from}`,
      relation_type: "inbound_whatsapp",
      phone_number: from,
      associated_emails: [],
      case_id: null
    });

    return new Response("OK", { status: 200 });
  } catch(e) {
    console.error("WhatsApp handler error:", e);
    return new Response("OK", { status: 200 }); // Always 200 to Meta
  }
}

// ═══════════════════════════════════════
// EMAIL INBOUND HANDLER (from Apps Script)
// ═══════════════════════════════════════
async function handleInboundEmail(body, env) {
  try {
    const { from, subject, body_text, thread_id } = body;

    // Detect protocol
    const protocol = detectProtocolFromEmail(subject, body_text);
    const protocolConfig = protocol ? PROTOCOLS[protocol] : null;

    // AI analysis
    const systemPrompt = protocolConfig
      ? protocolConfig.system_prompt + `\n\nYou are now READING an INBOUND reply to our outreach. Analyze if they are: interested, requesting more info, declining, or asking a question. Then write an appropriate follow-up response.`
      : `You are Sherlock AI. Analyze this inbound email and write a professional response. Determine intent and respond appropriately for Sherlock Holmes Investigations Ltd services.`;

    const ai = await anthropicCall(env, systemPrompt, [{
      role: "user",
      content: `Inbound email from: ${from}\nSubject: ${subject}\nBody: ${body_text?.slice(0, 1000)}\n\nAnalyze and draft response.`
    }], 500);

    const analysis = ai.text || "";

    // WhatsApp alert to Architect
    await sendWhatsApp(env,
      `📧 INBOUND EMAIL\nFrom: ${from}\nSubject: ${subject}\n\n🤖 AI Analysis:\n${analysis.slice(0, 400)}\n\nAuto-reply will be sent in 2 minutes.`
    );

    // Auto-reply after brief delay (2 min — via scheduled or immediate)
    if (protocolConfig && env.RESEND_API_KEY) {
      await sendEmail(env, {
        to: from,
        subject: `Re: ${subject}`,
        html: analysis.replace(/\n/g, '<br>'),
        protocol
      });
    }

    // Log
    await supabaseRequest(env, "POST", "/autonomous_systems", {
      system_name: `EMAIL-INBOUND-${protocol || "general"}`,
      status: "received",
      last_action: `From: ${from} | Subject: ${subject} | ${new Date().toISOString()}`
    });

    return jsonResponse({ success: true, analysis: analysis.slice(0, 200) });
  } catch(e) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// ═══════════════════════════════════════
// SUPABASE WEBHOOK HANDLER
// ═══════════════════════════════════════
async function handleSupabaseWebhook(body, env) {
  try {
    const record = body.record || body;
    const table = body.table || "unknown";
    const eventType = body.type || "INSERT";

    if (table === "investigation_cases" && eventType === "INSERT") {
      const info = `${record.target_name} | ${record.branch} | €${record.market_value || 0}`;
      await sendWhatsApp(env, `📋 NEW CASE\n${info}`);

      // Auto AI classification
      if (env.ANTHROPIC_API_KEY) {
        const ai = await anthropicCall(env,
          "Classify this investigation case in one line. Give Sherlock Score 0-100 for success probability.",
          [{ role: "user", content: `Case: ${info}\nLog: ${(record.full_investigation_log || "").slice(0, 300)}` }],
          200
        );
        if (ai.ok) await sendWhatsApp(env, `🎯 Case Score: ${ai.text}`);
      }
    }

    return jsonResponse({ success: true });
  } catch(e) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
async function anthropicCall(env, system, messages, maxTokens = 1000) {
  if (!env.ANTHROPIC_API_KEY) return { ok: false, error: "ANTHROPIC_API_KEY not configured" };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY.trim(),
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: maxTokens, system, messages })
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: `Anthropic ${res.status}: ${data.error?.message}` };
    return { ok: true, text: data.content?.[0]?.text || "" };
  } catch(e) { return { ok: false, error: e.message }; }
}

async function supabaseRequest(env, method, path, body, extraHeaders = {}) {
  if (!cfg(env,"SUPABASE_URL") || !env.SUPABASE_KEY) return { ok: false, data: null, error: "Supabase not configured" };
  try {
    const res = await fetch(`${cfg(env,"SUPABASE_URL")}/rest/v1${path}`, {
      method,
      headers: {
        "apikey": env.SUPABASE_KEY,
        "Authorization": `Bearer ${env.SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
        ...extraHeaders
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = method === "GET" ? await res.json().catch(() => null) : null;
    return { ok: res.ok, status: res.status, data };
  } catch(e) { return { ok: false, error: e.message, data: null }; }
}

async function sendEmail(env, { to, subject, html, protocol }) {
  if (!env.RESEND_API_KEY) return { ok: false, error: "RESEND_API_KEY not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Sherlock Holmes Investigations <info@gaiaspeakecosystem.com>",
        to: [to],
        subject,
        html
      })
    });
    const data = await res.json();
    return { ok: res.ok, id: data.id, error: data.message };
  } catch(e) { return { ok: false, error: e.message }; }
}

async function sendWhatsApp(env, message) {
  // Notify Architect on personal TZ number
  const architectNumber = cfg(env,"ARCHITECT_WHATSAPP_TZ") || "255774611837";
  return sendWhatsAppTo(env, architectNumber, message);
}

async function sendWhatsAppUK(env, to, message) {
  // Send to clients/partners from UK business number
  return sendWhatsAppTo(env, to, message);
}

async function sendWhatsAppTo(env, to, message) {
  if (!env.WHATSAPP_TOKEN) return;
  // Use UK phone ID for UK numbers, US phone ID for everything else
  const isUK = to.startsWith("44");
  const phoneNumberId = isUK
    ? (cfg(env,"WHATSAPP_PHONE_ID_UK") || "1313998415132672")
    : (cfg(env,"WHATSAPP_PHONE_ID") || "127572882298955");
  try {
    await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.WHATSAPP_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message.slice(0, 4096) }
      })
    });
  } catch(e) { console.error("WhatsApp send error:", e.message); }
}

async function sendTelegram(env, message) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: message.slice(0, 4000) })
    });
  } catch(e) {}
}

function detectProtocol(text) {
  const t = text.toLowerCase();
  if (t.includes("hospital") || t.includes("patient") || t.includes("bed") || t.includes("clinic") || t.includes("nurse")) return "tele_sitter";
  if (t.includes("lawyer") || t.includes("attorney") || t.includes("legal") || t.includes("law firm") || t.includes("counsel")) return "legal_shield";
  if (t.includes("investigation") || t.includes("due diligence") || t.includes("background") || t.includes("asset")) return "corporate";
  return null;
}

function detectProtocolFromEmail(subject, body) {
  const text = ((subject || "") + " " + (body || "")).toLowerCase();
  return detectProtocol(text);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" }
  });
}
