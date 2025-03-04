import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as users from "./schema/users";
import * as workspaces from "./schema/workspaces";
import * as channels from "./schema/channels";

// サーバーコンポーネントでのみ実行されるようにする
if (typeof window !== "undefined") {
  throw new Error("このモジュールはサーバーサイドでのみ使用できます");
}

const queryClient = postgres(process.env.DATABASE_URL!, { max: 1 });
export const db = drizzle(queryClient, {
  schema: { ...users, ...workspaces, ...channels },
});
