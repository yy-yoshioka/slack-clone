import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  // For migrations, use a separate connection with more timeout
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: "db/migrations" });

  console.log("Migrations completed successfully");

  // Close the connection
  await migrationClient.end();
  process.exit(0);
};

runMigration().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
