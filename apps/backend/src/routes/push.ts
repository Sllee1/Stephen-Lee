import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";

export default async function pushRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.post("/push/register", async (request, reply) => {
    const body = z.object({ token: z.string().min(1), platform: z.enum(["ios", "android"]) }).parse(request.body);
    await app.prisma.pushToken.upsert({
      where: { token: body.token },
      create: { userId: request.userId, token: body.token, platform: body.platform },
      update: { userId: request.userId, platform: body.platform },
    });
    return reply.code(204).send();
  });

  app.delete("/push/register", async (request, reply) => {
    const body = z.object({ token: z.string().min(1) }).parse(request.body);
    await app.prisma.pushToken.deleteMany({ where: { token: body.token, userId: request.userId } });
    return reply.code(204).send();
  });
}
