import { relations } from 'drizzle-orm'
import {
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const messageRoleEnum = pgEnum('message_role', ['User', 'Assistant'])
export const messageTypeEnum = pgEnum('message_type', ['Result', 'Error'])

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  role: messageRoleEnum('role').notNull(),
  type: messageTypeEnum('type').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
})

export const fragments = pgTable('fragments', {
  id: uuid('id').defaultRandom().primaryKey(),
  sandboxUrl: text('sandbox_url').notNull(),
  title: text('title').notNull(),
  files: json('files').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  messageId: uuid('message_id')
    .notNull()
    .unique()
    .references(() => messages.id, { onDelete: 'cascade' }),
})

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// --- RELATIONS ---

// Define the relationships between tables for easy query fetching (like Prisma's include/select)
export const messagesRelations = relations(messages, ({ one }) => ({
  // Fragment is optional (?), so we use 'one' without a required constraint
  fragment: one(fragments, {
    fields: [messages.id], // The field in the 'messages' table
    references: [fragments.messageId], // The foreign key field in the 'fragments' table
  }),

  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
}))

export const fragmentsRelations = relations(fragments, ({ one }) => ({
  // The fragment must belong to one message
  message: one(messages, {
    fields: [fragments.messageId],
    references: [messages.id],
    relationName: 'FragmentToMessage', // Optional: Helps clarify the inverse relation name
  }),
}))

export const projectsRelations = relations(projects, ({ many }) => ({
  messages: many(messages),
}))
