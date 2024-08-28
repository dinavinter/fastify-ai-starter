// Other imports
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import app from './app.js';


export const dynamic = 'force-dynamic'; // static by default, unless reading the request
export const config = {
        runtime: 'edge'
 }

const fastify = Fastify({ logger: true });

fastify.register(app, { prefix: '/' });

export default async (req: FastifyRequest, res: FastifyReply) => {
    try {
        await fastify.ready();
        fastify.server.emit('request', req, res);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};