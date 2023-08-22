import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs";
import { Mock_Image } from "~/data/Mock_Image";
import AWS from "aws-sdk";

// Initialise AWS S3 Object
const s3 = new AWS.S3({
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    region: "eu-west-2",
  });

const BUCKET_NAME = "iconify-s3-bucket";

// Initialises and creates OpenAI object 
const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

// Function that submits prompt to Dall E API and returns URL of generated image
async function generateIcon(prompt: string): Promise<string | undefined>{
    if (env.MOCK_OPENAI === "true"){
        return Mock_Image
    }else{
        // Once sufficient credit is verified, submit the prompt to Dall E
        const response = await openai.createImage({
            prompt,
            n: 1,
            size: "512x512",
            response_format: "b64_json",
            });
        return response.data.data[0]?.b64_json;
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
        const base64EncodedImage = await generateIcon(input.prompt)

        const icon = await ctx.prisma.icon.create({
            data: {
                prompt: input.prompt,
                userId: ctx.session.user.id,
            },
        });

        // Save Image to S3 Bucket
        await s3
            .putObject({
                Bucket: BUCKET_NAME,
                Body: Buffer.from(base64EncodedImage!, "base64"),
                Key: icon.id,
                ContentEncoding: "base64",
                ContentType: "image/gif",

        })
        .promise();

        return {
          imageURL: `https://${BUCKET_NAME}.s3.eu-west-2.amazonaws.com/${icon.id}`,  
        };
    })
});

