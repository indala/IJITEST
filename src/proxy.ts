import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getExternalUrl(path: string, req: NextRequest): URL {
  // If local development, use req.url directly to avoid host/protocol mismatch CORS errors
  if (req.nextUrl.hostname === "localhost" || req.nextUrl.hostname === "127.0.0.1") {
    return new URL(path, req.url);
  }

  const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const host = hostHeader || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || "http";
  
  // Make sure to clean up host if it has multiple entries (some proxies append them)
  const cleanHost = (host.split(",")[0] || "").trim();
  
  return new URL(path, `${proto}://${cleanHost}`);
}

function isFetchRequest(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  const requestedWith = req.headers.get("x-requested-with") || "";
  const isJson = accept.includes("application/json") || requestedWith === "XMLHttpRequest";
  const isNonGet = req.method !== "GET";
  
  return isJson || isNonGet;
}

export default withAuth(
  function proxy(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if user is authenticated
    if (!token && path !== "/login") {
      const isRsc = req.nextUrl.searchParams.has("_rsc") || 
                    req.headers.get("x-next-rsc") !== null || 
                    req.headers.get("rsc") !== null;
      const isAction = req.headers.get("next-action") !== null;

      if (isRsc) {
        return NextResponse.redirect(getExternalUrl("/login", req));
      }

      if (isAction || isFetchRequest(req)) {
        return new NextResponse(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return NextResponse.redirect(getExternalUrl("/login", req));
    }

    // Authenticated users redirection optimization
    if (token) {
      const role = (token.role as string) || 'reviewer';

      // Redirect authenticated users away from /login
      if (path === "/login") {
        return NextResponse.redirect(getExternalUrl(`/${role}`, req));
      }

      // Direct Role-based protection (single-hop redirect)
      if (path.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(getExternalUrl(`/${role}`, req));
      }
      if (path.startsWith("/editor") && !["admin", "editor"].includes(role)) {
        return NextResponse.redirect(getExternalUrl(`/${role}`, req));
      }
      if (path.startsWith("/reviewer") && !["admin", "editor", "reviewer"].includes(role)) {
        return NextResponse.redirect(getExternalUrl(`/${role}`, req));
      }
      if (path.startsWith("/author") && role !== "author") {
        return NextResponse.redirect(getExternalUrl(`/${role}`, req));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
    pages: {
      signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET as string,
  }
);

// Matcher MUST be specific to avoid intercepting NextAuth API routes which cause CLIENT_FETCH_ERROR
export const config = {
  matcher: [
    "/admin/:path*",
    "/editor/:path*",
    "/reviewer/:path*",
    "/author/:path*",
    "/login",
  ],
};
