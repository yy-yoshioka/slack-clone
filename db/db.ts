/*
<ai_context>
Initializes the database connection and schema for the app.
</ai_context>
*/

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: ".env.local" });

const schema = {};

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { schema });
