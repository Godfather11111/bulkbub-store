import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, categories, brands, blogPosts } from "@db/schema";
import { eq, desc, like, and, isNull, isNotNull, inArray, sql, asc } from "drizzle-orm";

const PAGE_SIZE = 24;

function getSortColumn(sort?: string) {
  switch (sort) {
    case "price_asc": return asc(products.price);
    case "price_desc": return desc(products.price);
    case "rating": return desc(products.rating);
    case "name": return asc(products.name);
    default: return desc(products.createdAt);
  }
}

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        categoryId: z.number().optional(),
        subcategoryId: z.number().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
        sort: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? PAGE_SIZE;
      const offset = (page - 1) * limit;
      const finalConditions = [];

      if (input?.subcategoryId) {
        finalConditions.push(eq(products.categoryId, input.subcategoryId));
      } else if (input?.categoryId) {
        const subCats = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.parentId, input.categoryId));

        const categoryIds = subCats.map((c) => c.id);
        if (categoryIds.length > 0) {
          finalConditions.push(inArray(products.categoryId, categoryIds));
        }
      }
      if (input?.search) {
        finalConditions.push(like(products.name, `%${input.search}%`));
      }
      if (input?.featured) {
        finalConditions.push(eq(products.featured, 1));
      }

      const where = finalConditions.length > 0 ? and(...finalConditions) : undefined;

      // Get total count for pagination
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(where);

      const totalCount = Number(countResult?.count ?? 0);

      // Get paginated results
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          image: products.image,
          images: products.images,
          categoryId: products.categoryId,
          brandId: products.brandId,
          inventory: products.inventory,
          featured: products.featured,
          tags: products.tags,
          rating: products.rating,
          reviewCount: products.reviewCount,
          colors: products.colors,
          moq: products.moq,
          createdAt: products.createdAt,
          categoryName: categories.name,
          categorySlug: categories.slug,
          brandName: brands.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(where)
        .orderBy(getSortColumn(input?.sort))
        .limit(limit)
        .offset(offset);

      return {
        items: result,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page * limit < totalCount,
          hasPrevPage: page > 1,
        },
      };
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          image: products.image,
          images: products.images,
          categoryId: products.categoryId,
          brandId: products.brandId,
          inventory: products.inventory,
          featured: products.featured,
          tags: products.tags,
          rating: products.rating,
          reviewCount: products.reviewCount,
          colors: products.colors,
          moq: products.moq,
          createdAt: products.createdAt,
          categoryName: categories.name,
          categorySlug: categories.slug,
          brandName: brands.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(eq(products.slug, input.slug))
        .limit(1);

      return result[0] ?? null;
    }),

  categories: publicQuery.query(async () => {
    const db = getDb();
    const parents = await db
      .select()
      .from(categories)
      .where(isNull(categories.parentId))
      .orderBy(categories.name);

    const subs = await db
      .select()
      .from(categories)
      .where(isNotNull(categories.parentId))
      .orderBy(categories.name);

    return parents.map((parent) => ({
      ...parent,
      subcategories: subs.filter((sub) => sub.parentId === parent.id),
    }));
  }),

  categoryBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, input.slug))
        .limit(1);
      return result[0] ?? null;
    }),

  brands: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(brands).orderBy(brands.name);
  }),

  blogPosts: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.publishedAt))
        .limit(input?.limit ?? 10);
    }),

  blogPostBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, input.slug))
        .limit(1);
      return result[0] ?? null;
    }),
});
