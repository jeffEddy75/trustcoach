import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes publiques - SEULEMENT l'authentification (projet confidentiel)
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", // Webhooks Stripe doivent rester publics
]);

export default clerkMiddleware(async (auth, request) => {
  // Si la route n'est pas publique, protéger avec Clerk
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
