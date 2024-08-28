import Fastify from 'fastify'
import FastifySSEPlugin from "fastify-sse-v2";
import { serializerCompiler, validatorCompiler, ZodTypeProvider} from "fastify-type-provider-zod";
 
 
//Fastify server, refer to https://fastify.dev/docs/latest/Guides/Getting-Started/
const fastify = Fastify({
    logger: {
        level: 'info' // 'info' | 'warn' | 'error' 
    }
}).withTypeProvider<ZodTypeProvider>(); 

//zod type provider
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

await fastify.register(import('./routes/home'));

await fastify.register( import('./docs'))


//sse 
await fastify.register(FastifySSEPlugin);


//routes
await fastify.register(import('./routes/text'));
await fastify.register(import('./routes/object'));
await fastify.register(import('./routes/dom'));





// Run the server!
fastify.listen({ port: 3000 }, function (err) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})

