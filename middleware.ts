import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes publiques (accessibles sans authentification)
const publicRoutes = [
  "/",
  "/coaches",
  "/about",
  "/sign-in",
  "/sign-up",
  "/login",
  "/register",
  "/api/webhooks",
];

// Vérifier si une route est publique
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques - laisser passer
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Vérifier le cookie de session Clerk
  // Clerk stocke le token dans __session ou __clerk_db_jwt
  const sessionToken =
    request.cookies.get("__session")?.value ||
    request.cookies.get("__clerk_db_jwt")?.value;

  // Si pas de session et route protégée, rediriger vers sign-in
  if (!sessionToken) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Utilisateur connecté - laisser passer
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclure les fichiers statiques et Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Inclure les API routes
    "/(api|trpc)(.*)",
  ],
};
