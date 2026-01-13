# BRIEF CLAUDE CODE : Back-office Coach MVP

> **Objectif** : Créer les 3 vues essentielles du dashboard coach ce soir.
> **Temps estimé** : 2h30
> **Philosophie** : Le coach doit sentir que l'app gère son business, pas juste ses rendez-vous.

---

## 🎯 CONTEXTE STRATÉGIQUE

TrustCoach doit devenir le "Système d'Exploitation" du coach, comme TheFork pour les restaurateurs.

**Lock-in par la valeur** :
- Le coach utilise l'app pour préparer ses séances (résumés IA)
- Il voit sa progression business (revenus)
- Il a tout l'historique client (CRM)

**Ce soir, on pose les fondations avec 3 vues.**

---

## VUE 1 : Dashboard "Focus" (1h)

> *"Qu'est-ce que je dois faire dans les prochaines 48h ?"*

### Route
`/dashboard/coach` (page principale)

### Contenu

```
┌─────────────────────────────────────────────────────────────┐
│  Bonjour Thomas 👋                                          │
│  Vous avez 3 séances prévues dans les prochaines 48h        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 AUJOURD'HUI                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 14:00  Marie Dupont                                 │   │
│  │        Séance #4 • Gestion du stress                │   │
│  │        ⭐ Dernier moment marqué : "Déclic culpabilité" │  │
│  │        [Voir pré-brief]  [Démarrer séance]          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 17:00  Jean Martin                                  │   │
│  │        Séance #2 • Leadership                       │   │
│  │        💬 Nouveau message non lu                    │   │
│  │        [Voir pré-brief]  [Démarrer séance]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📅 DEMAIN                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 10:00  Sophie Durand                                │   │
│  │        Séance #1 • Première séance                  │   │
│  │        🆕 Nouveau client                            │   │
│  │        [Voir profil]  [Démarrer séance]             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  💰 Ce mois : 1 240 €  •  📊 8 séances réalisées           │
└─────────────────────────────────────────────────────────────┘
```

### Données à récupérer

```typescript
// actions/coach-dashboard.actions.ts

export async function getCoachDashboardData() {
  const { coach } = await requireCoach()
  
  const now = new Date()
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)
  
  // Bookings des prochaines 48h
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      coachId: coach.id,
      status: 'CONFIRMED',
      scheduledAt: {
        gte: now,
        lte: in48h,
      },
    },
    include: {
      user: true,
      session: {
        include: {
          markedMoments: true,
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  })
  
  // Stats du mois
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStats = await prisma.booking.aggregate({
    where: {
      coachId: coach.id,
      status: 'COMPLETED',
      scheduledAt: { gte: startOfMonth },
    },
    _sum: { price: true },
    _count: true,
  })
  
  // Nombre de séances précédentes par client (pour afficher "Séance #X")
  // ... (calculer depuis l'historique)
  
  return {
    upcomingBookings,
    monthRevenue: monthStats._sum.price ?? 0,
    monthSessions: monthStats._count,
  }
}
```

### Composants à créer

```
src/components/features/coach-dashboard/
├── CoachDashboard.tsx        # Vue principale
├── UpcomingSessionCard.tsx   # Card d'une séance à venir
├── QuickStats.tsx            # Stats du mois (footer)
└── PreBriefModal.tsx         # Modal pré-brief (résumé séance précédente)
```

### Pré-brief (modal au clic)

Quand le coach clique "Voir pré-brief", afficher :
- Résumé de la dernière séance avec ce client
- Moments marqués ⭐
- Objectifs en cours
- Messages échangés récemment (si messagerie implémentée)

---

## VUE 2 : Liste Clients "Active" (1h)

> *"Qui sont mes coachés et comment vont-ils ?"*

### Route
`/dashboard/coach/clients`

### Contenu

```
┌─────────────────────────────────────────────────────────────┐
│  👥 Mes clients (12)                     [Rechercher...]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filtres : [Tous ▼] [Actifs ▼] [Par dernière séance ▼]     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 Marie Dupont                              🟢 Actif │  │
│  │    8 séances • Dernière : il y a 3 jours            │   │
│  │    Objectif : "Oser dire non" — En cours            │   │
│  │    [Voir fiche]  [Envoyer message]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 Jean Martin                              🟡 À revoir│  │
│  │    2 séances • Dernière : il y a 3 semaines         │   │
│  │    ⚠️ Pas de séance prévue                          │   │
│  │    [Voir fiche]  [Envoyer message]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 Sophie Durand                           🔵 Nouveau │  │
│  │    0 séances • Première séance demain               │   │
│  │    [Voir fiche]  [Envoyer message]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Indicateur "Santé du coaching"

| Statut | Condition | Couleur |
|--------|-----------|---------|
| 🟢 Actif | Dernière séance < 2 semaines OU prochaine séance planifiée | Vert |
| 🟡 À revoir | Dernière séance > 2 semaines ET pas de prochaine séance | Orange |
| 🔵 Nouveau | 0 séances réalisées | Bleu |
| 🔴 Inactif | Dernière séance > 2 mois | Rouge |

### Données à récupérer

```typescript
// actions/coach-clients.actions.ts

export async function getCoachClients() {
  const { coach } = await requireCoach()
  
  // Tous les users qui ont eu au moins un booking avec ce coach
  const clients = await prisma.user.findMany({
    where: {
      bookings: {
        some: {
          coachId: coach.id,
        },
      },
    },
    include: {
      bookings: {
        where: { coachId: coach.id },
        orderBy: { scheduledAt: 'desc' },
        include: {
          session: true,
        },
      },
      goals: {
        where: { status: 'IN_PROGRESS' },
        take: 1,
      },
      // Conversation avec ce coach (si messagerie implémentée)
      conversations: {
        where: { coachId: coach.id },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  })
  
  // Calculer le statut de santé pour chaque client
  return clients.map(client => ({
    ...client,
    healthStatus: calculateHealthStatus(client.bookings),
    totalSessions: client.bookings.filter(b => b.status === 'COMPLETED').length,
    lastSessionDate: client.bookings[0]?.scheduledAt,
    nextSessionDate: client.bookings.find(b => 
      b.status === 'CONFIRMED' && b.scheduledAt > new Date()
    )?.scheduledAt,
  }))
}

function calculateHealthStatus(bookings: Booking[]): 'active' | 'review' | 'new' | 'inactive' {
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED')
  const upcomingBookings = bookings.filter(b => 
    b.status === 'CONFIRMED' && b.scheduledAt > new Date()
  )
  
  if (completedBookings.length === 0) return 'new'
  
  const lastSession = completedBookings[0]?.scheduledAt
  const daysSinceLastSession = lastSession 
    ? (Date.now() - lastSession.getTime()) / (1000 * 60 * 60 * 24)
    : Infinity
  
  if (daysSinceLastSession > 60) return 'inactive'
  if (daysSinceLastSession > 14 && upcomingBookings.length === 0) return 'review'
  return 'active'
}
```

### Composants à créer

```
src/components/features/coach-clients/
├── ClientList.tsx            # Liste avec filtres
├── ClientCard.tsx            # Card d'un client
├── HealthBadge.tsx           # Badge de statut santé
└── ClientFilters.tsx         # Filtres (statut, recherche)
```

---

## VUE 3 : Ledger Financier Simple (30min)

> *"Combien j'ai gagné ce mois ?"*

### Route
`/dashboard/coach/earnings` (ou section dans le dashboard principal)

### Contenu

```
┌─────────────────────────────────────────────────────────────┐
│  💰 Mes revenus                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   1 840 €   │  │    320 €    │  │   2 160 €   │         │
│  │  Ce mois    │  │  En attente │  │    Total    │         │
│  │  (12 séances)│  │ (2 séances) │  │  Janvier    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  📊 Historique                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Jan 2026 ████████████████████████████░░░░  1 840 €  │   │
│  │ Déc 2025 ████████████████████████████████  2 400 €  │   │
│  │ Nov 2025 ██████████████████░░░░░░░░░░░░░░  1 200 €  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📋 Dernières transactions                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 12 jan  Marie Dupont      Séance #4       80 €  ✅  │   │
│  │ 10 jan  Jean Martin       Séance #2      120 €  ✅  │   │
│  │ 15 jan  Sophie Durand     Séance #1       80 €  ⏳  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Exporter CSV]                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Statuts des paiements

| Icône | Statut | Description |
|-------|--------|-------------|
| ✅ | COMPLETED | Séance terminée, paiement reçu |
| ⏳ | PENDING | Séance à venir, paiement en attente |
| ❌ | REFUNDED | Annulé et remboursé |

### Données à récupérer

```typescript
// actions/coach-earnings.actions.ts

export async function getCoachEarnings() {
  const { coach } = await requireCoach()
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  
  // Revenus ce mois (séances complétées)
  const thisMonthCompleted = await prisma.booking.aggregate({
    where: {
      coachId: coach.id,
      status: 'COMPLETED',
      scheduledAt: { gte: startOfMonth },
    },
    _sum: { price: true },
    _count: true,
  })
  
  // Revenus en attente (séances confirmées, pas encore réalisées)
  const pending = await prisma.booking.aggregate({
    where: {
      coachId: coach.id,
      status: 'CONFIRMED',
      scheduledAt: { gte: now },
    },
    _sum: { price: true },
    _count: true,
  })
  
  // Historique par mois (6 derniers mois)
  const monthlyHistory = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "scheduledAt") as month,
      SUM(price) as total,
      COUNT(*) as sessions
    FROM "Booking"
    WHERE "coachId" = ${coach.id}
      AND status = 'COMPLETED'
      AND "scheduledAt" >= ${new Date(now.getFullYear(), now.getMonth() - 5, 1)}
    GROUP BY DATE_TRUNC('month', "scheduledAt")
    ORDER BY month DESC
  `
  
  // Dernières transactions
  const recentTransactions = await prisma.booking.findMany({
    where: {
      coachId: coach.id,
      status: { in: ['COMPLETED', 'CONFIRMED', 'CANCELLED'] },
    },
    include: { user: true },
    orderBy: { scheduledAt: 'desc' },
    take: 10,
  })
  
  return {
    thisMonth: {
      total: thisMonthCompleted._sum.price ?? 0,
      sessions: thisMonthCompleted._count,
    },
    pending: {
      total: pending._sum.price ?? 0,
      sessions: pending._count,
    },
    monthlyHistory,
    recentTransactions,
  }
}
```

### Composants à créer

```
src/components/features/coach-earnings/
├── EarningsOverview.tsx      # Les 3 cards (ce mois, en attente, total)
├── MonthlyChart.tsx          # Barres horizontales historique
├── TransactionList.tsx       # Liste des dernières transactions
└── ExportButton.tsx          # Export CSV
```

---

## 📁 STRUCTURE FINALE

```
src/
├── app/
│   └── (dashboard)/
│       └── coach/
│           ├── page.tsx              # Vue 1 : Dashboard Focus
│           ├── clients/
│           │   └── page.tsx          # Vue 2 : Liste Clients
│           └── earnings/
│               └── page.tsx          # Vue 3 : Ledger
│
├── actions/
│   ├── coach-dashboard.actions.ts
│   ├── coach-clients.actions.ts
│   └── coach-earnings.actions.ts
│
└── components/
    └── features/
        ├── coach-dashboard/
        │   ├── CoachDashboard.tsx
        │   ├── UpcomingSessionCard.tsx
        │   ├── QuickStats.tsx
        │   └── PreBriefModal.tsx
        │
        ├── coach-clients/
        │   ├── ClientList.tsx
        │   ├── ClientCard.tsx
        │   ├── HealthBadge.tsx
        │   └── ClientFilters.tsx
        │
        └── coach-earnings/
            ├── EarningsOverview.tsx
            ├── MonthlyChart.tsx
            ├── TransactionList.tsx
            └── ExportButton.tsx
```

---

## 🎨 DESIGN (Serene Clarity)

### Couleurs des indicateurs

```css
/* Santé coaching */
--health-active: #22C55E;    /* Vert */
--health-review: #F59E0B;    /* Orange */
--health-new: #3B82F6;       /* Bleu */
--health-inactive: #EF4444;  /* Rouge */

/* Paiements */
--payment-completed: #22C55E;
--payment-pending: #F59E0B;
--payment-refunded: #EF4444;
```

### Composants shadcn à utiliser

- `Card` pour les sections
- `Badge` pour les statuts
- `Avatar` pour les photos clients
- `Button` pour les actions
- `Skeleton` pour les loading states
- `Dialog` pour le pré-brief modal

---

## ✅ CHECKLIST

### Vue 1 : Dashboard Focus
- [ ] Route `/dashboard/coach` créée
- [ ] Server Action `getCoachDashboardData` fonctionne
- [ ] Liste des séances des 48h prochaines
- [ ] Card avec infos client + dernier moment marqué
- [ ] Bouton "Voir pré-brief" ouvre modal
- [ ] Bouton "Démarrer séance" (lien vers enregistrement)
- [ ] Stats du mois en footer

### Vue 2 : Liste Clients
- [ ] Route `/dashboard/coach/clients` créée
- [ ] Server Action `getCoachClients` fonctionne
- [ ] Calcul du statut santé par client
- [ ] Filtres fonctionnels
- [ ] Recherche par nom
- [ ] Bouton "Voir fiche" (nice to have)
- [ ] Bouton "Envoyer message" (si messagerie dispo)

### Vue 3 : Ledger
- [ ] Route `/dashboard/coach/earnings` créée
- [ ] Server Action `getCoachEarnings` fonctionne
- [ ] 3 cards : Ce mois / En attente / Total
- [ ] Historique 6 mois en barres
- [ ] Liste des dernières transactions
- [ ] Export CSV (nice to have)

---

## 🚀 ORDRE D'EXÉCUTION

1. **D'abord** : Créer les Server Actions (données)
2. **Ensuite** : Créer les composants (UI)
3. **Enfin** : Assembler les pages

**Commence par la Vue 1 (Dashboard Focus) car c'est la plus importante.**

---

**Montre-moi le Dashboard Focus une fois terminé avant de passer aux autres vues !**
