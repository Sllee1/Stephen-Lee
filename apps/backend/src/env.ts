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
  // Sends go through SendGrid's HTTP API (not SMTP — Render's free web
  // service plan blocks outbound SMTP ports entirely) using Single Sender
  // Verification, so no domain needs verifying. Optional so the API still
  // starts without it; /auth/forgot-password just logs a warning and
  // skips sending instead of failing (see services/email.ts).
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().optional(),
  PORT: z.coerce.number().default(4000),
});

export const env = schema.parse(process.env);
