ALTER TABLE "files" DROP CONSTRAINT "files_thread_message_id_thread_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_channel_id_channels_id_fk";
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_message_id_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "message_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "size";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "thumbnail_url";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "thread_message_id";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "channel_id";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "is_public";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "updated_at";