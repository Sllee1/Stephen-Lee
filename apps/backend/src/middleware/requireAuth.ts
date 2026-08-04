import type { FastifyReply, FastifyRequest } from "fastify";

/** Verifies the JWT (via @fastify/jwt) and stamps request.userId from its `sub` claim. */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify<{ sub: string }>();
    request.userId = payload.sub;
  } catch {
    reply.code(401).send({ error: "Unauthorized" });
  }
}
