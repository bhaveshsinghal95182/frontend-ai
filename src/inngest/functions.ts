import { Sandbox } from '@e2b/code-interpreter'
import {
  createAgent,
  createNetwork,
  createTool,
  gemini,
  Tool,
} from '@inngest/agent-kit'
import { z } from 'zod'

import { db } from '@/db'
import { fragments, messages } from '@/db/schema'
import { PROMPT } from '@/lib/prompt'

import { inngest } from './client'
import { getSandbox, lastAssistantTextMessageContent } from './utils'

interface AgentState {
  summary: string
  files: { [path: string]: string }
}

export default inngest.createFunction(
  { id: 'code-agent' },
  { event: 'code-agent/run' },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('some-nextjs-test-3')
      return sandbox.sandboxId
    })

    const codingAgent = createAgent<AgentState>({
      name: 'coding-agent',
      description: `An expert coding agent`,
      system: PROMPT,
      model: gemini({
        model: 'gemini-flash-latest',
        defaultParameters: {
          generationConfig: {
            temperature: 1.5,
          },
        },
      }),
      tools: [
        createTool({
          name: 'terminal',
          description: 'Use the terminal to run the commands',
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run('terminal', async () => {
              const buffers = { stdout: '', stderr: '' }
              try {
                const sandbox = await getSandbox(sandboxId)
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data
                  },
                })
                return result.stdout || result.stderr
              } catch (e) {
                console.error(
                  `Command Failed ${e} \nstdout: ${buffers.stdout} \nstderror : ${buffers.stderr}`
                )
              }
            })
          },
        }),

        createTool({
          name: 'createOrUpdateFile',
          description:
            'Create or update a SINGLE file in the sandbox. Do not use for multiple files at once.',
          parameters: z.object({
            path: z.string(),
            content: z.string(),
          }),
          handler: async (
            { path, content },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const result = await step?.run('createOrUpdateFile', async () => {
              try {
                const sandbox = await getSandbox(sandboxId)
                await sandbox.files.write(path, content)

                // Safely update state
                const currentFiles = { ...(network.state.data.files || {}) }
                currentFiles[path] = content
                return currentFiles
              } catch (e) {
                throw new Error(`Failed to write file ${path}: ${e}`)
              }
            })

            // Update global state
            if (result) {
              network.state.data.files = result
            }

            // IMPORTANT: Return a string confirmation to the model
            return `Successfully created/updated file: ${path}`
          },
        }),

        createTool({
          name: 'readFiles',
          description: 'Read files from the sandbox',
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run('readFiles', async () => {
              try {
                const sandbox = await getSandbox(sandboxId)
                const results = []

                // Read files individually so one failure doesn't break the loop
                for (const file of files) {
                  try {
                    const content = await sandbox.files.read(file)
                    results.push({ path: file, content, status: 'found' })
                  } catch {
                    results.push({
                      path: file,
                      content: null,
                      status: 'not_found',
                    })
                  }
                }
                return JSON.stringify(results)
              } catch (e) {
                return `Critical Error reading files: ${e}`
              }
            })
          },
        }),
        createTool({
          name: 'listFiles',
          description: 'List files in a directory to check what exists',
          parameters: z.object({
            path: z.string().default('.'),
          }),
          handler: async ({ path }, { step }) => {
            return await step?.run('listFiles', async () => {
              try {
                const sandbox = await getSandbox(sandboxId)
                // Run 'ls -R' to see recursive structure or just 'ls'
                const { stdout } = await sandbox.commands.run(`ls -R ${path}`)
                return stdout
              } catch (e) {
                return `Error listing files: ${e}`
              }
            })
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result)

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes('<task_summary>')) {
              network.state.data.summary = lastAssistantMessageText
            }
          }

          return result
        },
      },
    })

    const network = createNetwork<AgentState>({
      name: 'coding-agent-network',
      agents: [codingAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary

        if (summary) {
          return
        }

        return codingAgent
      },
    })

    // const { output } = await codingAgent.run(event.data.value)
    const result = await network.run(event.data.value)

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000)
      return `https://${host}`
    })

    await step.run('save-result', async () => {
      if (isError) {
        return await db.insert(messages).values({
          content: 'Something went wrong. Please try again',
          role: 'Assistant',
          type: 'Error',
        })
      }
      return await db.transaction(async (tx) => {
        const [newMessage] = await tx
          .insert(messages)
          .values({
            content: result.state.data.summary,
            role: 'Assistant',
            type: 'Result',
          })
          .returning()

        await tx.insert(fragments).values({
          messageId: newMessage.id,
          sandboxUrl: sandboxUrl,
          title: 'Fragment',
          files: result.state.data.files,
        })
      })
    })

    return {
      url: sandboxUrl,
      title: 'Fragment',
      files: result.state.data.files,
      summary: result.state.data.summary,
    }
  }
)
