import { authRouter } from "./auth-router";
import { productRouter } from "./product-router";
import { paymentRouter } from "./payment-router";
import { adminRouter } from "./admin-router";
import { emailRouter } from "./email-router";
import { reviewsRouter } from "./reviews-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  payment: paymentRouter,
  admin: adminRouter,
  email: emailRouter,
  reviews: reviewsRouter,
});

export type AppRouter = typeof appRouter;
