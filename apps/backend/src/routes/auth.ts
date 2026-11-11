import argon2 from "argon2";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const { email, password } = credentialsSchema.parse(request.body);

    const existing = await app.prisma.user.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ error: "Email already registered" });

    const passwordHash = await argon2.hash(password);
    const user = await app.prisma.user.create({
      data: {
        email,
        passwordHash,
        entitlement: { create: { tier: "free" } },
      },
    });

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: "30d" });
    return reply.code(201).send({ token, userId: user.id });
  });

  app.post("/auth/login", async (request, reply) => {
    const { email, password } = credentialsSchema.parse(request.body);

    const user = await app.prisma.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      return reply.code(401).send({ error: "Invalid email or password" });
    }

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: "30d" });
    return reply.send({ token, userId: user.id });
  });

  app.register(async (scoped) => {
    scoped.addHook("onRequest", requireAuth);

    // Required by App Store review guideline 5.1.1(v): any app that lets a
    // user create an account must also let them delete it from inside the
    // app, not just via a web form/support email. Every other table's
    // foreign key cascades from User (see prisma/schema.prisma), so this
    // one delete removes everything — meals, calendar, weight/workout
    // history, push tokens, entitlement, the lot.
    scoped.delete("/account", async (request, reply) => {
      await scoped.prisma.user.delete({ where: { id: request.userId } });
      return reply.code(204).send();
    });
  });
}
