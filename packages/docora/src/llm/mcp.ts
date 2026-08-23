import type { DocsConfig } from '../config/types'
import type { DocsSource } from '../content/index'
import { createMcpTools, type McpTool } from './mcp-tools'
import {
  ERROR_CODES,
  failure,
  isJsonRpcRequest,
  isNotification,
  negotiateVersion,
  result,
  type JsonRpcRequest,
} from './mcp-protocol'

export interface McpRouteOptions {
  name?: string
  version?: string
  tools?: McpTool[]
}

const JSON_HEADERS = { 'content-type': 'application/json' }

export function createMcpRoute(
  source: DocsSource,
  config: DocsConfig,
  options: McpRouteOptions = {},
) {
  const tools = options.tools ?? createMcpTools(source, config)
  const serverInfo = {
    name: options.name ?? config.site.name,
    version: options.version ?? '1.0.0',
  }

  async function handle(request: JsonRpcRequest) {
    switch (request.method) {
      case 'initialize':
        return result(request.id, {
          protocolVersion: negotiateVersion(request.params?.protocolVersion),
          capabilities: { tools: { listChanged: false } },
          serverInfo,
        })

      case 'ping':
        return result(request.id, {})

      case 'tools/list':
        return result(request.id, {
          tools: tools.map(({ name, description, inputSchema, annotations }) => ({
            name,
            description,
            inputSchema,
            ...(annotations ? { annotations } : {}),
          })),
        })

      case 'tools/call': {
        const name = request.params?.name
        const tool = tools.find(candidate => candidate.name === name)

        if (!tool) {
          return failure(request.id, {
            code: ERROR_CODES.invalidParams,
            message: `Unknown tool "${String(name)}"`,
          })
        }

        try {
          const output = await tool.handler(
            (request.params?.arguments as Record<string, unknown>) ?? {},
          )

          return result(request.id, {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          })
        } catch (error) {
          return result(request.id, {
            content: [{ type: 'text', text: (error as Error).message }],
            isError: true,
          })
        }
      }

      default:
        return failure(request.id, {
          code: ERROR_CODES.methodNotFound,
          message: `Unknown method "${request.method}"`,
        })
    }
  }

  return {
    async POST(request: Request) {
      let payload: unknown

      try {
        payload = await request.json()
      } catch {
        return Response.json(failure(null, { code: ERROR_CODES.parse, message: 'Invalid JSON' }), {
          headers: JSON_HEADERS,
        })
      }

      const batch = Array.isArray(payload) ? payload : [payload]
      const responses = []

      for (const entry of batch) {
        if (!isJsonRpcRequest(entry)) {
          responses.push(
            failure(null, { code: ERROR_CODES.invalidRequest, message: 'Invalid request' }),
          )
          continue
        }

        if (isNotification(entry)) continue
        responses.push(await handle(entry))
      }

      if (responses.length === 0) return new Response(null, { status: 202 })

      return Response.json(Array.isArray(payload) ? responses : responses[0], {
        headers: JSON_HEADERS,
      })
    },

    GET() {
      return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } })
    },

    DELETE() {
      return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } })
    },
  }
}

export { createMcpTools, type McpTool } from './mcp-tools'
export { SUPPORTED_PROTOCOL_VERSIONS } from './mcp-protocol'
