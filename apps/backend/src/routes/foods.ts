import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { UsdaFoodResult } from "@nutrition-app/shared";
import { requireAuth } from "../middleware/requireAuth.js";
import { searchUsdaFoods } from "../services/usda.js";

export default async function foodRoutes(app: FastifyInstance) {
  app.addHook("onRequest", requireAuth);

  // Backs the FoodPicker's search-as-you-type in the mobile app, merged
  // alongside the local FOOD_DATABASE shortlist. Cached in Postgres so a
  // repeat search for the same text (very common — "chicken", "egg", etc.)
  // never re-hits USDA's rate-limited API.
  app.get("/foods/search", async (request) => {
    const { q } = z.object({ q: z.string().min(1).max(100) }).parse(request.query);
    const query = q.trim().toLowerCase();

    const cachedSearch = await app.prisma.usdaSearchCache.findUnique({ where: { query } });

    let fdcIds: number[];
    if (cachedSearch) {
      fdcIds = cachedSearch.fdcIds;
    } else {
      const results = await searchUsdaFoods(query);
      fdcIds = results.map((r) => r.fdcId);

      await app.prisma.$transaction([
        ...results.map((r) =>
          app.prisma.usdaFoodCache.upsert({
            where: { fdcId: r.fdcId },
            create: r,
            update: r,
          })
        ),
        app.prisma.usdaSearchCache.upsert({
          where: { query },
          create: { query, fdcIds },
          update: { fdcIds },
        }),
      ]);
    }

    const cachedFoods = await app.prisma.usdaFoodCache.findMany({ where: { fdcId: { in: fdcIds } } });
    const byId = new Map(cachedFoods.map((f) => [f.fdcId, f]));

    // Preserve USDA's original relevance order — findMany doesn't guarantee it.
    const ordered: UsdaFoodResult[] = fdcIds.map((id) => byId.get(id)).filter((f): f is NonNullable<typeof f> => Boolean(f));
    return ordered;
  });
}
