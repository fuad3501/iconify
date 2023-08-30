import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import Stripe from 'stripe';

const stripe = new Stripe(env.NEXT_SECRET_STRIPE_KEY, {
    apiVersion: "2022-11-15",
})


export const checkoutRouter = createTRPCRouter({
  createCheckout: protectedProcedure.mutation(async ({ ctx }) => {

    return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        metadata: {
            userId: ctx.session.user.id,
        },
        line_items: [
          {price: env.PRICE_ID_100, quantity: 1},
        ],
        mode: 'payment',
        success_url: `${env.HOST_NAME}/generate`,
        cancel_url: `${env.HOST_NAME}/generate`,
      });

    }),
});
