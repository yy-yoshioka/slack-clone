import { sql } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { messages } from "../schema/messages";

export async function addParentMessageId() {
  return sql`
    ALTER TABLE "messages" 
    ADD COLUMN IF NOT EXISTS "parent_message_id" UUID REFERENCES "messages"("id") ON DELETE CASCADE;
  `;
}
