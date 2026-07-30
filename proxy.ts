import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/" ) {
    try {
      const session = await auth();
      if (session) {
        const lobbyUrl = new URL("/lobby", req.url);
        return NextResponse.redirect(lobbyUrl);
      }
    } catch {}
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
