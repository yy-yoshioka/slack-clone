ALTER TABLE "reactions" DROP CONSTRAINT "reactions_thread_message_id_thread_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "emoji" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "message_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" DROP COLUMN "thread_message_id";