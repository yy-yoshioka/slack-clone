import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/users"; // スキーマをインポート

// サーバーコンポーネントでのみ実行されるようにする
if (typeof window !== "undefined") {
  throw new Error("このモジュールはサーバーサイドでのみ使用できます");
}

const queryClient = postgres(process.env.DATABASE_URL!, { max: 1 });
export const db = drizzle(queryClient, { schema }); // スキーマを追加
