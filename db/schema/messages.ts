import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { channels } from "./channels";
import { reactions } from "./reactions";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  channelId: uuid("channel_id")
    .references(() => channels.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  parentMessageId: uuid("parent_message_id").references(() => messages.id, {
    onDelete: "cascade",
  }),
  isThreadParent: boolean("is_thread_parent").default(false).notNull(),
  isEdited: boolean("is_edited").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one, many }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
  parentMessage: one(messages, {
    fields: [messages.parentMessageId],
    references: [messages.id],
  }),
  replies: many(messages, {
    relationName: "threadReplies",
  }),
  reactions: many(reactions),
}));

export const threadMessages = pgTable("thread_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  parentMessageId: uuid("parent_message_id")
    .references(() => messages.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  isEdited: boolean("is_edited").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const threadMessagesRelations = relations(
  threadMessages,
  ({ one, many }) => ({
    parentMessage: one(messages, {
      fields: [threadMessages.parentMessageId],
      references: [messages.id],
    }),
    user: one(users, {
      fields: [threadMessages.userId],
      references: [users.id],
    }),
    reactions: many(reactions),
  })
);
