import {FastifyPluginAsyncZod, jsonSchemaTransform} from "fastify-type-provider-zod";
import {FastifyReply} from "fastify";
import {EventMessage} from "fastify-sse-v2";
import {serializeSSEEvent} from "fastify-sse-v2/lib/sse";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import beautify, {html_beautify} from "js-beautify";
import {escape} from "node:querystring";
import {z} from "zod";

function prettyPrint(fn: Function) {
    return beautify.js(fn.toString(), {
        indent_size: 2,
        space_in_empty_paren: false,
        space_after_named_function: true,
        space_after_anon_function: true,
        brace_style: 'collapse',
        templating: ['django', 'erb', 'handlebars', 'php', 'smarty', 'angular']
    })
}
function sseUsages(routeOptions: {path: string, url: string}) {
    return `
<details open>
        <summary>Client Usages Examples </summary>
         
- EventSource 
\`\`\`javascript title="EventSource"
new EventSource('${routeOptions.url}').onmessage = console.log
\`\`\`
- Htmx Append
\`\`\`html title="HTMX Append"
<pre class="text-pretty" hx-ext="sse" sse-connect="${routeOptions.path}"  sse-swap="message" hx-swap="beforeend" sse-close="done"></pre>
\`\`\`
- Htmx Replace 
\`\`\`html title="HTMX Replace"
<div class="text-pretty" hx-ext="sse" sse-connect="${routeOptions.path}"  sse-swap="message" hx-swap="textContent transition:true swap:1s settle:1s" sse-close="done" />
\`\`\`

</details>
`;
}

function sourceCode(handler: Function) {
    return `
\`\`\`javascript title="source"
${prettyPrint(handler)}
\`\`\`

`;
}

const docs: FastifyPluginAsyncZod<any> = async function (fastify) {
    fastify.route({
        url: '/sse-proxy/done',
        method: 'GET',
        schema: {
            summary: "Proxy Server Sent Events Done",
            description: "This route will send a done event to the client to stop the server sent events"
        },
        async handler(request, reply) {
            reply.send(`<div>Done</div>`)
        }
    })

    fastify.route({
        url:'/sse-proxy',
        method: 'GET',
        schema: {
            summary: "Proxy Server Sent Events",
            description: "This route will proxy server sent events from another server to the client",
            querystring: z.object({
                url: z.string().describe('The url to proxy the server sent events from')
            }),
            response: {
                200: z.string().describe('HTML  page that consumes the server sent events')
            }
        },
        async handler(request, reply) {
            const {url} = request.query;
            reply.type('text/html');
            return    reply.send(`<html>
                    <head>
                         <script src="https://unpkg.com/htmx.org@2.0.2"></script>
                         <script src="https://unpkg.com/htmx-ext-sse@2.2.2/sse.js"></script>
                        <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp,container-queries"></script>
                    </head>
                    <body>  
                         <div hx-ext="sse" sse-connect="${url}" sse-close="done" hx-ext="sse" sse-swap="message" hx-swap="beforeend" class="h-screen w-screen"/>
                    </body>
                    </html> `
            );

        }
    })


    //swagger
    await fastify.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'AI SDK + SAP AI + Fastify',
                description: 'API documentation for AI SDK + SAP AI + Fastify',
                version: '1.0.0',
            },
            servers: [],
        },
        mode: 'dynamic',
        transform: jsonSchemaTransform,


    }); 

    //scalar/fastify-api-reference
    await fastify.register(import('@scalar/fastify-api-reference'), {
        routePrefix: '/reference',
        configuration: {

            spec: {
                content: () => fastify.swagger(),
            },
        },
    })

   
    //hook to allow the `try it` button in @scalar/fastify-api-reference with sse
    fastify.addHook('preHandler', (req, reply, next) => {
        if (req.headers['referer']?.endsWith('/reference') && !req.headers['accept']?.includes('text/event-stream')) {
            reply.sse = async function (this: FastifyReply, source: AsyncIterable<EventMessage>) {
                this.type("text/html");
                this.header("cache-control", "no-cache,no-transform");
                return this.send(`<embed type="text/html"  src="${req.protocol}://${req.hostname}/sse-proxy?url=${encodeURIComponent(req.url)}" style="width:100%;height:100%;" />`)
            }
        }
        next()
    })
    

    //hook to add source code to swagger docs 
    fastify.addHook('onRoute', (routeOptions) => {
        if (routeOptions.schema && routeOptions.schema.description && !("x-source" in routeOptions.schema)) {
           const handler = routeOptions.handler;
            // @ts-ignore
            routeOptions.schema["x-source"] = sourceCode(handler) 
            // @ts-ignore
            routeOptions.schema.description = `${(routeOptions.schema.description || "")}${routeOptions.schema["x-source"]}`

            if (routeOptions.schema?.produces?.includes('text/event-stream') && routeOptions.schema?.response instanceof Object && 200 in routeOptions.schema?.response && routeOptions.schema?.response?.[200] instanceof z.ZodSchema) {
                routeOptions.schema.response![200] = routeOptions.schema.response![200].describe(`${routeOptions.schema.response![200].description || "Server Sent Events (SSE)"}:: 
                      ${sseUsages(routeOptions)}`)
            }
        } 

    })


}
 

// @ts-ignore
docs[Symbol.for('skip-override')] = true
export default docs;
    
 