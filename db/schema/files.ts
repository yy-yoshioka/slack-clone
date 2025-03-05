import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { messages } from "./messages";

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  messageId: uuid("message_id")
    .references(() => messages.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const filesRelations = relations(files, ({ one }) => ({
  message: one(messages, {
    fields: [files.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
}));
