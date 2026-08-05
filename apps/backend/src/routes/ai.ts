import { z } from "zod";
import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { requireAuth } from "../middleware/requireAuth.js";
import { analyzeBuildPhoto, analyzeFoodPhoto, analyzeTechniqueVideo, lookupFoodByName } from "../services/anthropic.js";

const imageSchema = z.object({ imageBase64: z.string().min(1) });

export default async function aiRoutes(app: FastifyInstance) {
  // Registered first so it runs before the rate limiter's onRequest hook
  // below (Fastify hooks in the same encapsulation context fire in
  // registration order) — the limiter's keyGenerator needs request.userId.
  app.addHook("onRequest", requireAuth);

  // Every route in this file is a paid Anthropic API call, unlike the rest
  // of the API, so cap it per user rather than per IP (mobile clients can
  // share a NAT'd IP, and per-IP would either starve them or be too loose).
  await app.register(rateLimit, {
    global: true,
    max: 20,
    timeWindow: "1 minute",
    keyGenerator: (request) => request.userId ?? request.ip,
  });

  app.post("/ai/analyze-food-photo", async (request) => {
    const { imageBase64 } = imageSchema.parse(request.body);
    return analyzeFoodPhoto(imageBase64);
  });

  app.post("/ai/analyze-build-photo", async (request) => {
    const body = z.object({ imageBase64: z.string().min(1), thumbUrl: z.string().min(1) }).parse(request.body);
    const result = await analyzeBuildPhoto(body.imageBase64);

    // Persisted immediately (unlike food-photo analysis, which the client
    // may discard/edit before ever saving a meal) — matches the prototype,
    // where a build photo write straight to `body-analysis` storage.
    await app.prisma.bodyAnalysis.upsert({
      where: { userId: request.userId },
      create: { userId: request.userId, thumbUrl: body.thumbUrl, ...result },
      update: { thumbUrl: body.thumbUrl, ...result },
    });

    return result;
  });

  app.post("/ai/lookup-food", async (request) => {
    const body = z.object({ name: z.string().min(1), servingHint: z.string().optional() }).parse(request.body);
    return lookupFoodByName(body.name, body.servingHint);
  });

  app.post("/ai/analyze-technique-video", async (request) => {
    const body = z
      .object({
        movementLabel: z.string().nullable(),
        frames: z.array(z.object({ time: z.number(), imageBase64: z.string().min(1) })).min(1).max(12),
      })
      .parse(request.body);
    return analyzeTechniqueVideo(body);
  });
}
