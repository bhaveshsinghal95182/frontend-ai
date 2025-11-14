import { z } from 'zod'

import { inngest } from '@/inngest/client'

import { baseProcedure, createTRPCRouter } from '../init'

export const appRouter = createTRPCRouter({
  invoke: baseProcedure
    .input(z.object({ value: z.string() }))
    .mutation(async ({ input }) => {
      await inngest.send({
        name: 'app/ticket.created',
        data: {
          value: input.value,
        },
      })
    }),
})

export type AppRouter = typeof appRouter
