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
Auth            : NextAuth.js v5
UI              : Tailwind CSS + shadcn/ui
State           : Zustand (global) + TanStack Query (server cache)
Validation      : Zod
Mobile          : Capacitor
IA              : Claude API (résumés) + Whisper (transcription)
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

*Dernière mise à jour : Janvier 2026*
*Version : 1.0.0*
