import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// サーバーコンポーネントでのみ実行されるようにする
if (typeof window !== "undefined") {
  throw new Error("このモジュールはサーバーサイドでのみ使用できます");
}

const queryClient = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(queryClient);

export { db };
