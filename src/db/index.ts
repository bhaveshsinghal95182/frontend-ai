import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless' // 👈 Changed from 'neon-http'

import * as schema from './schema'

// Use Pool instead of neon() to enable WebSockets (required for transactions)
const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

export const db = drizzle(pool, { schema })
