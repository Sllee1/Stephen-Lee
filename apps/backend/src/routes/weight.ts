import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";

const weightEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.number().positive(),
});

export default async function weightRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/weight", async (request) => {
    return app.prisma.weightEntry.findMany({ where: { userId: request.userId }, orderBy: { date: "asc" } });
  });

  // Upsert-by-date, and mirror the new weight onto the profile — matches
  // the prototype's `addWeightEntry`, which updates both in one action.
  app.post("/weight", async (request) => {
    const body = weightEntrySchema.parse(request.body);
    const [entry] = await app.prisma.$transaction([
      app.prisma.weightEntry.upsert({
        where: { userId_date: { userId: request.userId, date: body.date } },
        create: { userId: request.userId, ...body },
        update: { weightKg: body.weightKg },
      }),
      app.prisma.profile.update({ where: { userId: request.userId }, data: { weightKg: body.weightKg } }),
    ]);
    return entry;
  });
}
