import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/requireAuth.js";
import { env } from "../env.js";

/**
 * RevenueCat is the recommended path for RN subscriptions (wraps StoreKit +
 * Play Billing behind one SDK/webhook contract) — this is the receiving end
 * of its webhook. Configure the webhook URL + this shared secret in the
 * RevenueCat dashboard. See https://www.revenuecat.com/docs/webhooks for the
 * exact event payload; the fields below cover the subset this app acts on.
 */
const webhookEventSchema = z.object({
  event: z.object({
    type: z.string(), // "INITIAL_PURCHASE" | "RENEWAL" | "CANCELLATION" | "EXPIRATION" | ...
    app_user_id: z.string(), // set to our internal userId at SDK-configure time
    product_id: z.string().optional(),
    expiration_at_ms: z.number().nullable().optional(),
  }),
});

const ACTIVE_EVENT_TYPES = new Set(["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE"]);
const INACTIVE_EVENT_TYPES = new Set(["CANCELLATION", "EXPIRATION", "BILLING_ISSUE"]);

export default async function subscriptionRoutes(app: FastifyInstance) {
  app.post("/webhooks/revenuecat", async (request, reply) => {
    if (env.REVENUECAT_WEBHOOK_SECRET) {
      const auth = request.headers.authorization;
      if (auth !== `Bearer ${env.REVENUECAT_WEBHOOK_SECRET}`) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
    }

    const { event } = webhookEventSchema.parse(request.body);
    const userId = event.app_user_id;

    if (ACTIVE_EVENT_TYPES.has(event.type)) {
      await app.prisma.entitlement.upsert({
        where: { userId },
        create: {
          userId,
          tier: "premium",
          provider: "revenuecat",
          productId: event.product_id ?? null,
          expiresAt: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
        },
        update: {
          tier: "premium",
          provider: "revenuecat",
          productId: event.product_id ?? null,
          expiresAt: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
        },
      });
    } else if (INACTIVE_EVENT_TYPES.has(event.type)) {
      await app.prisma.entitlement.upsert({
        where: { userId },
        create: { userId, tier: "free" },
        update: { tier: "free" },
      });
    }

    return reply.code(200).send({ ok: true });
  });

  app.register(async (scoped) => {
    scoped.addHook("onRequest", requireAuth);

    // Client checks this after app launch / RevenueCat SDK init to decide
    // whether to render ads and whether to unlock premium-only screens.
    scoped.get("/entitlement", async (request) => {
      const entitlement = await scoped.prisma.entitlement.findUnique({ where: { userId: request.userId } });
      const tier = entitlement?.tier ?? "free";
      const expired = entitlement?.expiresAt ? entitlement.expiresAt < new Date() : false;
      const effectiveTier = expired ? "free" : tier;
      return { tier: effectiveTier, adsEnabled: effectiveTier === "free", expiresAt: entitlement?.expiresAt ?? null };
    });
  });
}
