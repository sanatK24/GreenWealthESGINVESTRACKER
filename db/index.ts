<<<<<<< HEAD
=======

>>>>>>> main
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
<<<<<<< HEAD
  max: 5, // Reduced from 10 to avoid connection limits
  idleTimeoutMillis: 10000, // Reduced from 30000 to 10000
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false,
    // Add Neon-specific SSL options
    ca: process.env.NEON_CA_CERT, // If using custom CA
    checkServerIdentity: () => undefined // Disable hostname verification
  }
});

// Add connection handling
pool.on('connect', (client) => {
  console.log('Database connection established');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Add cleanup on process exit
process.on('SIGINT', () => {
  pool.end().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

// Initialize drizzle with the pool or use JSON fallback
export const db = useJsonFallback ? await createJsonDb() : drizzle(pool, { schema });

=======
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

>>>>>>> main
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
