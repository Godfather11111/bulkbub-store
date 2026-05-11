import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews } from "@db/schema";

export const reviewsRouter = createRouter({
  // List reviews for a product
  byProduct: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, input.productId))
        .orderBy(desc(reviews.createdAt));

      const avgRating =
        items.length > 0
          ? items.reduce((sum, r) => sum + r.rating, 0) / items.length
          : 0;

      return {
        items,
        count: items.length,
        averageRating: Number(avgRating.toFixed(1)),
      };
    }),

  // Create a review
  create: publicQuery
    .input(
      z.object({
        productId: z.number(),
        customerName: z.string().min(1).max(255),
        customerEmail: z.string().email().optional(),
        rating: z.number().min(1).max(5),
        title: z.string().max(255).optional(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [review] = await db
        .insert(reviews)
        .values({
          productId: input.productId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          rating: input.rating,
          title: input.title,
          content: input.content,
          verified: 1,
        })
        .$returningId();

      return { success: true, reviewId: review.id };
    }),
});
