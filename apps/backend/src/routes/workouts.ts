import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { normalizeLabel } from "@nutrition-app/shared";
import { requireAuth } from "../middleware/requireAuth.js";

const resultSchema = z.object({
  label: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.string().min(1),
});

export default async function workoutRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/workouts/history", async (request) => {
    return app.prisma.workoutResult.findMany({ where: { userId: request.userId }, orderBy: { date: "desc" } });
  });

  // One result per normalized-label+date; logging the same label again the
  // same day overwrites, matching the prototype's dedupe behavior.
  app.post("/workouts/history", async (request) => {
    const body = resultSchema.parse(request.body);
    const normalized = normalizeLabel(body.label);
    return app.prisma.workoutResult.upsert({
      where: { userId_normalized_date: { userId: request.userId, normalized, date: body.date } },
      create: { userId: request.userId, normalized, ...body },
      update: { value: body.value, label: body.label },
    });
  });
}
