import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { analyzeBuildPhoto, analyzeFoodPhoto, analyzeTechniqueVideo, lookupFoodByName } from "../services/anthropic.js";

const imageSchema = z.object({ imageBase64: z.string().min(1) });

export default async function aiRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  // TODO before ship: rate-limit these per user (e.g. @fastify/rate-limit)
  // and/or count usage against the free tier — every call here is a paid
  // Anthropic API request, unlike the rest of the API.

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
