import { env } from "../env.js";

const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

// Sends via SendGrid's HTTP API rather than raw SMTP — Render's free web
// service plan blocks all outbound SMTP ports (25/465/587), but plain
// HTTPS calls (same as every other integration here: Anthropic, USDA,
// RevenueCat) work fine. Pairs with SendGrid's Single Sender
// Verification, which needs only one verified email address, not a
// whole domain.
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.SENDGRID_API_KEY || !env.SENDGRID_FROM_EMAIL) {
    // eslint-disable-next-line no-console
    console.warn(`[email] SENDGRID_API_KEY/SENDGRID_FROM_EMAIL not configured — skipping send to ${to}: ${subject}`);
    return;
  }

  const response = await fetch(SENDGRID_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: env.SENDGRID_FROM_EMAIL },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`SendGrid send failed: ${response.status} ${body}`);
  }
}
