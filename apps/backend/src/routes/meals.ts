import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { NUTRIENT_KEYS, sumNutrients, todayKey } from "@nutrition-app/shared";
import { requireAuth } from "../middleware/requireAuth.js";

const nutrientShape = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, z.number()])) as Record<
  (typeof NUTRIENT_KEYS)[number],
  z.ZodNumber
>;

const mealItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.string().optional(),
  ...nutrientShape,
});

const createMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string(),
  thumbUrl: z.string().nullable().optional(),
  time: z.string(), // ISO
  items: z.array(mealItemSchema).min(1),
});

export default async function mealRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  // Unlike the prototype (which only ever loaded `meals-${todayKey()}`),
  // this lets the app show history/trends — pass ?date=YYYY-MM-DD, defaults
  // to today.
  app.get("/meals", async (request) => {
    const query = z.object({ date: z.string().optional() }).parse(request.query);
    const date = query.date ?? todayKey();
    return app.prisma.meal.findMany({
      where: { userId: request.userId, date },
      include: { items: true },
      orderBy: { time: "desc" },
    });
  });

  app.post("/meals", async (request, reply) => {
    const body = createMealSchema.parse(request.body);
    const totals = sumNutrients(body.items);

    const meal = await app.prisma.meal.create({
      data: {
        userId: request.userId,
        date: body.date,
        name: body.name,
        thumbUrl: body.thumbUrl ?? null,
        time: new Date(body.time),
        ...totals,
        items: { create: body.items.map(({ id, ...rest }) => rest) },
      },
      include: { items: true },
    });

    return reply.code(201).send(meal);
  });

  app.delete("/meals/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const meal = await app.prisma.meal.findUnique({ where: { id } });
    if (!meal || meal.userId !== request.userId) return reply.code(404).send({ error: "Not found" });
    await app.prisma.meal.delete({ where: { id } });
    return reply.code(204).send();
  });
}
