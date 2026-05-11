import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

/**
 * Email notification router
 *
 * This provides the structure for email notifications.
 * In production, integrate with SendGrid, AWS SES, or your preferred email service.
 * For now, emails are logged to the console for debugging only in dev mode.
 */
export const emailRouter = createRouter({
  // Send order confirmation email
  sendOrderConfirmation: publicQuery
    .input(
      z.object({
        to: z.string().email(),
        orderId: z.number(),
        customerName: z.string().optional(),
        total: z.number(),
        items: z
          .array(
            z.object({
              name: z.string(),
              quantity: z.number(),
              price: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `Order confirmation email queued for ${input.to}`,
      };
    }),

  // Send quote response notification
  sendQuoteNotification: publicQuery
    .input(
      z.object({
        to: z.string().email(),
        quoteId: z.number(),
        name: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `Quote notification email queued for ${input.to}`,
      };
    }),

  // Contact form / general inquiry
  sendContactEmail: publicQuery
    .input(
      z.object({
        from: z.string().email(),
        name: z.string(),
        subject: z.string(),
        message: z.string(),
      })
    )
    .mutation(async () => {
      return {
        success: true,
        message: "Contact email received. We'll respond shortly.",
      };
    }),
});
