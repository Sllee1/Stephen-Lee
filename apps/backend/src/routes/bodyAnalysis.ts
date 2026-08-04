import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";

export default async function bodyAnalysisRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  app.get("/body-analysis", async (request, reply) => {
    const analysis = await app.prisma.bodyAnalysis.findUnique({ where: { userId: request.userId } });
    if (!analysis) return reply.code(404).send({ error: "No analysis on file" });
    return analysis;
  });

  app.delete("/body-analysis", async (request, reply) => {
    await app.prisma.bodyAnalysis.deleteMany({ where: { userId: request.userId } });
    return reply.code(204).send();
  });
}
