import 'dotenv/config'

import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import { usersTable } from './schema'

const db = drizzle(process.env.DATABASE_URL!)
