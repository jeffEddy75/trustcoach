# CLAUDE.md — TrustCoach IA

> **Ce fichier est lu automatiquement par Claude Code à chaque session.**
> Il constitue la "constitution" du projet. Ces règles sont NON NÉGOCIABLES.

---

## 🎯 IDENTITÉ DU PROJET

**TrustCoach IA** : Le tiers de confiance du coaching augmenté.

App de coaching B2C (bien-être) et B2B (professionnel) avec :
- Booking simplifié (recherche, réservation, paiement)
- Résumés IA des séances (visio ET présentiel)
- Accompagnement continu entre les séances

---

## 🛠️ STACK TECHNIQUE (FIGÉE)

```
Framework       : Next.js 15 (App Router)
Langage         : TypeScript strict (no any, no implicit)
Base de données : PostgreSQL + Prisma
Auth            : Clerk (@clerk/nextjs v6)
UI              : Tailwind CSS + shadcn/ui
State           : Zustand (global) + TanStack Query (server cache)
Validation      : Zod
Mobile          : Capacitor
IA              : Gemini API (résumés) + Whisper (transcription)
Paiement        : Stripe
```

**NE PAS ajouter de nouvelles dépendances sans validation explicite de Jeff.**

---

## 🚨 RÈGLES ANTI-DÉRIVE (CRITIQUES)

### Règle 1 : DIAGNOSTIC FIRST
```
❌ INTERDIT : Proposer du code sans avoir compris le problème
✅ OBLIGATOIRE : Logger les entrées/sorties AVANT tout diagnostic

Toute tâche de debug commence par :
console.log('[DEBUG]', { input, existingData, context });
```

### Règle 2 : NO PARALLEL SYSTEMS
```
❌ INTERDIT : Créer un nouveau fichier/composant/table sans vérifier l'existant
✅ OBLIGATOIRE : Chercher d'abord si quelque chose de similaire existe

Avant de créer :
1. Lister les fichiers existants dans le dossier concerné
2. Vérifier si un pattern similaire existe
3. ÉTENDRE l'existant plutôt que créer du nouveau
```

### Règle 3 : ERROR FIRST
```
❌ INTERDIT : Coder uniquement le "happy path"
✅ OBLIGATOIRE : Chaque action gère les erreurs

Pattern obligatoire pour les Server Actions :
export async function myAction(data: Input): Promise<ActionResult<Output>> {
  try {
    // logique
    return { data: result, error: null };
  } catch (error) {
    console.error('[ACTION_ERROR]', error);
    return { data: null, error: 'Message user-friendly' };
  }
}
```

### Règle 4 : MOBILE SAFETY
```
❌ INTERDIT : Appeler un plugin Capacitor sans vérification
✅ OBLIGATOIRE : Toujours vérifier la plateforme

import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Code natif
} else {
  // Fallback web ou message d'erreur
}
```

### Règle 5 : MICRO-TÂCHES
```
❌ INTERDIT : Sessions de plus de 2h sur une même feature
✅ OBLIGATOIRE : Découper en tranches verticales (Vertical Slice)

Une tâche = 1 feature complète et testable :
Table Prisma + Server Action + UI + Validation + États (loading/error/empty/success)
```

### Règle 6 : NEXT.JS SERVER/CLIENT COMPONENTS
```
❌ INTERDIT : Passer des composants React (icônes Lucide, etc.) de Server à Client Components
✅ OBLIGATOIRE : Utiliser "use client" sur les layouts/pages qui passent des composants aux enfants

Erreur typique : "Only plain objects can be passed to Client Components"
Solutions :
1. Ajouter "use client" au parent (layout.tsx)
2. Ou passer des strings/identifiants au lieu de composants React
3. Ou ne pas passer d'icônes aux composants partagés depuis Server Components
```

### Règle 7 : INPUTS DANS LES COMPOSANTS
```
❌ INTERDIT : Définir des composants avec inputs à l'intérieur d'autres composants (perte de focus)
✅ OBLIGATOIRE : Les inputs doivent être dans le JSX principal ou dans des composants séparés mémoïsés

Erreur typique : L'utilisateur doit recliquer sur l'input après chaque lettre
Cause : const MySubComponent = () => <Input ... /> défini dans le render
Solution : Mettre le JSX directement dans le return ou extraire dans un fichier séparé
```

### Règle 8 : RECHERCHE SUR TABLEAUX PRISMA
```
❌ INTERDIT : Utiliser { has: searchTerm } pour recherche partielle sur tableaux
✅ OBLIGATOIRE : Récupérer d'abord les valeurs matchées puis utiliser hasSome

Prisma `has` = correspondance EXACTE, pas partielle !
Pattern pour recherche partielle sur tableau de strings :
1. Récupérer toutes les valeurs uniques du tableau
2. Filtrer celles qui contiennent le terme (includes)
3. Utiliser hasSome avec les valeurs filtrées
```

### Règle 9 : CLERK MIDDLEWARE OBLIGATOIRE
```
❌ INTERDIT : Créer un middleware custom pour vérifier les cookies Clerk
✅ OBLIGATOIRE : Utiliser clerkMiddleware de @clerk/nextjs/server

Le middleware custom qui vérifie __session ou __clerk_db_jwt NE FONCTIONNE PAS !
Clerk nécessite son propre middleware pour initialiser le contexte auth().

Pattern obligatoire dans middleware.ts :
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

### Règle 10 : VÉRIFIER LES LIENS AVANT DE DEBUG L'AUTH
```
❌ INTERDIT : Debugger l'authentification sans vérifier où pointe le lien
✅ OBLIGATOIRE : En cas de problème de navigation, TOUJOURS vérifier le href du lien AVANT de toucher à l'auth

Erreur typique : "Je clique sur X mais ça m'envoie vers sign-up/sign-in"
Cause probable : Le lien pointe vers une route inexistante (/register, /login, etc.)

Avant de modifier auth.ts, middleware.ts ou les pages dashboard :
1. grep -r "href.*register\|href.*login" pour trouver les liens cassés
2. Vérifier que les liens pointent vers les bonnes routes (/sign-in, /sign-up, /coach, /user)
3. Les routes auth Clerk sont : /sign-in et /sign-up (PAS /login, /register)
```

---

## ✅ DEFINITION OF DONE (DoD)

### Pour chaque feature, TOUS ces critères doivent être cochés :

```markdown
- [ ] Code compilé sans erreur TypeScript
- [ ] UI gère les 4 états : Loading, Error, Empty, Success
- [ ] Formulaires validés avec Zod (client ET serveur)
- [ ] Edge cases identifiés et traités
- [ ] Console.log de debug supprimés ou préfixés [DEV]
- [ ] Test manuel effectué et documenté dans le commit
- [ ] Mobile : testé sur iOS ET Android (si applicable)
```

### Par type de tâche :

| Type | DoD spécifique |
|------|----------------|
| **Nouvelle page** | Route fonctionne, SEO meta, responsive, états gérés |
| **Nouveau composant** | Props typées, variants documentés, accessible |
| **Server Action** | Try/catch, validation Zod, retour `{ data, error }` |
| **Table Prisma** | Migration appliquée, seed de test, relations vérifiées |
| **Bug fix** | Cause racine identifiée, fix ciblé, non-régression vérifiée |

---

## 📁 STRUCTURE DU PROJET

```
/app                    → Pages & Routes (App Router)
  /api                  → Routes API (si nécessaire)
  /(auth)               → Pages auth (login, register)
  /(dashboard)          → Pages protégées
  /actions              → Server Actions groupées par domaine

/components
  /ui                   → Composants shadcn/ui (ne pas modifier)
  /features             → Composants métier (booking, session, etc.)
  /layout               → Header, Footer, Navigation

/services               → Logique métier découplée
  /ai.ts                → Claude API, Whisper
  /stripe.ts            → Paiement
  /email.ts             → Notifications email
  /storage.ts           → Upload fichiers

/hooks                  → Hooks personnalisés
  /useAudioRecorder.ts  → Enregistrement (mobile-only)
  /usePushNotifications.ts

/lib                    → Utils & Config
  /prisma.ts            → Client Prisma
  /utils.ts             → Helpers
  /validations.ts       → Schémas Zod partagés

/prisma
  /schema.prisma        → Schéma BDD
  /migrations           → Migrations

/public                 → Assets statiques
```

---

## 🔗 DOCUMENTS LIÉS

- `docs/ARCHITECTURE.md` → Décisions techniques détaillées
- `docs/SPECS.md` → Spécifications fonctionnelles et roadmap
- `docs/DEFINITION_OF_DONE.md` → Checklists détaillées par type de tâche
- `docs/PRISMA_SCHEMA.md` → Documentation du schéma BDD

---

## 🆘 EN CAS DE PROBLÈME

### Si Claude Code s'égare :
```
STOP. Relis le CLAUDE.md.
Quelle règle anti-dérive ai-je violée ?
```

### Si un bug persiste après 15 min :
```
1. Logger les données brutes (Règle 1)
2. Vérifier si le problème est côté client ou serveur
3. Isoler le composant/action problématique
4. Demander à Jeff avant de refactorer
```

### Si une feature prend plus de 2h :
```
1. STOP - La tâche est trop grosse
2. Découper en sous-tâches
3. Livrer ce qui fonctionne
4. Créer une nouvelle session pour la suite
```

---

## 📝 COMMANDES UTILES

```bash
# Développement
npm run dev                 # Lancer Next.js
npx prisma studio           # Visualiser la BDD
npx prisma db push          # Appliquer les changements schema
npx prisma migrate dev      # Créer une migration

# Mobile (Capacitor)
npx cap sync                # Synchroniser le build
npx cap open ios            # Ouvrir Xcode
npx cap open android        # Ouvrir Android Studio

# Vérifications
npm run lint                # ESLint
npm run type-check          # TypeScript
```

---

*Dernière mise à jour : 13 Janvier 2026*
*Version : 1.2.0*
