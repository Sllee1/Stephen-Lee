import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";

const profileSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z.number().int().positive(),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  activity: z.string(),
  goal: z.enum(["lose", "maintain", "gain"]),
  unitPref: z.enum(["imperial", "metric"]),
  goalWeightKg: z.number().positive().nullable().optional(),
  physique: z.string().nullable().optional(),
  targetBodyFatPct: z.number().nullable().optional(),
  motivationMode: z.enum(["none", "moderate", "extreme"]).optional(),
  dietStyle: z.string().optional(),
  bmiPreference: z.enum(["standard", "adjusted"]).optional(),
});

export default async function profileRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/profile", async (request, reply) => {
    const profile = await app.prisma.profile.findUnique({ where: { userId: request.userId } });
    if (!profile) return reply.code(404).send({ error: "No profile yet — complete onboarding first" });
    return profile;
  });

  // Upsert: onboarding creates it, every later screen (goal picker, physique
  // picker, motivation mode, ...) just PUTs a partial-merged profile.
  app.put("/profile", async (request) => {
    const body = profileSchema.partial().parse(request.body);
    const existing = await app.prisma.profile.findUnique({ where: { userId: request.userId } });

    if (!existing) {
      const full = profileSchema.parse(request.body); // first write must be complete (onboarding)
      return app.prisma.profile.create({ data: { userId: request.userId, ...full } });
    }

    return app.prisma.profile.update({ where: { userId: request.userId }, data: body });
  });
}
