import { asc, eq, getTableColumns } from 'drizzle-orm'
import z from 'zod'

import { db } from '@/db'
import { fragments, messages } from '@/db/schema'
import { inngest } from '@/inngest/client'
import { baseProcedure, createTRPCRouter } from '@/trpc/init'

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'project id is required' }),
      })
    )
    .query(async ({ input }) => {
      const someMessages = await db
        .select({
          ...getTableColumns(messages),
          fragments: fragments,
        })
        .from(messages)
        .where(eq(messages.projectId, input.projectId))
        .leftJoin(fragments, eq(messages.id, fragments.messageId))
        .orderBy(asc(messages.updatedAt))

      return someMessages
    }),
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Message is required' })
          .max(1000, { message: 'value is too long' }),
        projectId: z.string().min(1, { message: 'project id is required' }),
      })
    )
    .mutation(async ({ input }) => {
      const createdMessage = await db.insert(messages).values({
        projectId: input.projectId,
        content: input.value,
        role: 'User',
        type: 'Result',
      })

      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      })

      return createdMessage
    }),
})
