import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "./env.js";
import prismaPlugin from "./plugins/prisma.js";
import { startNotificationScheduler } from "./services/notifications.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import mealRoutes from "./routes/meals.js";
import calendarRoutes from "./routes/calendar.js";
import weightRoutes from "./routes/weight.js";
import workoutRoutes from "./routes/workouts.js";
import bodyAnalysisRoutes from "./routes/bodyAnalysis.js";
import aiRoutes from "./routes/ai.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import pushRoutes from "./routes/push.js";

async function buildServer() {
  const app = Fastify({
    logger: {
      transport: process.env.NODE_ENV === "production" ? undefined : { target: "pino-pretty" },
    },
    // Photo/video-frame payloads are base64 JSON — bump past Fastify's 1MB default.
    bodyLimit: 15 * 1024 * 1024,
  });

  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: env.JWT_SECRET });
  await app.register(prismaPlugin);

  app.get("/health", async () => ({ ok: true }));

  await app.register(authRoutes);
  await app.register(profileRoutes);
  await app.register(mealRoutes);
  await app.register(calendarRoutes);
  await app.register(weightRoutes);
  await app.register(workoutRoutes);
  await app.register(bodyAnalysisRoutes);
  await app.register(aiRoutes);
  await app.register(subscriptionRoutes);
  await app.register(pushRoutes);

  return app;
}

async function main() {
  const app = await buildServer();
  const scheduler = startNotificationScheduler(app.prisma);
  app.addHook("onClose", async () => {
    scheduler.stop();
  });

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
