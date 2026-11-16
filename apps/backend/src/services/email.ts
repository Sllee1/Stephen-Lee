import nodemailer from "nodemailer";
import { env } from "../env.js";

// Sends via the account's own Gmail SMTP relay using an App Password,
// rather than a transactional email provider — no domain to verify,
// works with a plain Gmail account (fine for low volume; Gmail caps
// regular accounts at ~500 sends/day). Transporter is created lazily and
// reused across calls rather than per-send.
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    // eslint-disable-next-line no-console
    console.warn(`[email] GMAIL_USER/GMAIL_APP_PASSWORD not configured — skipping send to ${to}: ${subject}`);
    return;
  }

  // nodemailer's sendMail() can resolve successfully even when the
  // recipient was rejected (see info.rejected) — logging the full
  // response is the only way to actually tell "accepted" from "silently
  // dropped" rather than just "didn't throw".
  const info = await getTransporter().sendMail({
    from: env.GMAIL_USER,
    to,
    subject,
    html,
  });
  // eslint-disable-next-line no-console
  console.log(`[email] sendMail result for ${to}:`, JSON.stringify({ messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response }));
}
