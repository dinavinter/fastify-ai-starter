import {FastifyPluginAsyncZod} from "fastify-type-provider-zod";

const docs: FastifyPluginAsyncZod<any> = async function (fastify) {
    await fastify.register(import('./openapi'));
    await fastify.register(import('./code'));
}

// @ts-ignore
docs[Symbol.for('skip-override')] = true
export default docs;