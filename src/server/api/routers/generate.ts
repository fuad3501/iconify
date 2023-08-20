import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs";


const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

export const generateRouter = createTRPCRouter({
    
    generateIcon: protectedProcedure.input(
        z.object({
            prompt: z.string(),
        })
    ).mutation(async ({ctx, input}) => {
        // Check the user has enough credits in their account
        const {count} = await ctx.prisma.user.updateMany({
            where: {
                id: ctx.session.user.id,      
                credits: {
                    gte: 1             // Loops through all records until it finds the correct one, makes sure its greater or equal to one and then decrement it
                },
            },
            data: {
                credits: {
                    decrement: 1,      // decrements credit
                }
            }
        })
        
        // Throws exception if user has no credits
        if (count <= 0){
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Insufficient Credit"
            })
        }

        // Once sufficient credit is verified, submit the prompt to Dall E
        const response = await openai.createImage({
            prompt: input.prompt,
            n: 1,
            size: "1024x1024",
          });

        const url = response.data.data[0]?.url;

        return {
          imageURL: url,  
        };
    })
});

