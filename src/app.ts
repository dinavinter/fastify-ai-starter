import   {FastifyPluginAsync} from 'fastify'


const app:FastifyPluginAsync= async function fastify( fastify, opts){
    await fastify.register(import('./routes/home')) 
    await fastify.register(import('./plugins/zod'))
    await fastify.register( import('./plugins/doc'))

    //routes
    await fastify.register(import('./routes/text'))
    await fastify.register(import('./routes/object'))
    await fastify.register(import('./routes/dom'))
    
    //sse plugin & sse proxy 
    await fastify.register( import('./plugins/sse'))


}

 

export default app;