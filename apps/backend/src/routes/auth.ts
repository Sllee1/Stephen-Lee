import argon2 from "argon2";
import { z } from "zod";
import type { FastifyInstance } from "fastify";

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
}
