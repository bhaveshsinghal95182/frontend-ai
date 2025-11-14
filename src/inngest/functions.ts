import { Sandbox } from '@e2b/code-interpreter'
import { createAgent, gemini } from '@inngest/agent-kit'

import { inngest } from './client'
import { getSandbox } from './utils'

export default inngest.createFunction(
  { id: 'summarize-contents' },
  { event: 'app/ticket.created' },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('some-nextjs-test-3')
      return sandbox.sandboxId
    })

    const summarizer = createAgent({
      name: 'summarizer',
      system: 'You are an expert summarizer. You summarise in 2 words',
      model: gemini({ model: 'gemini-2.5-flash-lite-preview-06-17' }),
    })

    const { output } = await summarizer.run(event.data.value)

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000)
      return `https://${host}`
    })

    return { output, sandboxUrl }
  }
)
