import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(token);
  const isApi = req.nextUrl.pathname.startsWith("/api/");

  if (!session) {
    if (isApi) {
      return NextResponse.json({ error: "not_authenticated", message: "Please log in." }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return res;
  }

  // Authenticated users (including expired trials) may enter — the dashboard
  // shows a read-only state and the send API blocks sending until they upgrade.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/whatsapp/:path*"],
};
