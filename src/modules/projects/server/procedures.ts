import { TRPCError } from '@trpc/server'
import { desc, eq } from 'drizzle-orm'
import { generateSlug } from 'random-word-slugs'
import z from 'zod'

import { db } from '@/db'
import { messages, projects } from '@/db/schema'
import { inngest } from '@/inngest/client'
import { baseProcedure, createTRPCRouter } from '@/trpc/init'

export const projectsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: 'id is required' }),
      })
    )
    .query(async ({ input }) => {
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1)

      if (!existingProject) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' })
      }
      return existingProject
    }),
  getMany: baseProcedure.query(async () => {
    const someProjects = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.updatedAt))

    return someProjects
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'value is required' })
          .max(1000, { message: 'value is too long' }),
      })
    )
    .mutation(async ({ input }) => {
      // const createdProject = await db.insert(projects).values({
      //   name: generateSlug(2, {
      //     format: 'title',
      //   }),
      // })
      //
      const createdProject = await db.transaction(async (tx) => {
        const [newProject] = await tx
          .insert(projects)
          .values({
            name: generateSlug(2, {
              format: 'title',
            }),
          })
          .returning()

        await tx.insert(messages).values({
          content: input.value,
          role: 'User',
          type: 'Result',
          projectId: newProject.id,
        })

        return newProject
      })

      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
          projectId: createdProject.id,
        },
      })

      return createdProject
    }),
})
