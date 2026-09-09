import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * One build, three separately-deployed surfaces, selected by APP_MODE:
 *
 *   APP_MODE=landing  → the public marketing site      (lysp.ai)
 *   APP_MODE=firm     → the internal staff workspace   (app.lysp.ai)
 *   APP_MODE=portal   → the client-facing portal       (client.lysp.ai)
 *
 * Each deployment serves only its own routes and redirects anything else to the
 * surface that owns it, so the three can sit on separate hosts/ports without the
 * landing site shipping app code or vice versa.
 *
 * Running them on separate origins also isolates their sessions: firm and portal
 * each get their own localStorage, so a staff member with the workspace open no
 * longer clobbers a client-portal session (or vice versa).
 */

type Mode = "landing" | "firm" | "portal";

const PORTAL_PREFIXES = ["/client-portal", "/client-login", "/portal", "/api/client-auth"];

const FIRM_PREFIXES = [
  "/dashboard",
  "/analytics",
  "/approvals",
  "/audit-trail",
  "/clients",
  "/negotiations",
  "/pricing-requests",
  "/settings",
  "/account",
  "/login",
  // The login page used to live here. Kept in the firm prefix list so an old link or
  // bookmark is still recognised as belonging to this surface, then redirected below
  // rather than bounced to the marketing site.
  "/auth",
  "/api/auth",
];

const LANDING_PREFIXES = [
  "/about",
  "/blog",
  "/contact",
  "/privacy",
  "/product",
  "/roi-calculator",
  "/security",
];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function resolveMode(): Mode {
  const raw = process.env.APP_MODE;
  if (raw === "portal" || raw === "firm" || raw === "landing") return raw;
  // Default to the marketing site: it is the public entry point, and serving it
  // by accident is far less harmful than serving the staff workspace by accident.
  return "landing";
}

/** Redirect to another surface, preserving path + query. Falls back if unset. */
function crossOrigin(base: string | undefined, request: NextRequest, fallback: string) {
  if (!base) {
    return NextResponse.redirect(new URL(fallback, request.url));
  }
  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, base);
  return NextResponse.redirect(target);
}

export function middleware(request: NextRequest) {
  const mode = resolveMode();
  const { pathname } = request.nextUrl;

  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;

  const isPortal = matches(pathname, PORTAL_PREFIXES);
  const isFirm = matches(pathname, FIRM_PREFIXES);
  const isLanding = pathname === "/" || matches(pathname, LANDING_PREFIXES);

  if (mode === "landing") {
    // Marketing site. "Sign in" links point at /auth, which lives on the app —
    // redirecting here means the landing page's own markup never needs to know
    // the app's hostname.
    if (isFirm) return crossOrigin(appUrl, request, "/");
    if (isPortal) return crossOrigin(portalUrl, request, "/");
    return NextResponse.next();
  }

  if (mode === "firm") {
    // /auth moved to /login. Redirect rather than 404 so bookmarks and any link already
    // in the wild still land somewhere useful.
    if (pathname === "/auth" || pathname.startsWith("/auth/")) {
      const moved = request.nextUrl.clone();
      moved.pathname = pathname.replace(/^\/auth/, "/login");
      return NextResponse.redirect(moved);
    }
    if (isPortal) return crossOrigin(portalUrl, request, "/login");
    // Marketing pages belong to the landing site.
    if (isLanding && pathname !== "/") return crossOrigin(landingUrl, request, "/login");
    // The app has no marketing root of its own; send arrivals to the workspace
    // and let the auth guard bounce them to /auth if they are not signed in.
    if (pathname === "/") return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  // portal
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/client-login", request.url));
  }
  if (!isPortal) {
    if (isFirm) return crossOrigin(appUrl, request, "/client-login");
    if (isLanding) return crossOrigin(landingUrl, request, "/client-login");
    return NextResponse.redirect(new URL("/client-login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|robots.txt).*)"],
};
