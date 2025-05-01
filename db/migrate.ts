// db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function runMigrations() {
  try {
    // Read the SQL migration file
    const sqlFilePath = path.join(__dirname, 'migrations', '20250501_add_payments_table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    // Execute the SQL
    await db.execute(sql);
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run migrations when this file is executed
runMigrations();