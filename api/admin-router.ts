import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, orders, orderItems, quoteRequests } from "@db/schema";
import { eq, desc, like, inArray, sql, asc } from "drizzle-orm";

export const adminRouter = createRouter({
  // Dashboard stats
  stats: publicQuery.query(async () => {
    const db = getDb();
    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [quoteCount] = await db.select({ count: sql<number>`count(*)` }).from(quoteRequests).where(eq(quoteRequests.status, "pending"));
    const [revenueResult] = await db.select({ total: sql<number>`coalesce(sum(total), 0)` }).from(orders).where(eq(orders.status, "completed"));
    const [lowStock] = await db.select({ count: sql<number>`count(*)` }).from(products).where(sql`inventory < 50`);
    return {
      totalProducts: Number(productCount?.count ?? 0),
      totalOrders: Number(orderCount?.count ?? 0),
      pendingQuotes: Number(quoteCount?.count ?? 0),
      totalRevenue: Number(revenueResult?.total ?? 0),
      lowStock: Number(lowStock?.count ?? 0),
    };
  }),

  // Product CRUD
  products: publicQuery
    .input(z.object({
      search: z.string().optional(),
      page: z.number().min(1).optional(),
      limit: z.number().min(1).max(100).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;
      const where = input?.search ? like(products.name, `%${input.search}%`) : undefined;

      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(products).where(where);
      const items = await db.select().from(products).where(where).orderBy(desc(products.createdAt)).limit(limit).offset(offset);

      return {
        items,
        pagination: { page, limit, totalCount: Number(countResult?.count ?? 0), totalPages: Math.ceil(Number(countResult?.count ?? 0) / limit) },
      };
    }),

  createProduct: publicQuery
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      price: z.string().min(1),
      compareAtPrice: z.string().optional(),
      image: z.string().optional(),
      categoryId: z.number().optional(),
      brandId: z.number().optional(),
      inventory: z.number().min(0).default(100),
      moq: z.number().min(1).default(100),
      featured: z.number().min(0).max(1).default(0),
      rating: z.string().optional(),
      reviewCount: z.number().default(0),
      colors: z.string().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(products).values({
        ...input,
        price: input.price,
        compareAtPrice: input.compareAtPrice || null,
        rating: input.rating || "0",
      });
      return { id: Number(result[0].insertId) };
    }),

  updateProduct: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      price: z.string().optional(),
      compareAtPrice: z.string().optional(),
      image: z.string().optional(),
      categoryId: z.number().optional(),
      inventory: z.number().optional(),
      moq: z.number().optional(),
      featured: z.number().optional(),
      colors: z.string().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(products).set(data).where(eq(products.id, id));
      return { success: true };
    }),

  deleteProduct: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  bulkDeleteProducts: publicQuery
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(inArray(products.id, input.ids));
      return { success: true, deleted: input.ids.length };
    }),

  // Orders
  orders: publicQuery
    .input(z.object({
      status: z.string().optional(),
      page: z.number().min(1).optional(),
      limit: z.number().min(1).max(100).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;
      const where = input?.status ? eq(orders.status, input.status as any) : undefined;

      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(where);
      const items = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);

      return {
        items,
        pagination: { page, limit, totalCount: Number(countResult?.count ?? 0), totalPages: Math.ceil(Number(countResult?.count ?? 0) / limit) },
      };
    }),

  orderDetail: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const order = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
      if (!order[0]) return null;
      const items = await db
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
        .where(eq(orderItems.orderId, input.id));
      return { ...order[0], items };
    }),

  updateOrderStatus: publicQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "processing", "completed", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
      return { success: true };
    }),

  // Quote requests
  quotes: publicQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const where = input?.status ? eq(quoteRequests.status, input.status as any) : undefined;
      return db.select().from(quoteRequests).where(where).orderBy(desc(quoteRequests.createdAt));
    }),

  submitQuote: publicQuery
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      company: z.string().optional(),
      phone: z.string().optional(),
      productName: z.string().optional(),
      productId: z.number().optional(),
      quantity: z.number().min(1),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(quoteRequests).values({
        ...input,
        status: "pending",
      });
      return { success: true };
    }),

  updateQuoteStatus: publicQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "reviewed", "responded"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(quoteRequests).set({ status: input.status }).where(eq(quoteRequests.id, input.id));
      return { success: true };
    }),

  recentSales: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({
      id: orders.id,
      total: orders.total,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      customerEmail: orders.customerEmail,
      customerName: orders.customerName,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(5);
    return result;
  }),

  salesByMonth: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({
      month: sql<string>`DATE_FORMAT(createdAt, '%Y-%m')`,
      count: sql<number>`count(*)`,
      revenue: sql<number>`coalesce(sum(total), 0)`,
    })
    .from(orders)
    .where(eq(orders.status, "completed"))
    .groupBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`)
    .orderBy(asc(sql`DATE_FORMAT(createdAt, '%Y-%m')`));
    return result;
  }),
});
