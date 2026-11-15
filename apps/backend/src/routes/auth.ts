import argon2 from "argon2";
import crypto from "node:crypto";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { requireAuth } from "../middleware/requireAuth.js";
import { sendEmail } from "../services/email.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const forgotPasswordSchema = z.object({ email: z.string().email() });
const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

const RESET_CODE_TTL_MS = 15 * 60 * 1000;
const MAX_RESET_ATTEMPTS = 5;

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

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
    // Per-IP, not per-user — neither route is authenticated yet. The real
    // defense against guessing the 6-digit code is the attempts counter on
    // PasswordReset below; this just caps request volume/spam.
    await scoped.register(rateLimit, { global: true, max: 5, timeWindow: "15 minutes" });

    scoped.post("/auth/forgot-password", async (request, reply) => {
      const { email } = forgotPasswordSchema.parse(request.body);
      const user = await scoped.prisma.user.findUnique({ where: { email } });

      // Same response whether or not the account exists, so this can't be
      // used to check which emails are registered.
      if (user) {
        const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
        await scoped.prisma.passwordReset.deleteMany({ where: { userId: user.id } });
        await scoped.prisma.passwordReset.create({
          data: { userId: user.id, codeHash: hashCode(code), expiresAt: new Date(Date.now() + RESET_CODE_TTL_MS) },
        });
        try {
          await sendEmail(
            email,
            "Your password reset code",
            `<p>Your OTAS Health & Fitness Planner password reset code is <strong>${code}</strong>.</p><p>It expires in 15 minutes. If you didn't request this, you can ignore this email.</p>`
          );
        } catch (err) {
          scoped.log.error({ err }, "[auth] failed to send password reset email");
        }
      }

      return reply.send({ ok: true });
    });

    scoped.post("/auth/reset-password", async (request, reply) => {
      const { email, code, newPassword } = resetPasswordSchema.parse(request.body);
      const invalid = () => reply.code(400).send({ error: "Invalid or expired code" });

      const user = await scoped.prisma.user.findUnique({ where: { email } });
      if (!user) return invalid();

      const reset = await scoped.prisma.passwordReset.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
      if (!reset || reset.expiresAt < new Date() || reset.attempts >= MAX_RESET_ATTEMPTS) return invalid();

      if (reset.codeHash !== hashCode(code)) {
        await scoped.prisma.passwordReset.update({ where: { id: reset.id }, data: { attempts: { increment: 1 } } });
        return invalid();
      }

      const passwordHash = await argon2.hash(newPassword);
      await scoped.prisma.$transaction([
        scoped.prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
        scoped.prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
      ]);

      const token = app.jwt.sign({ sub: user.id }, { expiresIn: "30d" });
      return reply.send({ token, userId: user.id });
    });
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
