import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems, products } from "@db/schema";
import { eq } from "drizzle-orm";
import { env } from "./lib/env";
import Stripe from "stripe";

const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, { apiVersion: "2025-03-31.basil" as any })
  : null;

export const paymentRouter = createRouter({
  createPaymentIntent: publicQuery
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
          })
        ),
        customerEmail: z.string().email().optional(),
        customerName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!stripe) {
        throw new Error("Stripe is not configured");
      }

      const db = getDb();

      // Validate and calculate total
      let total = 0;
      const lineItems: { product: typeof products.$inferSelect; quantity: number; price: number }[] = [];

      for (const item of input.items) {
        const productResult = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (productResult.length === 0) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const product = productResult[0];
        const itemTotal = Number(product.price) * item.quantity * 100; // cents
        total += itemTotal;

        lineItems.push({
          product,
          quantity: item.quantity,
          price: Number(product.price),
        });
      }

      // Create order in database
      const orderResult = await db.insert(orders).values({
        userId: null,
        status: "pending",
        total: (total / 100).toFixed(2),
        paymentStatus: "pending",
        customerEmail: input.customerEmail,
        customerName: input.customerName,
      });

      const orderId = Number(orderResult[0].insertId);

      // Create order items
      for (const item of lineItems) {
        await db.insert(orderItems).values({
          orderId,
          productId: item.product.id,
          quantity: item.quantity,
          price: item.price.toFixed(2),
        });
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total),
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: orderId.toString(),
        },
      });

      // Update order with payment intent ID
      await db
        .update(orders)
        .set({ paymentIntentId: paymentIntent.id })
        .where(eq(orders.id, orderId));

      return {
        clientSecret: paymentIntent.client_secret!,
        orderId,
      };
    }),

  confirmOrder: publicQuery
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(orders)
        .set({
          status: "completed",
          paymentStatus: "succeeded",
        })
        .where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  getOrder: publicQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);

      if (orderResult.length === 0) return null;

      const itemsResult = await db
        .select({
          id: orderItems.id,
          quantity: orderItems.quantity,
          price: orderItems.price,
          productId: orderItems.productId,
          productName: products.name,
          productImage: products.image,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, input.orderId));

      return {
        ...orderResult[0],
        items: itemsResult,
      };
    }),
});
