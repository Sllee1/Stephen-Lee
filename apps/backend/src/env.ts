import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  // Optional so the whole API isn't unusable before this is configured —
  // only the /ai/* routes need it, and they fail with a clear per-request
  // error (see services/anthropic.ts) rather than blocking server startup.
  ANTHROPIC_API_KEY: z.string().optional(),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  REVENUECAT_WEBHOOK_SECRET: z.string().optional(),
  USDA_FDC_API_KEY: z.string().optional(),
  // Sends go through Gmail SMTP using an account's App Password, rather
  // than a transactional email provider — no domain to verify, works with
  // a plain Gmail account. Optional so the API still starts without it;
  // /auth/forgot-password just logs a warning and skips sending instead
  // of failing (see services/email.ts).
  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  PORT: z.coerce.number().default(4000),
});

export const env = schema.parse(process.env);
