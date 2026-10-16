import { NextResponse, type NextRequest } from "next/server";

// This retired deployment is intentionally unavailable after an IP/trademark
// complaint. Preserve its source on the backup branch; do not serve the former
// brand, landing pages, API routes or customer onboarding on this hostname.
export function middleware(_req: NextRequest) {
  return new NextResponse("This website has been retired. Please contact the site operator for assistance.", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

export const config = { matcher: "/:path*" };
