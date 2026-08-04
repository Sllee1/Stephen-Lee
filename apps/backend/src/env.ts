import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  ANTHROPIC_API_KEY: z.string().min(1),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  REVENUECAT_WEBHOOK_SECRET: z.string().optional(),
  USDA_FDC_API_KEY: z.string().optional(),
  PORT: z.coerce.number().default(4000),
});

export const env = schema.parse(process.env);
