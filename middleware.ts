import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Security Middleware - Zero Trust Protocol
 * Implements CSP, HSTS, X-Frame-Options, RBAC and other security measures
 *
 * @see .github/agents/Master.agent.md - Section 3: Protocolo de Segurança
 */

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pulse-dev-secret-change-in-production"
);

const COOKIE_NAME = "pulse-auth-token";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/api/auth"];

// Admin-only routes (blocked for USER role)
const ADMIN_ROUTES = ["/dashboard", "/chats", "/users", "/settings"];

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ===========================================
  // AUTHENTICATION & RBAC
  // ===========================================

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isApiRoute = pathname.startsWith("/api");
  const isStaticRoute = pathname.startsWith("/_next") || pathname.includes(".");

  // Skip middleware for static files
  if (isStaticRoute) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from login
  if (pathname === "/login" && token) {
    const payload = await verifyToken(token);
    if (payload) {
      const redirectTo = payload.role === "USER" ? "/chat" : "/dashboard";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  // Redirect unauthenticated users to login
  if (!isPublicRoute && !isApiRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // RBAC: Block USER from admin routes
  if (isAdminRoute && token) {
    const payload = await verifyToken(token);
    if (payload && payload.role === "USER") {
      return NextResponse.redirect(new URL("/chat", request.url));
    }
  }

  // ===========================================
  // SECURITY HEADERS (Zero Trust)
  // ===========================================

  const response = NextResponse.next();

  // Get the app domain for CSP (supports Vercel preview URLs)
  const appDomain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const vercelDomain = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  
  // Content Security Policy (production-ready)
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    `connect-src 'self' https: wss: ${appDomain} ${vercelDomain} https://openrouter.ai https://*.vercel.app`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
