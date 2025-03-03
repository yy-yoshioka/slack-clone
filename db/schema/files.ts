import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { channels } from "./channels";
import { messages, threadMessages } from "./messages";

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // MIME type
  size: integer("size").notNull(), // Size in bytes
  url: text("url").notNull(), // Supabase storage URL
  thumbnailUrl: text("thumbnail_url"),
  messageId: uuid("message_id").references(() => messages.id, {
    onDelete: "set null",
  }),
  threadMessageId: uuid("thread_message_id").references(
    () => threadMessages.id,
    { onDelete: "set null" }
  ),
  channelId: uuid("channel_id").references(() => channels.id, {
    onDelete: "set null",
  }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
  channel: one(channels, {
    fields: [files.channelId],
    references: [channels.id],
  }),
  message: one(messages, {
    fields: [files.messageId],
    references: [messages.id],
  }),
  threadMessage: one(threadMessages, {
    fields: [files.threadMessageId],
    references: [threadMessages.id],
  }),
}));
