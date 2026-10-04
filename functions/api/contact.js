/**
 * Cloudflare Pages Function: POST /api/contact
 * ------------------------------------------------------------------
 * Receives the "Request care" form, validates it, and (once configured)
 * emails the inquiry to Stephanie. Until an email provider is set up it
 * simply logs the inquiry (visible in Cloudflare → Pages → Functions logs)
 * and returns a friendly success response.
 *
 * Recipient address comes from the single config file:
 *   assets/js/config.js  →  SITE_CONFIG.contactEmail   (PLACEHOLDER for now)
 *
 * See README.md → "Email & contact form" for setup steps.
 */
import { SITE_CONFIG } from "../../assets/js/config.js";

const LIMITS = { name: 120, email: 160, kids_ages: 160, service: 60, schedule: 240, message: 4000 };
const SERVICES = ["Ongoing nanny care", "Babysitting", "Weekend date night", "Newborn help", "Not sure yet"];

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json");
  let data;
  try {
    const form = await request.formData();
    data = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v).trim()]));
  } catch {
    return reply(wantsJson, 400, { ok: false, error: "Invalid form submission" });
  }

  // Honeypot: bots fill the hidden "website" field. Pretend success, do nothing.
  if (data.website) return reply(wantsJson, 200, { ok: true });

  const errors = [];
  if (!data.name) errors.push("name");
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("email");
  if (!data.kids_ages) errors.push("kids' ages");
  if (!SERVICES.includes(data.service)) errors.push("service");
  for (const [k, max] of Object.entries(LIMITS)) if ((data[k] || "").length > max) errors.push(k);
  if (errors.length) return reply(wantsJson, 422, { ok: false, error: `Please check: ${errors.join(", ")}` });

  const inquiry = {
    name: data.name,
    email: data.email,
    kidsAges: data.kids_ages,
    service: data.service,
    schedule: data.schedule || "(not provided)",
    message: data.message || "(none)",
    receivedAt: new Date().toISOString(),
  };

  try {
    await sendInquiryEmail(inquiry, env);
  } catch (err) {
    console.error("Contact email failed:", err);
    return reply(wantsJson, 502, { ok: false, error: "Email service unavailable" });
  }
  return reply(wantsJson, 200, { ok: true });
}

// Non-POST requests
export function onRequest() {
  return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
}

/**
 * ============ EMAIL HOOKUP GOES HERE ============
 * Default provider: Resend (https://resend.com), via its HTTPS API, so no SDK is needed.
 * To enable:
 *   1. Create a Resend account, verify the domain stephaniemeninga.com (add its DNS records in Cloudflare).
 *   2. In Cloudflare Pages → Settings → Variables and Secrets, add the secret RESEND_API_KEY.
 *   3. (Optional) add CONTACT_FROM, e.g. "Little Arrows Website <website@stephaniemeninga.com>".
 *   4. Update SITE_CONFIG.contactEmail in assets/js/config.js to the real inbox.
 * Without RESEND_API_KEY the inquiry is only logged (safe for previews).
 * Any provider with an HTTP API (Postmark, SendGrid, Mailgun, Cloudflare Email
 * Routing's send_email binding) can be swapped in here.
 */
async function sendInquiryEmail(q, env) {
  const to = SITE_CONFIG.contactEmail;
  const subject = `New care inquiry: ${q.service} (${q.name})`;
  const text = [
    `New inquiry from ${SITE_CONFIG.siteUrl}`,
    "",
    `Parent name:  ${q.name}`,
    `Email:        ${q.email}`,
    `Kids' ages:   ${q.kidsAges}`,
    `Service:      ${q.service}`,
    `Schedule:     ${q.schedule}`,
    "",
    "Message:",
    q.message,
    "",
    `Received: ${q.receivedAt}`,
  ].join("\n");

  if (!env || !env.RESEND_API_KEY) {
    // Not configured: log only non-personal details (no names/emails in logs).
    // NOTE: inquiries are NOT stored anywhere until an email provider is set up.
    console.log(`[contact] Email not configured yet. Inquiry received for "${q.service}" at ${q.receivedAt}.`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.CONTACT_FROM || `Little Arrows Website <website@stephaniemeninga.com>`,
      to: [to],
      reply_to: q.email,
      subject,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

function reply(wantsJson, status, body) {
  if (wantsJson) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  // No-JS fallback: send the visitor to a friendly page.
  const location = body.ok ? "/thanks.html" : "/#contact";
  return new Response(null, { status: 303, headers: { Location: location } });
}
