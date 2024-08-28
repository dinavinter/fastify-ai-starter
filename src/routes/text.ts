import {FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import {EventMessage} from "fastify-sse-v2";
import { streamText} from "ai";
import {openaiGP4o} from "../sap-ai/openai";
import {z} from "zod";

const routes: FastifyPluginAsyncZod = async function (fastify, options) {
    async function* toMessage(iterable: AsyncIterable<string>): AsyncIterable<EventMessage> {
        let i=0;
        for await (const part of iterable) {
            yield {
                id: `${i++}`,
                data: part
            }
        }
        yield {
            event: 'done'
        }  
    }
 

    fastify.route({
        url: '/thought/text',
        method: 'GET',
        schema: {
            summary: "TEXT thought",
            description: "This route will generate a random thought using the GPT-4 model, and stream the thought to the client as a plain text stream. Writes. It sets the Content-Type header to text/plain and writes each text delta as a separate chunk.",
            response: {
                200:z.string().describe('The thought')
            }
        },
        handler: async function (_, reply) {
            const result = await streamText({
                model: openaiGP4o(),
                prompt: 'Think about a random topic, and then share that thought',
            });
            result.pipeTextStreamToResponse(reply.raw);
            return reply;
        }
    });
    
    fastify.route({
            url: '/thought/text/stream',
            method: 'GET',
            schema: {
                summary: "TEXT stream of thought",
                description: `This route will generate a random thought using the GPT-4 model, and stream the thought to the client as Server-Sent Events (SSE) messages.It sets the Content-Type header to text/event-stream and writes each text delta as a separate chunk.`,
                produces: ['text/event-stream'],
                response: {
                    200: z.string().describe('The thought text delta events')
                }
            },
            async handler(_, reply) {
                async function* streamTextResponse() {
                    const {textStream} = await streamText({
                        model: openaiGP4o(),
                        prompt: 'Think about a random topic, and then share that thought'
                    }); 
                     
                    for await (const part of textStream) {
                        yield {data: part}
                    }
                    
                     yield {  event: 'done', data: 'done' }
                }
                 
                return reply.sse(streamTextResponse());
            }
        }
    );
 
}
    
    
export default routes;
