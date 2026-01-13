# SPECS.md — TrustCoach IA

> Spécifications fonctionnelles et roadmap MVP.
> Chaque tâche est découpée en "Vertical Slice" de 1-2h max.

---

## 🎯 VISION PRODUIT

**Problème** : Le coaching manque de traçabilité. Les utilisateurs oublient ce qui s'est dit en séance, les coachs perdent du temps en "rattrapage", et la confiance repose uniquement sur le bouche-à-oreille.

**Solution** : TrustCoach IA est le tiers de confiance qui :
1. **Vérifie** les coachs (diplômes, avis, badge de confiance)
2. **Capture** les séances (résumés IA automatiques)
3. **Accompagne** entre les séances (check-ins, rappels contextuels)

**Killer Feature** : Le résumé de séance IA — "Vivez votre séance à 100%, l'app retient pour vous."

---

## 👥 PERSONAS

### Persona 1 : Marie, 35 ans — Utilisatrice B2C
- **Besoin** : Gestion du stress, équilibre vie pro/perso
- **Frustration** : Oublie ce que dit son coach, perd sa motivation entre les séances
- **Attente** : Une app simple qui l'aide à suivre sa progression

### Persona 2 : Thomas, 42 ans — Coach bien-être
- **Besoin** : Gérer son agenda, fidéliser ses clients
- **Frustration** : Perd du temps à reprendre le fil à chaque séance
- **Attente** : Un outil qui prépare ses séances et valorise son expertise

### Persona 3 : Sophie, 50 ans — DRH (B2B)
- **Besoin** : Offrir du coaching à ses équipes, mesurer le ROI
- **Frustration** : Pas de visibilité sur l'utilisation du budget coaching, difficile de justifier l'investissement auprès du COMEX
- **Attente** : 
  - Un dashboard avec stats anonymisées
  - Une facturation entreprise simplifiée
  - Des coachs certifiés avec références entreprises
  - Un suivi des objectifs définis pour les coachés
- **Budget** : 50-100k€/an pour 20-50 collaborateurs
- **Critères de choix coach** : Méthodologies reconnues (ICF, EMCC), références grandes entreprises, disponibilité pour missions récurrentes

---

## 📋 ROADMAP MVP

### PHASE 1 : FONDATIONS (Semaine 1-2)

#### Task 1.1 : Setup projet (2h)
**Objectif** : Projet Next.js fonctionnel avec Capacitor configuré

**Critères d'acceptation** :
- [ ] `npm run dev` lance l'app sans erreur
- [ ] `npx cap sync` fonctionne
- [ ] Structure des dossiers conforme à ARCHITECTURE.md
- [ ] TypeScript strict activé
- [ ] Tailwind + shadcn/ui installés

**Commandes** :
```bash
npx create-next-app@latest trustcoach-app --typescript --tailwind --app
cd trustcoach-app
npm install @capacitor/core @capacitor/cli
npx cap init
npx shadcn-ui@latest init
```

---

#### Task 1.2 : Base de données Prisma (2h)
**Objectif** : Schéma initial avec tables User et Coach

**Critères d'acceptation** :
- [ ] `schema.prisma` avec modèles User, Coach, Account, Session (NextAuth)
- [ ] Migration initiale appliquée
- [ ] Seed de test avec 3 coachs fictifs
- [ ] Prisma Studio accessible

**Schéma minimal** :
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          Role      @default(USER)
  coach         Coach?
  bookings      Booking[]
  createdAt     DateTime  @default(now())
}

enum Role {
  USER
  COACH
  ADMIN
}

model Coach {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  bio           String?
  specialties   String[]
  hourlyRate    Int?
  verified      Boolean   @default(false)
  createdAt     DateTime  @default(now())
}
```

---

#### Task 1.3 : Authentification NextAuth (2h)
**Objectif** : Login/Register fonctionnel avec email

**Critères d'acceptation** :
- [ ] Page `/login` avec formulaire email + password
- [ ] Page `/register` avec rôle (User ou Coach)
- [ ] Session persistée
- [ ] Redirection après login
- [ ] Protection des routes `/dashboard/*`

**Edge cases** :
- Email déjà existant → Message d'erreur clair
- Mot de passe trop faible → Validation Zod

---

#### Task 1.4 : Layout et navigation (2h)
**Objectif** : Structure de base responsive

**Critères d'acceptation** :
- [ ] Header avec logo + menu + avatar user
- [ ] Sidebar dashboard (desktop)
- [ ] Bottom navigation (mobile)
- [ ] Dark mode toggle
- [ ] Responsive (mobile-first)

---

### PHASE 2 : PROFILS & RECHERCHE (Semaine 3-4)

#### Task 2.1 : Profil coach - Création (2h)
**Objectif** : Un coach peut créer/éditer son profil

**Critères d'acceptation** :
- [ ] Formulaire : Bio, spécialités, tarif horaire, photo
- [ ] Validation Zod
- [ ] Upload image (Cloudinary ou S3)
- [ ] États : Loading, Error, Success

---

#### Task 2.2 : Profil coach - Page publique (2h)
**Objectif** : Page `/coaches/[id]` accessible à tous

**Critères d'acceptation** :
- [ ] Affichage bio, spécialités, tarif
- [ ] Badge "Vérifié" si `verified: true`
- [ ] Bouton "Réserver une séance"
- [ ] SEO : meta title, description

---

#### Task 2.3 : Liste des coachs + filtres (2h)
**Objectif** : Page `/coaches` avec recherche

**Critères d'acceptation** :
- [ ] Liste en grille (cards)
- [ ] Filtres B2C : spécialité, tarif min/max, vérifié uniquement
- [ ] Filtres B2B : méthodologie, mode d'intervention, accepte entreprise
- [ ] Recherche par nom
- [ ] Pagination ou infinite scroll
- [ ] États : Loading, Empty, Error

**Filtres détaillés** :

| Filtre | Type | Options |
|--------|------|---------|
| Spécialité | Multi-select | Gestion du stress, Confiance, Leadership... |
| Tarif horaire | Range slider | 50€ - 300€ |
| Badge | Checkbox | Vérifié uniquement |
| Mode | Multi-select | Présentiel, Visio, Les deux |
| Méthodologie | Multi-select | MBTI, Process Com, Ennéagramme... |
| Intervention | Multi-select | Individuel, Équipe, Organisation |
| Entreprise | Checkbox | Accepte missions B2B |
| Ville | Autocomplete | Paris, Lyon, Remote... |

---

#### Task 2.4 : Profil utilisateur (1h)
**Objectif** : L'utilisateur peut éditer ses infos

**Critères d'acceptation** :
- [ ] Formulaire : Nom, email, avatar
- [ ] Validation
- [ ] Message de succès

---

### PHASE 3 : BOOKING (Semaine 5-6)

#### Task 3.1 : Calendrier coach - Disponibilités (2h)
**Objectif** : Le coach définit ses créneaux

**Critères d'acceptation** :
- [ ] Vue calendrier hebdomadaire
- [ ] Ajout/suppression de créneaux
- [ ] Récurrence (ex: tous les lundis 9h-12h)
- [ ] Sauvegarde en BDD

**Schéma Prisma** :
```prisma
model Availability {
  id        String   @id @default(cuid())
  coachId   String
  coach     Coach    @relation(fields: [coachId], references: [id])
  dayOfWeek Int      // 0-6 (dimanche-samedi)
  startTime String   // "09:00"
  endTime   String   // "12:00"
}
```

---

#### Task 3.2 : Sélection de créneau (2h)
**Objectif** : L'utilisateur choisit un créneau disponible

**Critères d'acceptation** :
- [ ] Affichage des créneaux libres (pas ceux déjà réservés)
- [ ] Sélection visuelle
- [ ] Résumé avant paiement (coach, date, heure, prix)

---

#### Task 3.3 : Paiement Stripe (2h)
**Objectif** : Paiement sécurisé

**Critères d'acceptation** :
- [ ] Intégration Stripe Checkout
- [ ] Webhook pour confirmer le paiement
- [ ] Création du Booking en BDD après paiement
- [ ] Email de confirmation

**Schéma Prisma** :
```prisma
model Booking {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  coachId       String
  coach         Coach         @relation(fields: [coachId], references: [id])
  scheduledAt   DateTime
  duration      Int           @default(60) // minutes
  price         Int           // en centimes
  status        BookingStatus @default(PENDING)
  stripePaymentId String?
  createdAt     DateTime      @default(now())
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

---

#### Task 3.4 : Mes réservations (utilisateur) (1h)
**Objectif** : Liste des séances passées et à venir

**Critères d'acceptation** :
- [ ] Onglets : À venir / Passées
- [ ] Bouton annuler (si > 24h avant)
- [ ] Lien vers le résumé (si séance passée)

---

#### Task 3.5 : Mes clients (coach) (1h)
**Objectif** : Le coach voit ses réservations

**Critères d'acceptation** :
- [ ] Liste des séances du jour
- [ ] Calendrier avec les réservations
- [ ] Accès au profil client

---

### PHASE 3.5 : MESSAGERIE ASYNCHRONE (Semaine 6-7) — Validé Gemini

> Feature stratégique pour éviter la désintermédiation (fuite vers WhatsApp).
> Pattern : Polling TanStack Query 10s (pas de WebSocket en MVP).

#### Décisions de design validées

| Aspect | Décision |
|--------|----------|
| Temps réel | Polling TanStack Query `refetchInterval: 10000` |
| Transition PROSPECT → ACTIVE | Auto dès paiement Stripe confirmé |
| Indicateur "Vu" / "En ligne" | ❌ NON (respecte l'asynchrone) |
| Pièces jointes | ❌ Texte uniquement (PDF via CoachDocument) |
| Archivage | Manuel uniquement |
| Modération | Lien "Signaler un problème" (pas de système en V1) |
| Scan IA pré-brief | Reporté V2 |

---

#### Task 3.6 : Modèle de conversation (1h)
**Objectif** : Structure de données pour le chat

**Critères d'acceptation** :
- [ ] Table `Conversation` avec `lastMessageAt` pour tri performant
- [ ] Table `ChatMessage` avec `senderId` et `senderType`
- [ ] Enum `ConversationStatus` : PROSPECT, ACTIVE, ARCHIVED
- [ ] Index sur `lastMessageAt` pour tri rapide
- [ ] Migration appliquée

**Schéma** : Voir PRISMA_SCHEMA.md section "Messagerie intégrée"

---

#### Task 3.7 : Modal "Contacter un coach" (1h)
**Objectif** : Préparer l'utilisateur avant d'ouvrir le chat

**Critères d'acceptation** :
- [ ] Bouton "Contacter" sur profil coach → ouvre modal
- [ ] Modal explique :
  - "Cet espace est dédié à la préparation de votre accompagnement"
  - "Vous pouvez envoyer jusqu'à 3 messages avant votre première séance"
- [ ] Bouton "Commencer la discussion" → ouvre/crée conversation
- [ ] Design Serene Clarity (pas intrusif)

---

#### Task 3.8 : Liste des conversations (2h)
**Objectif** : Voir toutes ses conversations

**Critères d'acceptation** :
- [ ] Page `/dashboard/user/messages` (côté user)
- [ ] Page `/dashboard/coach/messages` (côté coach)
- [ ] Liste triée par `lastMessageAt` DESC
- [ ] Chaque item affiche : avatar, nom, dernier message (tronqué), date
- [ ] Badge pastille Sage Green si messages non lus
- [ ] Empty state : "Commencez une discussion avec un coach pour éclaircir vos objectifs."

**Design** :
```
┌─────────────────────────────────────┐
│ 💬 Mes conversations                │
├─────────────────────────────────────┤
│ ┌─────┐                             │
│ │ 👤  │ Marie Dupont          ● 2   │
│ └─────┘ "Merci pour votre..."  14h  │
├─────────────────────────────────────┤
│ ┌─────┐                             │
│ │ 👤  │ Thomas Martin               │
│ └─────┘ "Je vous confirme..."  Hier │
└─────────────────────────────────────┘
```

---

#### Task 3.9 : Vue conversation / Chat (2h)
**Objectif** : Interface de chat style iMessage

**Critères d'acceptation** :
- [ ] Page `/dashboard/user/messages/[conversationId]`
- [ ] Header : avatar + nom du coach/user + bouton retour
- [ ] Historique des messages (scroll infini si > 50)
- [ ] Bulles de message avec `radius-lg`, coin pointu côté expéditeur
- [ ] Date du message visible (pas d'heure exacte pour rester "zen")
- [ ] PAS de "Vu" ni "En ligne" (décision Gemini)
- [ ] Polling TanStack Query toutes les 10s

**Design Serene Clarity** :
```
┌─────────────────────────────────────┐
│ ← Marie Dupont                      │
├─────────────────────────────────────┤
│                                     │
│         Bonjour, j'aimerais        │
│         savoir si votre            │
│         méthode convient...        │
│                          Aujourd'hui│
│                                     │
│  Bonjour ! Avec plaisir.           │
│  Ma méthode s'adapte à             │
│  chaque profil...                  │
│  Hier                              │
│                                     │
├─────────────────────────────────────┤
│ [  Votre message...          ] [→] │
└─────────────────────────────────────┘
```

---

#### Task 3.10 : Input et envoi de message (1h)
**Objectif** : Composer et envoyer un message

**Critères d'acceptation** :
- [ ] Textarea auto-expand (jusqu'à 4-5 lignes)
- [ ] Bouton envoi (icône →)
- [ ] Envoi au clic OU touche Entrée (Shift+Entrée = saut de ligne)
- [ ] Désactivé pendant l'envoi (loading state)
- [ ] Optimistic update (message apparaît immédiatement)
- [ ] Mise à jour `lastMessageAt` de la conversation

---

#### Task 3.11 : Garde-fou 3 messages (1h)
**Objectif** : Bloquer les users PROSPECT après 3 messages

**Règles métier** :
```typescript
// Dans sendMessage action :
if (conversation.status === 'PROSPECT' && senderType === 'USER') {
  const userMessageCount = await prisma.chatMessage.count({
    where: { conversationId, senderType: 'USER' }
  });
  if (userMessageCount >= 3) {
    return { error: 'LIMIT_REACHED' };
  }
}
```

**Critères d'acceptation** :
- [ ] Compteur de messages USER en mode PROSPECT
- [ ] À 3/3 : input désactivé + message d'alerte
- [ ] Wording : "Vous avez atteint la limite de messages gratuits. Pour approfondir cet échange et préparer votre travail, réservez votre première séance avec [Nom du Coach]."
- [ ] Bouton CTA "Réserver une séance" dans l'alerte
- [ ] Le coach peut toujours répondre (pas de limite)

---

#### Task 3.12 : Transition auto PROSPECT → ACTIVE (30min)
**Objectif** : Débloquer la messagerie après paiement

**Critères d'acceptation** :
- [ ] Dans le webhook Stripe `checkout.session.completed` :
  - Trouver la conversation entre user et coach
  - Si existe et status === PROSPECT → passer en ACTIVE
- [ ] L'utilisateur peut immédiatement envoyer plus de messages

---

#### Task 3.13 : Badge notifications (1h)
**Objectif** : Alerter des nouveaux messages

**Critères d'acceptation** :
- [ ] Badge numérique dans le menu (nombre de conversations avec non-lus)
- [ ] Pastille Sage Green (#88A096) sur l'icône messages
- [ ] Calcul : messages où `readAt IS NULL` et `senderId ≠ currentUser`
- [ ] Mise à jour du `readAt` quand on ouvre la conversation

---

#### Task 3.14 : Email notification (1h)
**Objectif** : Alerter par email si message non lu

**Critères d'acceptation** :
- [ ] Job/cron : si message non lu depuis > 1h → envoyer email
- [ ] Email simple : "Vous avez un nouveau message de [Nom]"
- [ ] Lien direct vers la conversation
- [ ] Max 1 email par conversation par 24h (anti-spam)
- [ ] Désactivable dans les préférences (nice to have)

---

#### Task 3.15 : Archivage manuel (30min)
**Objectif** : Permettre d'archiver une conversation

**Critères d'acceptation** :
- [ ] Menu "..." sur la conversation → "Archiver"
- [ ] Confirmation avant archivage
- [ ] Conversation disparaît de la liste principale
- [ ] Section "Archives" accessible (nice to have)
- [ ] Possibilité de désarchiver

---

### PHASE 4 : FEATURE IA - RÉSUMÉ DE SÉANCE (Semaine 7-8)

> ⚠️ C'est la KILLER FEATURE. À soigner particulièrement.

#### Task 4.1 : Enregistrement audio (mobile) (2h)
**Objectif** : L'utilisateur enregistre la séance

**Critères d'acceptation** :
- [ ] Bouton "Démarrer l'enregistrement"
- [ ] Timer visible pendant l'enregistrement
- [ ] Bouton "Marquer ce moment" (⭐)
- [ ] Bouton "Stop"
- [ ] Fichier audio sauvegardé localement
- [ ] Gestion des permissions micro

**Edge cases** :
- Permission refusée → Message explicatif
- Pas de connexion → File d'attente offline (voir Task 4.5)

---

#### Task 4.2 : Consentement RGPD (1h)
**Objectif** : Double opt-in avant enregistrement

**Critères d'acceptation** :
- [ ] Modal de consentement (utilisateur)
- [ ] Coach a déjà accepté (dans son profil)
- [ ] Enregistrement en BDD `Consent` avec horodatage
- [ ] Impossible d'enregistrer sans consentement

**Schéma Prisma** :
```prisma
model Consent {
  id          String      @id @default(cuid())
  sessionId   String
  session     Session     @relation(fields: [sessionId], references: [id])
  userId      String
  coachId     String
  type        ConsentType
  acceptedAt  DateTime    @default(now())
}

enum ConsentType {
  AUDIO_RECORDING
  DATA_PROCESSING
  SUMMARY_SHARING
}
```

---

#### Task 4.3 : Upload et transcription (2h)
**Objectif** : L'audio est envoyé et transcrit

**Critères d'acceptation** :
- [ ] Upload vers S3/Cloudinary
- [ ] Appel Whisper API pour transcription
- [ ] Stockage du transcript en BDD
- [ ] Indicateur de progression

**Service** :
```typescript
// services/ai.service.ts
export async function transcribeAudio(audioUrl: string): Promise<string> {
  // Appel OpenAI Whisper
}
```

---

#### Task 4.4 : Génération du résumé IA (2h)
**Objectif** : Claude génère un résumé structuré

**Critères d'acceptation** :
- [ ] Résumé en 3 parties : Points clés, Moments marqués, Actions à faire
- [ ] Stockage `summaryRaw` en BDD
- [ ] Affichage dans l'app
- [ ] Le coach peut éditer → `summaryFinal`

**Prompt Claude** :
```
Tu es un assistant de coaching. Voici la transcription d'une séance.
Génère un résumé structuré avec :
1. 📌 POINTS CLÉS (3-5 bullet points)
2. ⭐ MOMENTS MARQUÉS (basés sur les timestamps fournis)
3. ✅ ACTIONS À FAIRE (tâches concrètes pour le coaché)

Sois concis et bienveillant.
```

---

#### Task 4.5 : Mode offline (1h)
**Objectif** : L'audio est uploadé quand le réseau revient

**Critères d'acceptation** :
- [ ] Détection de connexion (`navigator.onLine`)
- [ ] File d'attente locale (IndexedDB ou Capacitor Storage)
- [ ] Upload automatique au retour du réseau
- [ ] Notification de succès

---

#### Task 4.6 : Historique des résumés (1h)
**Objectif** : L'utilisateur accède à tous ses résumés

**Critères d'acceptation** :
- [ ] Liste chronologique
- [ ] Recherche par mot-clé
- [ ] Export PDF (optionnel MVP)

---

### PHASE 5 : ENGAGEMENT (Post-MVP)

> Ces features sont prévues mais pas pour le MVP initial.

- Task 5.1 : Check-in quotidien
- Task 5.2 : Fil d'Ariane (timeline)
- Task 5.3 : Rappels contextuels
- Task 5.4 : Pré-brief coach
- Task 5.5 : Dashboard utilisateur (progression)
- Task 5.6 : Carte géographique des coachs

#### Task 5.6 : Carte géographique (4h) — Nice to have
**Objectif** : Visualiser les coachs sur une carte

**Critères d'acceptation** :
- [ ] Vue split-screen desktop (liste + carte)
- [ ] Bouton flottant "Voir la carte" sur mobile
- [ ] Marqueurs avec photo coach + tarif
- [ ] Filtre par rayon (5km, 10km, 20km)
- [ ] Style carte minimaliste (Serene Clarity)

**Stack recommandée** :
- Mapbox GL JS ou React-Leaflet
- Style de carte : Light/Minimaliste
- Marqueurs : Navy (#1A2B48) ou Sage (#88A096)

**Note** : Les champs `latitude/longitude` sont déjà dans le schéma Coach.
Géocodage des adresses via API Mapbox ou OpenCage au moment de la création du profil.

---

### PHASE 6 : B2B & ENTREPRISES (Post-MVP - ajout Gemini)

> Fonctionnalités pour le marché entreprise.

#### Task 6.1 : Profil coach enrichi B2B (2h)
**Objectif** : Ajouter les attributs recherchés par les RH

**Critères d'acceptation** :
- [ ] Champ méthodologies (MBTI, Process Com, Ennéagramme...)
- [ ] Modes d'intervention (Individuel, Équipe, Organisation)
- [ ] Toggle "Accepte les missions entreprise"
- [ ] Tarif journalier (en plus du tarif horaire)

---

#### Task 6.2 : Références entreprises (2h)
**Objectif** : Le coach peut afficher ses références clients

**Critères d'acceptation** :
- [ ] CRUD des références (entreprise, secteur, témoignage)
- [ ] Affichage sur le profil public (si `canDisplay = true`)
- [ ] Vérification manuelle par admin

---

#### Task 6.3 : Compte Organisation (2h)
**Objectif** : Une entreprise peut créer un compte pour ses employés

**Critères d'acceptation** :
- [ ] Page `/org/register` pour créer une organisation
- [ ] Infos légales (SIRET, TVA, adresse facturation)
- [ ] Dashboard admin org (ajouter/retirer des membres)

---

#### Task 6.4 : Tiers payeur (2h)
**Objectif** : L'entreprise paye pour ses employés

**Critères d'acceptation** :
- [ ] Flow booking avec `billingType = CORPORATE`
- [ ] Le coaché réserve, l'org est facturée
- [ ] Budget tracking (alertes si dépassement)
- [ ] Facturation mensuelle groupée

---

#### Task 6.5 : Dashboard RH (2h)
**Objectif** : Les RH voient des stats anonymisées

**Critères d'acceptation** :
- [ ] Nombre de séances réalisées ce mois
- [ ] Taux d'utilisation du budget
- [ ] Score de satisfaction moyen (sans détails individuels)
- [ ] Export CSV des stats

**⚠️ RGPD** : Jamais de données nominatives sur le contenu des séances.

---

#### Task 6.6 : Objectifs & KPIs (2h)
**Objectif** : Définir et suivre des objectifs mesurables

**Critères d'acceptation** :
- [ ] CRUD des objectifs (titre, valeur cible, date)
- [ ] Historique des mesures
- [ ] Graphique de progression
- [ ] Lien optionnel avec les séances

---

#### Task 6.7 : Documents de travail (2h)
**Objectif** : Uploader des tests de personnalité, évaluations

**Critères d'acceptation** :
- [ ] Upload PDF/image
- [ ] Partage coach ↔ coaché (avec consentement)
- [ ] Analyse IA optionnelle (résumé du document)
- [ ] Auto-suppression après X jours (configurable)

---

## 📱 ÉCRANS ET ÉTATS

### Matrice des états par écran

| Écran | Loading | Empty | Error | Success |
|-------|---------|-------|-------|---------|
| Liste coachs | Skeleton cards | "Aucun coach trouvé" | "Erreur de chargement" | Grille de coachs |
| Profil coach | Skeleton | - | "Coach introuvable" | Profil complet |
| Calendrier booking | Spinner | "Aucun créneau disponible" | "Erreur calendrier" | Créneaux cliquables |
| Mes réservations | Skeleton list | "Aucune réservation" | "Erreur de chargement" | Liste réservations |
| Résumé séance | "Génération en cours..." | - | "Erreur IA" | Résumé structuré |

---

## 🔐 RÈGLES MÉTIER

### Booking
1. Un créneau ne peut être réservé qu'une fois
2. Annulation gratuite jusqu'à 24h avant
3. Annulation < 24h → remboursement 50%
4. Le coach peut annuler (rare) → remboursement 100%

### Résumé IA
1. L'audio n'est jamais partagé (sauf consentement explicite)
2. Le coach peut éditer le résumé avant envoi
3. L'utilisateur peut supprimer son résumé à tout moment
4. Rétention audio : 30 jours, puis suppression

### Vérification Coach
1. Badge "Standard" : Email vérifié
2. Badge "Vérifié" : Diplômes vérifiés manuellement
3. Badge "Premium" : Vérifié + entretien vidéo

---

## 📊 MÉTRIQUES MVP

| Métrique | Cible MVP |
|----------|-----------|
| Temps d'inscription | < 2 min |
| Temps de réservation | < 3 clics |
| Taux de complétion résumé | > 80% |
| Note app store | > 4.5 |

---

*Dernière mise à jour : Janvier 2026*
