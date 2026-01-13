import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les routes API (elles gèrent leur propre auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Routes publiques - laisser passer
  const publicPaths = ["/", "/coaches", "/about", "/sign-in", "/sign-up", "/login", "/register"];
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Vérifier le cookie de session Clerk
  const sessionToken =
    request.cookies.get("__session")?.value ||
    request.cookies.get("__clerk_db_jwt")?.value;

  // Si pas de session et route protégée, rediriger vers sign-in
  if (!sessionToken) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match toutes les routes sauf les fichiers statiques
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
