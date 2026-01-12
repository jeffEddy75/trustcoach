# TrustCoach IA

> Le tiers de confiance du coaching augmenté.

App de coaching B2C/B2B avec résumés IA des séances, suivi continu, et preuves par les résultats.

---

## 🚀 Démarrage rapide

### 1. Prérequis

```bash
node >= 18.0.0
npm >= 9.0.0
```

### 2. Installation

```bash
# Cloner le repo (ou créer le projet)
git clone [url] trustcoach-app
cd trustcoach-app

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# → Remplir les variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)

# Initialiser la BDD
npx prisma migrate dev
npx prisma db seed

# Lancer le dev server
npm run dev
```

### 3. Commandes utiles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run lint         # ESLint
npm run type-check   # TypeScript

# Prisma
npx prisma studio    # Visualiser la BDD
npx prisma migrate dev --name [name]  # Nouvelle migration
npx prisma db seed   # Seed de test

# Capacitor (mobile)
npx cap sync         # Synchroniser
npx cap open ios     # Ouvrir Xcode
npx cap open android # Ouvrir Android Studio
```

---

## 📁 Structure du projet

```
trustcoach-app/
├── CLAUDE.md              ← Lu automatiquement par Claude Code
├── docs/
│   ├── ARCHITECTURE.md    ← Décisions techniques + Design System
│   ├── SPECS.md           ← Roadmap MVP en micro-tâches
│   ├── DEFINITION_OF_DONE.md ← Checklists par type de tâche
│   └── PRISMA_SCHEMA.md   ← Documentation BDD
├── src/
│   ├── app/               ← Pages (App Router)
│   ├── actions/           ← Server Actions
│   ├── components/        ← UI (shadcn + features)
│   ├── services/          ← Logique métier
│   ├── hooks/             ← Hooks personnalisés
│   ├── lib/               ← Utils & config
│   ├── validations/       ← Schémas Zod
│   └── types/             ← Types TypeScript
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Constitution du projet, règles anti-dérive |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Stack, patterns, Design System |
| [SPECS.md](./docs/SPECS.md) | Roadmap MVP, user stories |
| [DEFINITION_OF_DONE.md](./docs/DEFINITION_OF_DONE.md) | Checklists de validation |
| [PRISMA_SCHEMA.md](./docs/PRISMA_SCHEMA.md) | Schéma BDD complet |

---

## 🛠️ Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript strict |
| BDD | PostgreSQL + Prisma |
| Auth | NextAuth.js v5 |
| UI | Tailwind CSS + shadcn/ui |
| State | Zustand + TanStack Query |
| Validation | Zod |
| Mobile | Capacitor |
| IA | Claude API + Whisper |
| Paiement | Stripe |

---

## 🎨 Design System

**Philosophie** : "Serene Clarity" — Calme, confiance, clarté, humanité.

- **Fonts** : DM Sans (headings), Inter (body), Literata (citations)
- **Couleurs** : Deep Navy, Sage Green, Muted Gold (accents)
- **Mode Silence** : Interface minimale pendant l'enregistrement

Voir [ARCHITECTURE.md](./docs/ARCHITECTURE.md#-design-system--serene-clarity) pour les détails.

---

## 📋 Roadmap MVP

| Phase | Durée | Focus |
|-------|-------|-------|
| 1. Fondations | 2 sem | Auth, Prisma, Layout |
| 2. Profils & Recherche | 2 sem | Coachs, filtres |
| 3. Booking | 2 sem | Calendrier, Stripe |
| 4. Feature IA | 2 sem | Résumé de séance |
| 5. Engagement | Post-MVP | Check-ins, timeline |
| 6. B2B | Post-MVP | Organisations, dashboard RH |

---

## 🤝 Workflow de développement

```
Jeff (Chef d'orchestre)
        │
        ▼
Claude Code (Exécution)
        │
        ▼
Gemini (Review architecture)
        │
        ▼
Jeff (Validation finale)
```

---

## 📄 Licence

Propriétaire — EDDY Studio © 2026
