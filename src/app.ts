import Fastify, {FastifyPluginAsync} from 'fastify'
import fp from "fastify-plugin";


const plugins:FastifyPluginAsync= fp(async function fastify( fastify, opts){
    await fastify.register(import('./routes/home')) 
    await fastify.register(import('./plugins/zod'))
    await fastify.register( import('./plugins/doc'))

    //routes
    await fastify.register(import('./routes/text'))
    await fastify.register(import('./routes/object'))
    await fastify.register(import('./routes/dom'))
    
    //sse plugin & sse proxy 
    await fastify.register( import('./plugins/sse'))
    
    await fastify.register(import('./plugins/log'))

    //redirect default route to /reference
    fastify.get('/', async function (request, reply) {
        reply.redirect('/reference')
    })
     
})



async function createFastify() {
    const fastify = Fastify({ logger: true });

    fastify.register(plugins, { prefix: '/' });
    
    return {
        fastify,
        async ready() {
            await fastify.ready();
        } 
    };
}

export  default plugins;
export {createFastify};