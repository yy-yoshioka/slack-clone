import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // セッションの更新を試みる
  try {
    await supabase.auth.getSession();
  } catch (error) {
    console.error("Session refresh error:", error);
  }

  return res;
}

// 特定のパスでのみミドルウェアを実行
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
