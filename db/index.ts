
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema.js';
import fs from 'fs/promises';
import path from 'path';

// Required for Neon serverless driver
neonConfig.webSocketConstructor = ws;

const useJsonFallback = !process.env.DATABASE_URL;

async function createJsonDb() {
  const mockPool = {
    connect: async () => ({
      query: async () => ({ rows: [{ now: new Date() }] }),
      release: () => {}
    }),
    on: () => {},
    end: async () => {}
  };

  console.log('Database URL not found, using JSON files as fallback');
  return {
    query: {
      companies: {
        findMany: async () => {
          const data = await fs.readFile(path.join(process.cwd(), 'db-export', 'companies.json'), 'utf-8');
          return JSON.parse(data);
        }
      },
      // Add other collections as needed
    }
  };
}

// Initialize database or fallback
export const pool = useJsonFallback ? null : new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize drizzle with the pool or use JSON fallback
export const db = useJsonFallback ? await createJsonDb() : drizzle(pool, { schema });

// Add error handling for the pool
if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
}

// Add connection testing function
export async function testConnection() {
  try {
    if (useJsonFallback) {
      console.log('Using JSON files as database fallback');
      return true;
    }
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
}
