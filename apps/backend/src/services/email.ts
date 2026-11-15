import { env } from "../env.js";

const RESEND_URL = "https://api.resend.com/emails";

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn(`[email] RESEND_API_KEY not configured — skipping send to ${to}: ${subject}`);
    return;
  }

  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend send failed: ${response.status} ${body}`);
  }
}
