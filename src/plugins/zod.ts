import {FastifyPluginAsync} from "fastify";
import {serializerCompiler, validatorCompiler, ZodTypeProvider} from "fastify-type-provider-zod";

export const zod:FastifyPluginAsync= async function fastify( fastify, opts){
    fastify =fastify.withTypeProvider<ZodTypeProvider>();
    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);
}

// @ts-ignore
zod[Symbol.for('skip-override')] = true
export default zod;