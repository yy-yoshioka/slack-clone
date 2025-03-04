import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { messages } from "./messages";

export const reactions = pgTable("reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  emoji: text("emoji").notNull(),
  messageId: uuid("message_id")
    .references(() => messages.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
  message: one(messages, {
    fields: [reactions.messageId],
    references: [messages.id],
  }),
}));
