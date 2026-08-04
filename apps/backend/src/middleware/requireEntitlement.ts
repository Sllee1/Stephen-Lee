import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Gate for premium-only features. Ads-vs-subscription is otherwise handled
 * client-side (the mobile app just checks GET /entitlement and renders ads
 * when tier === "free") — this middleware is for server-side features that
 * must be blocked outright for free users, not merely nagged about.
 */
export function requirePremium() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const entitlement = await request.server.prisma.entitlement.findUnique({ where: { userId: request.userId } });
    const tier = entitlement?.tier ?? "free";
    const expired = entitlement?.expiresAt ? entitlement.expiresAt < new Date() : false;
    if (tier !== "premium" || expired) {
      reply.code(402).send({ error: "Premium subscription required" });
    }
  };
}
