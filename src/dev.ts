import Fastify from "fastify";

const app = Fastify({
    logger: {
        transport: {
            target: '@fastify/one-line-logger'
        }
    }
})

app.register(import('./app'))
 
app.listen({ port: 3000 }, function (err) {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})
