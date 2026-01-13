import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes publiques (même si elles commencent par un préfixe protégé)
const publicRoutes = ["/coaches"];
// Routes protégées
const protectedRoutes = ["/user", "/coach"];
// Routes réservées aux coachs
const coachRoutes = ["/coach"];
// Routes réservées aux admins
const adminRoutes = ["/admin"];
// Routes d'auth (redirige si déjà connecté)
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Vérifier d'abord si c'est une route publique
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isCoachRoute = coachRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Rediriger vers login si non connecté et route protégée
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Rediriger les coachs routes si pas coach
  if (isCoachRoute && userRole !== "COACH" && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/user", nextUrl));
  }

  // Rediriger les admin routes si pas admin
  if (isAdminRoute && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Rediriger vers dashboard si déjà connecté et sur auth route
  if (isAuthRoute && isLoggedIn) {
    const redirectTo = userRole === "COACH" ? "/coach" : "/user";
    return NextResponse.redirect(new URL(redirectTo, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|api/webhooks).*)",
  ],
};
