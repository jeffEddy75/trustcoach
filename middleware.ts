import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes publiques (accessibles sans authentification)
const isPublicRoute = createRouteMatcher([
  "/", // Homepage
  "/coaches(.*)", // Liste et profils coachs (publics)
  "/about(.*)", // Page à propos
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)", // Ancienne route (redirect)
  "/register(.*)", // Ancienne route (redirect)
  "/api/webhooks(.*)", // Webhooks Stripe
]);

export default clerkMiddleware(async (auth, req) => {
  // Si la route n'est pas publique, exiger une connexion
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // MODE DEV : Pas de vérification de rôle User/Coach
  // Tout utilisateur connecté a accès à tout (dashboard user + coach)
});

export const config = {
  matcher: [
    // Exclure les fichiers statiques et Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Inclure les API routes
    "/(api|trpc)(.*)",
  ],
};
