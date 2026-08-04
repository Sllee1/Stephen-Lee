import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { runAutoFill, resolveFillRange, type FillRange } from "@nutrition-app/shared";
import { requireAuth } from "../middleware/requireAuth.js";

const templateEventSchema = z.object({
  day: z.number().int().min(0).max(6),
  type: z.enum(["workout", "eating"]),
  label: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  notifyStart: z.boolean(),
  notifyEnd: z.boolean(),
});

const dateEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["workout", "eating"]),
  label: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  notifyStart: z.boolean(),
  notifyEnd: z.boolean(),
});

const fillSchema = z.object({
  range: z.enum(["month", "4weeks", "8weeks", "26weeks", "52weeks", "custom"]),
  viewedYear: z.number().int(),
  viewedMonth0: z.number().int().min(0).max(11),
  from: z.string().optional(),
  to: z.string().optional(),
});

export default async function calendarRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  // --- Week template (recurring, day-of-week) ---

  app.get("/calendar/template", async (request) => {
    return app.prisma.templateEvent.findMany({ where: { userId: request.userId } });
  });

  app.post("/calendar/template", async (request, reply) => {
    const body = templateEventSchema.parse(request.body);
    const event = await app.prisma.templateEvent.create({ data: { userId: request.userId, ...body } });
    return reply.code(201).send(event);
  });

  // Replaces every existing template entry of `type` with the given list —
  // mirrors the prototype's "apply this workout/eating window to all 7
  // days" quick-add, which is a type-scoped full replace, not a merge.
  app.put("/calendar/template/replace-type", async (request) => {
    const body = z.object({ type: z.enum(["workout", "eating"]), events: z.array(templateEventSchema) }).parse(request.body);
    return app.prisma.$transaction(async (tx) => {
      await tx.templateEvent.deleteMany({ where: { userId: request.userId, type: body.type } });
      await tx.templateEvent.createMany({ data: body.events.map((e) => ({ userId: request.userId, ...e })) });
      return tx.templateEvent.findMany({ where: { userId: request.userId } });
    });
  });

  app.delete("/calendar/template/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const event = await app.prisma.templateEvent.findUnique({ where: { id } });
    if (!event || event.userId !== request.userId) return reply.code(404).send({ error: "Not found" });
    await app.prisma.templateEvent.delete({ where: { id } });
    return reply.code(204).send();
  });

  // --- Real calendar (concrete dates) ---

  app.get("/calendar/dates", async (request) => {
    const query = z.object({ from: z.string(), to: z.string() }).parse(request.query);
    return app.prisma.dateEvent.findMany({
      where: { userId: request.userId, date: { gte: query.from, lte: query.to } },
    });
  });

  app.post("/calendar/dates", async (request, reply) => {
    const body = dateEventSchema.parse(request.body);
    const event = await app.prisma.dateEvent.create({ data: { userId: request.userId, ...body, sourceTemplateEventId: null } });
    return reply.code(201).send(event);
  });

  app.delete("/calendar/dates/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const event = await app.prisma.dateEvent.findUnique({ where: { id } });
    if (!event || event.userId !== request.userId) return reply.code(404).send({ error: "Not found" });
    await app.prisma.dateEvent.delete({ where: { id } });
    return reply.code(204).send();
  });

  // Destructive per-date full replace, same semantics as the prototype:
  // any manual edits to a date get overwritten if a later fill covers it.
  app.post("/calendar/auto-fill", async (request) => {
    const body = fillSchema.parse(request.body);
    const [templateEvents, existing] = await Promise.all([
      app.prisma.templateEvent.findMany({ where: { userId: request.userId } }),
      app.prisma.dateEvent.findMany({ where: { userId: request.userId } }),
    ]);

    const existingByDate: Record<string, typeof existing> = {};
    for (const e of existing) (existingByDate[e.date] ??= []).push(e);

    const { start, end } = resolveFillRange(body.range as FillRange, {
      viewedYear: body.viewedYear,
      viewedMonth0: body.viewedMonth0,
      from: body.from,
      to: body.to,
    });

    const updated = runAutoFill(templateEvents as any, existingByDate as any, start, end);
    const touchedDates = Object.keys(updated).filter((d) => !existingByDate[d] || existingByDate[d] !== updated[d]);

    await app.prisma.$transaction(async (tx) => {
      for (const date of touchedDates) {
        await tx.dateEvent.deleteMany({ where: { userId: request.userId, date } });
        await tx.dateEvent.createMany({
          data: updated[date].map((e) => ({ ...e, id: undefined, userId: request.userId })),
        });
      }
    });

    return { touchedDates: touchedDates.length };
  });

  app.post("/calendar/clear", async (request) => {
    await app.prisma.$transaction([
      app.prisma.templateEvent.deleteMany({ where: { userId: request.userId } }),
      app.prisma.dateEvent.deleteMany({ where: { userId: request.userId } }),
    ]);
    return { ok: true };
  });
}
