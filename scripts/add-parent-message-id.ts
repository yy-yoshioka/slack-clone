import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL is not defined");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    console.log("Adding parent_message_id column to messages table...");

    await db.execute(sql`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE;
    `);

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    console.log("Closing database connection...");
    await client.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
