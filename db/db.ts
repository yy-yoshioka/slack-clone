/*
<ai_context>
Initializes the database connection and schema for the app.
</ai_context>
*/

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Check if we have the required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a postgres connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);

// Create a drizzle instance using the postgres connection
export const db = drizzle(client);
