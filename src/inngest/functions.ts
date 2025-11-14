import { createAgent, gemini } from '@inngest/agent-kit'

import { inngest } from './client'

export default inngest.createFunction(
  { id: 'summarize-contents' },
  { event: 'app/ticket.created' },
  async ({ event }) => {
    const summarizer = createAgent({
      name: 'summarizer',
      system: 'You are an expert summarizer. You summarise in 2 words',
      model: gemini({ model: 'gemini-2.5-flash-lite-preview-06-17' }),
    })

    const { output } = await summarizer.run(event.data.value)
    console.log(output)

    return output
  }
)
