import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs";

// Initialises and creates OpenAI object 
const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

// Function that submits prompt to Dall E API and returns URL of generated image
async function generateIcon(prompt: string): Promise<string | undefined>{
    if (env.MOCK_OPENAI === "true"){
        return "https://oaidalleapiprodscus.blob.core.windows.net/private/org-v8SkdSpBJnWxSDAGTU2D4fwd/user-cxWX6SyY0qmOvzTYt6ka4HOG/img-fawRs2DXj7feijhq0sZXb1iY.png?st=2023-08-20T21%3A03%3A53Z&se=2023-08-20T23%3A03%3A53Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-08-20T21%3A44%3A59Z&ske=2023-08-21T21%3A44%3A59Z&sks=b&skv=2021-08-06&sig=4Wl2XP/heRGwYwNPOy8GqvwGFTBDAzVFdjU7SOYvZWg%3D"
    }else{
        // Once sufficient credit is verified, submit the prompt to Dall E
        const response = await openai.createImage({
            prompt,
            n: 1,
            size: "1024x1024",
            });
        return response.data.data[0]?.url!;
    }
    
}

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

        // Send prompt to OpenAI
        const url = await generateIcon(input.prompt)

        return {
          imageURL: url,  
        };
    })
});

