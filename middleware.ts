import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security Middleware - Zero Trust Protocol
 * Implements CSP, HSTS, X-Frame-Options and other security headers
 *
 * @see .github/agents/Master.agent.md - Section 3: Protocolo de Segurança
 */
export function middleware(request: NextRequest) {
  // Clone the response
  const response = NextResponse.next();

  // ===========================================
  // SECURITY HEADERS (Zero Trust)
  // ===========================================

  // Content Security Policy
  // Restricts resources the page can load
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval in dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'", // Prevents embedding in iframes (clickjacking protection)
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspHeader);

  // HTTP Strict Transport Security
  // Forces HTTPS for 1 year, includes subdomains
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // X-Frame-Options (Legacy - CSP frame-ancestors is the modern approach)
  // Prevents clickjacking by disabling iframes
  response.headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options
  // Prevents MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // X-XSS-Protection
  // Legacy XSS filter (modern browsers use CSP instead)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy
  // Controls referrer information sent with requests
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy
  // Restricts browser features (camera, microphone, etc.)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // X-DNS-Prefetch-Control
  // Controls DNS prefetching
  response.headers.set("X-DNS-Prefetch-Control", "on");

  return response;
}

// Apply middleware to all routes except static files and API routes that need different handling
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public folder files
     */
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
