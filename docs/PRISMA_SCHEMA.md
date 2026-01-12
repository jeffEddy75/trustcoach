# PRISMA_SCHEMA.md — TrustCoach IA

> Documentation complète du schéma de base de données.
> Ce fichier documente chaque modèle, ses relations et ses règles métier.

---

## 📊 VUE D'ENSEMBLE

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│    Coach    │────▶│ Availability│
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   
       │                   ├──▶ CoachReference (B2B)
       │                   └──▶ Certification
       │
       ├──▶ OrganizationMember ──▶ Organization (B2B)
       │
       ▼                   
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Booking   │────▶│   Session   │────▶│   Consent   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   ├──▶ MarkedMoment
       │                   └──▶ CoachDocument
       ▼                   
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Payment   │     │    Goal     │────▶│GoalMeasurement│
└─────────────┘     └─────────────┘     └─────────────┘
```

### Légende
- **Modèles B2C** : User, Coach, Booking, Session, Payment
- **Modèles B2B** : Organization, OrganizationMember, CoachReference, Goal, CoachDocument

---

## 🗄️ SCHÉMA PRISMA COMPLET

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTH & USERS (NextAuth.js compatible)
// ============================================

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// USER
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  password      String?   // Hashed, null si OAuth
  role          Role      @default(USER)
  
  // Relations
  accounts      Account[]
  coach         Coach?
  bookings      Booking[]
  checkIns      CheckIn[]
  consents      Consent[]
  
  // B2B : Appartenance à une organisation
  organizations OrganizationMember[]
  goals         Goal[]
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
}

enum Role {
  USER      // Client qui réserve des séances
  COACH     // Coach qui propose des séances
  ADMIN     // Admin plateforme
}

// ============================================
// COACH
// ============================================

model Coach {
  id            String      @id @default(cuid())
  userId        String      @unique
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Profil public
  bio           String?     @db.Text
  headline      String?     // "Coach en développement personnel"
  specialties   String[]    // ["Gestion du stress", "Confiance en soi"]
  languages     String[]    @default(["fr"])
  
  // =============================================
  // ATTRIBUTS B2B (ajout Gemini)
  // =============================================
  
  // Méthodologies certifiées (Process Com, MBTI, etc.)
  methodologies     String[]    // ["MBTI", "Process Com", "Ennéagramme", "360° Feedback"]
  
  // Modes d'intervention
  interventionModes InterventionMode[] @default([INDIVIDUAL])
  
  // Cible client
  targetAudience    TargetAudience[] @default([INDIVIDUAL])
  
  // Accepte les missions entreprise
  acceptsCorporate  Boolean     @default(false)
  
  // Tarification
  hourlyRate    Int?        // En centimes (ex: 8000 = 80€)
  dailyRate     Int?        // Tarif journalier B2B (ex: 150000 = 1500€)
  currency      String      @default("EUR")
  
  // Médias
  avatarUrl     String?
  videoUrl      String?     // Vidéo de présentation
  
  // Vérification & Badge
  verified      Boolean     @default(false)
  badgeLevel    BadgeLevel  @default(STANDARD)
  verifiedAt    DateTime?
  
  // Localisation
  city          String?
  country       String?     @default("FR")
  timezone      String      @default("Europe/Paris")
  
  // Géolocalisation (pour future carte - Phase 5)
  latitude      Float?
  longitude     Float?
  
  // Modes de coaching
  offersInPerson Boolean    @default(true)
  offersRemote   Boolean    @default(true)
  
  // Statistiques (dénormalisées pour performance)
  totalSessions Int         @default(0)
  averageRating Float?
  
  // Relations
  availabilities    Availability[]
  bookings          Booking[]
  consents          Consent[]
  references        CoachReference[]    // Références entreprises
  certifications    Certification[]     // Diplômes et certifications
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([verified])
  @@index([specialties])
  @@index([city])
  @@index([acceptsCorporate])
  @@index([methodologies])
}

// =============================================
// ENUMS B2B
// =============================================

enum InterventionMode {
  INDIVIDUAL      // Coaching individuel
  TEAM            // Coaching d'équipe
  ORGANIZATION    // Coaching d'organisation
  GROUP           // Ateliers collectifs
}

enum TargetAudience {
  INDIVIDUAL      // Particuliers (B2C)
  EXECUTIVE       // Dirigeants / Cadres sup
  MANAGER         // Managers intermédiaires
  EMPLOYEE        // Collaborateurs
  ENTREPRENEUR    // Entrepreneurs / Indépendants
}

// =============================================
// RÉFÉRENCES ENTREPRISES (ajout Gemini)
// =============================================

model CoachReference {
  id            String    @id @default(cuid())
  coachId       String
  coach         Coach     @relation(fields: [coachId], references: [id], onDelete: Cascade)
  
  // Entreprise
  companyName   String    // "LVMH", "BNP Paribas"
  sector        String?   // "Luxe", "Banque"
  
  // Mission
  missionType   String?   // "Coaching dirigeants", "Accompagnement fusion"
  year          Int?      // Année de la mission
  
  // Témoignage (optionnel, avec accord)
  testimonial   String?   @db.Text
  contactName   String?   // "Marie D., DRH"
  canDisplay    Boolean   @default(true) // Affichable publiquement
  
  createdAt     DateTime  @default(now())

  @@index([coachId])
}

// =============================================
// CERTIFICATIONS (ajout Gemini)
// =============================================

model Certification {
  id              String    @id @default(cuid())
  coachId         String
  coach           Coach     @relation(fields: [coachId], references: [id], onDelete: Cascade)
  
  name            String    // "Certification ICF PCC"
  issuer          String    // "International Coaching Federation"
  year            Int?
  expiresAt       DateTime? // Certaines certifications expirent
  
  // Vérification
  verified        Boolean   @default(false)
  verifiedAt      DateTime?
  documentUrl     String?   // URL du diplôme scanné
  
  createdAt       DateTime  @default(now())

  @@index([coachId])
}

enum BadgeLevel {
  STANDARD  // Email vérifié
  VERIFIED  // Diplômes vérifiés manuellement
  PREMIUM   // Vérifié + entretien vidéo
}

// ============================================
// AVAILABILITY (Disponibilités récurrentes)
// ============================================

model Availability {
  id          String   @id @default(cuid())
  coachId     String
  coach       Coach    @relation(fields: [coachId], references: [id], onDelete: Cascade)
  
  dayOfWeek   Int      // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  startTime   String   // Format "HH:mm" (ex: "09:00")
  endTime     String   // Format "HH:mm" (ex: "12:00")
  
  // Optionnel : exceptions de dates
  validFrom   DateTime?
  validUntil  DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([coachId])
  @@index([dayOfWeek])
}

// ============================================
// BOOKING (Réservation)
// ============================================

model Booking {
  id            String        @id @default(cuid())
  
  // Participants
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  coachId       String
  coach         Coach         @relation(fields: [coachId], references: [id])
  
  // =============================================
  // B2B : Facturation entreprise (ajout Gemini)
  // =============================================
  billingType   BillingType   @default(INDIVIDUAL)
  organizationId String?      // Si payé par une entreprise
  organization  Organization? @relation(fields: [organizationId], references: [id])
  
  // Planification
  scheduledAt   DateTime      // Date et heure de début
  duration      Int           @default(60) // En minutes
  timezone      String        @default("Europe/Paris")
  
  // Mode
  mode          BookingMode   @default(REMOTE)
  location      String?       // Adresse si présentiel
  meetingUrl    String?       // Lien visio si remote
  
  // Tarification
  price         Int           // En centimes
  currency      String        @default("EUR")
  
  // Statut
  status        BookingStatus @default(PENDING)
  cancelledAt   DateTime?
  cancelledBy   String?       // userId de celui qui annule
  cancellationReason String?
  
  // Relations
  payment       Payment?
  session       Session?
  
  // Timestamps
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([userId])
  @@index([coachId])
  @@index([scheduledAt])
  @@index([status])
  @@index([organizationId])
  @@index([billingType])
}

// =============================================
// TYPE DE FACTURATION (ajout Gemini)
// =============================================
enum BillingType {
  INDIVIDUAL    // L'utilisateur paye lui-même
  CORPORATE     // L'entreprise paye (tiers payeur)
}

enum BookingMode {
  REMOTE      // Visioconférence
  IN_PERSON   // Présentiel
}

enum BookingStatus {
  PENDING     // En attente de paiement
  CONFIRMED   // Payé, à venir
  IN_PROGRESS // Séance en cours
  COMPLETED   // Séance terminée
  CANCELLED   // Annulée
  NO_SHOW     // Client absent
}

// ============================================
// PAYMENT (Paiement Stripe)
// ============================================

model Payment {
  id                String        @id @default(cuid())
  bookingId         String        @unique
  booking           Booking       @relation(fields: [bookingId], references: [id])
  
  // Stripe
  stripePaymentIntentId String?   @unique
  stripeSessionId       String?
  
  // Montants
  amount            Int           // En centimes
  platformFee       Int           // Commission plateforme
  coachPayout       Int           // Montant reversé au coach
  currency          String        @default("EUR")
  
  // Statut
  status            PaymentStatus @default(PENDING)
  paidAt            DateTime?
  refundedAt        DateTime?
  refundAmount      Int?
  
  // Timestamps
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([stripePaymentIntentId])
}

enum PaymentStatus {
  PENDING     // En attente
  SUCCEEDED   // Réussi
  FAILED      // Échoué
  REFUNDED    // Remboursé
  PARTIAL_REFUND // Remboursement partiel
}

// ============================================
// SESSION (Séance de coaching + Résumé IA)
// ============================================

model Session {
  id            String        @id @default(cuid())
  bookingId     String        @unique
  booking       Booking       @relation(fields: [bookingId], references: [id])
  
  // =============================================
  // STATUT DE TRAITEMENT (ajout Gemini)
  // Permet de suivre le pipeline audio → résumé
  // =============================================
  status        SessionStatus @default(IDLE)
  statusMessage String?       // Message d'erreur si FAILED
  
  // Audio
  audioUrl      String?       // URL S3/Cloudinary
  audioSize     Int?          // Taille en bytes (pour monitoring)
  audioDuration Int?          // Durée en secondes
  audioFormat   String?       // "webm", "mp3", "m4a"
  
  // Transcription (Whisper)
  transcript    String?       @db.Text
  transcribedAt DateTime?
  
  // Résumé IA (Claude)
  // =============================================
  // summaryRaw   = Version brute générée par l'IA
  // summaryFinal = Version validée/éditée par le coach
  // =============================================
  summaryRaw    String?       @db.Text
  summaryFinal  String?       @db.Text
  summarizedAt  DateTime?
  
  // Métadonnées
  markedMoments MarkedMoment[]
  
  // Relations
  consents      Consent[]
  
  // Timestamps
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([status])
}

// =============================================
// SESSION STATUS (ajout Gemini)
// Pipeline complet de traitement
// =============================================
enum SessionStatus {
  IDLE          // Pas encore d'enregistrement
  RECORDING     // Enregistrement en cours
  UPLOADING     // Upload vers le cloud
  UPLOAD_FAILED // Échec upload (retry possible)
  TRANSCRIBING  // Transcription Whisper en cours
  TRANSCRIBE_FAILED // Échec transcription
  SUMMARIZING   // Génération résumé Claude en cours
  SUMMARIZE_FAILED // Échec résumé
  COMPLETED     // Tout est terminé
  FAILED        // Échec global
}

// ============================================
// MARKED MOMENT (Moments marqués pendant séance)
// ============================================

model MarkedMoment {
  id          String   @id @default(cuid())
  sessionId   String
  session     Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  timestamp   Int      // Secondes depuis le début de l'enregistrement
  type        MomentType @default(IMPORTANT)
  note        String?  // Note optionnelle ajoutée par l'utilisateur
  
  // Extrait du transcript (rempli après transcription)
  excerpt     String?  @db.Text
  
  createdAt   DateTime @default(now())

  @@index([sessionId])
}

enum MomentType {
  IMPORTANT   // Moment important générique
  INSIGHT     // Déclic / prise de conscience
  ACTION      // Action à retenir
  QUOTE       // Citation inspirante
}

// ============================================
// CONSENT (RGPD - Consentements)
// ============================================

model Consent {
  id          String      @id @default(cuid())
  sessionId   String
  session     Session     @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  coachId     String
  coach       Coach       @relation(fields: [coachId], references: [id])
  
  type        ConsentType
  accepted    Boolean     @default(true)
  
  // RGPD : horodatage précis
  acceptedAt  DateTime    @default(now())
  ipAddress   String?     // Pour traçabilité légale
  userAgent   String?     // Device info
  
  // Révocation
  revokedAt   DateTime?

  @@unique([sessionId, userId, type])
  @@index([sessionId])
  @@index([userId])
}

enum ConsentType {
  AUDIO_RECORDING   // Accepte l'enregistrement audio
  DATA_PROCESSING   // Accepte le traitement par IA
  SUMMARY_SHARING   // Accepte le partage du résumé avec le coach
  DATA_RETENTION    // Accepte la conservation des données
}

// ============================================
// CHECK-IN (Suivi quotidien - Phase 5)
// ============================================

model CheckIn {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  date        DateTime  @default(now()) @db.Date
  mood        Int       // 1-5 (😔 à 🔥)
  note        String?   @db.Text
  
  // Actions complétées ce jour
  actionsCompleted String[] // IDs des actions cochées
  
  createdAt   DateTime  @default(now())

  @@unique([userId, date])
  @@index([userId])
  @@index([date])
}

// ============================================
// B2B : ORGANISATION / ENTREPRISE (ajout Gemini)
// ============================================

model Organization {
  id            String    @id @default(cuid())
  
  // Informations légales
  name          String    // "Société Générale"
  legalName     String?   // "Société Générale SA"
  siret         String?   @unique
  vatNumber     String?   // TVA intracommunautaire
  
  // Adresse de facturation
  billingAddress  String?
  billingCity     String?
  billingPostcode String?
  billingCountry  String?   @default("FR")
  
  // Contact principal
  contactName   String?
  contactEmail  String?
  contactPhone  String?
  
  // Paramètres
  maxUsersAllowed Int?      // Nombre max de coachés
  budgetAllocated Int?      // Budget annuel en centimes
  budgetUsed      Int       @default(0)
  
  // Relations
  members       OrganizationMember[]
  bookings      Booking[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([name])
}

// Lien User <-> Organisation (un user peut appartenir à une orga)
model OrganizationMember {
  id              String    @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  role            OrgMemberRole @default(EMPLOYEE)
  
  // Limites individuelles
  sessionsAllowed Int?      // Nombre de séances autorisées
  sessionsUsed    Int       @default(0)
  
  joinedAt        DateTime  @default(now())

  @@unique([organizationId, userId])
  @@index([organizationId])
  @@index([userId])
}

enum OrgMemberRole {
  ADMIN       // RH / Administrateur du compte entreprise
  MANAGER     // Peut voir les stats de son équipe
  EMPLOYEE    // Coaché simple
}

// ============================================
// B2B : FACTURATION ENTREPRISE (ajout Gemini)
// ============================================

// Ajout du champ billingType dans Booking (voir modèle Booking mis à jour)

// ============================================
// OBJECTIFS & KPIs (ajout Gemini)
// Permet de mesurer l'évolution concrète du coaché
// ============================================

model Goal {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  
  // Optionnel : lié à une mission entreprise
  organizationId String?
  
  // Contenu
  title         String    // "Améliorer ma prise de parole en public"
  description   String?   @db.Text
  category      GoalCategory @default(PERSONAL)
  
  // Mesure
  targetValue   Float?    // Valeur cible (ex: 8/10)
  currentValue  Float?    // Valeur actuelle
  unit          String?   // "score /10", "%", "occurrences/semaine"
  
  // Dates
  startDate     DateTime  @default(now())
  targetDate    DateTime?
  completedAt   DateTime?
  
  // Statut
  status        GoalStatus @default(IN_PROGRESS)
  
  // Historique des mesures
  measurements  GoalMeasurement[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
  @@index([status])
}

enum GoalCategory {
  PERSONAL      // Objectif personnel (B2C)
  PROFESSIONAL  // Objectif pro (B2B)
  ORGANIZATIONAL // Objectif défini par l'entreprise
}

enum GoalStatus {
  DRAFT         // Brouillon
  IN_PROGRESS   // En cours
  COMPLETED     // Atteint
  ABANDONED     // Abandonné
}

// Historique des mesures d'un objectif
model GoalMeasurement {
  id          String    @id @default(cuid())
  goalId      String
  goal        Goal      @relation(fields: [goalId], references: [id], onDelete: Cascade)
  
  value       Float     // Valeur mesurée
  note        String?   // Commentaire
  measuredAt  DateTime  @default(now())
  
  // Lié à une séance ?
  sessionId   String?

  @@index([goalId])
}

// ============================================
// DOCUMENTS DE TRAVAIL COACH (ajout Gemini)
// Tests de personnalité, évaluations 360°, etc.
// ============================================

model CoachDocument {
  id            String    @id @default(cuid())
  
  // Propriétaire
  coachId       String?   // Si uploadé par le coach
  userId        String?   // Si uploadé par le coaché
  sessionId     String?   // Si lié à une séance spécifique
  
  // Fichier
  name          String    // "Test MBTI - Jean Dupont"
  type          DocumentType
  fileUrl       String
  fileSize      Int       // En bytes
  mimeType      String    // "application/pdf"
  
  // Analyse IA (optionnel)
  aiSummary     String?   @db.Text // Résumé généré par l'IA
  aiAnalyzedAt  DateTime?
  
  // Partage
  sharedWithCoach Boolean @default(false)
  sharedWithUser  Boolean @default(false)
  
  // Confidentialité
  isConfidential Boolean  @default(true)
  expiresAt      DateTime? // Auto-suppression après X jours
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([coachId])
  @@index([userId])
  @@index([sessionId])
}

enum DocumentType {
  PERSONALITY_TEST  // MBTI, Process Com, etc.
  EVALUATION_360    // Feedback 360°
  PERFORMANCE_REVIEW // Entretien annuel
  CUSTOM            // Autre document
  SESSION_NOTES     // Notes de séance (manuscrites)
}

// ============================================
// OFFLINE QUEUE (File d'attente hors-ligne)
// Note: Géré côté client avec IndexedDB/Capacitor Storage
// Ce modèle sert à tracker les uploads en attente côté serveur
// ============================================

model OfflineUpload {
  id            String            @id @default(cuid())
  sessionId     String
  
  // Tracking
  status        OfflineUploadStatus @default(PENDING)
  retryCount    Int               @default(0)
  lastRetryAt   DateTime?
  errorMessage  String?
  
  // Métadonnées de l'upload
  fileSize      Int               // Taille attendue
  checksum      String?           // Pour vérifier l'intégrité
  
  createdAt     DateTime          @default(now())
  completedAt   DateTime?

  @@index([status])
  @@index([sessionId])
}

enum OfflineUploadStatus {
  PENDING       // En attente de connexion
  UPLOADING     // Upload en cours
  COMPLETED     // Upload réussi
  FAILED        // Échec définitif (après X retries)
}
```

---

## 📋 RÈGLES MÉTIER PAR MODÈLE

### User
| Règle | Description |
|-------|-------------|
| Email unique | Un seul compte par email |
| Rôle par défaut | `USER` à la création |
| Suppression | Cascade sur Account, Booking, etc. |
| Multi-org | Un user peut appartenir à plusieurs organisations |

### Coach
| Règle | Description |
|-------|-------------|
| Un User = Un Coach max | Relation 1:1 via `userId` unique |
| Badge VERIFIED | Nécessite vérification manuelle admin |
| Stats dénormalisées | `totalSessions` et `averageRating` mis à jour après chaque séance |
| B2B opt-in | `acceptsCorporate` doit être `true` pour apparaître dans les recherches B2B |

### Booking
| Règle | Description |
|-------|-------------|
| Annulation gratuite | Si `cancelledAt` > 24h avant `scheduledAt` |
| Annulation tardive | Remboursement 50% si < 24h |
| No-show | Pas de remboursement, coach payé |
| Facturation B2B | Si `billingType = CORPORATE`, facturer l'`organization` |

### Session
| Règle | Description |
|-------|-------------|
| Audio optionnel | Une séance peut exister sans enregistrement |
| Résumé en 2 versions | `summaryRaw` (IA) → `summaryFinal` (validé coach) |
| Rétention audio | 30 jours puis suppression automatique |

### Consent
| Règle | Description |
|-------|-------------|
| Double opt-in | User ET Coach doivent accepter |
| Révocable | `revokedAt` permet l'annulation |
| Horodatage légal | `acceptedAt` + `ipAddress` pour conformité RGPD |

### Organization (B2B)
| Règle | Description |
|-------|-------------|
| Budget tracking | `budgetUsed` incrémenté à chaque booking CORPORATE |
| Limite users | `maxUsersAllowed` bloque les ajouts si atteint |
| Facturation unique | Une facture par organisation, pas par coaché |

### Goal (B2B)
| Règle | Description |
|-------|-------------|
| Ownership | Un goal appartient à un user, optionnellement lié à une org |
| Mesures historisées | `GoalMeasurement` garde l'historique des valeurs |
| Anonymisation RH | Les RH voient les stats agrégées, pas les détails |

### CoachDocument
| Règle | Description |
|-------|-------------|
| Confidentialité par défaut | `isConfidential = true` |
| Auto-expiration | Si `expiresAt` défini, suppression automatique |
| Analyse IA opt-in | L'IA ne lit le document que si demandé explicitement |

---

## 🔄 MIGRATIONS IMPORTANTES

### Migration initiale
```bash
npx prisma migrate dev --name init
```

### Après ajout d'un champ
```bash
npx prisma migrate dev --name add_session_status
```

### En production
```bash
npx prisma migrate deploy
```

---

## 🌱 SEED DE DÉVELOPPEMENT

```typescript
// prisma/seed.ts

import { PrismaClient, Role, BadgeLevel, InterventionMode, TargetAudience } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // =============================================
  // ADMIN
  // =============================================
  const admin = await prisma.user.upsert({
    where: { email: 'admin@trustcoach.fr' },
    update: {},
    create: {
      email: 'admin@trustcoach.fr',
      name: 'Admin TrustCoach',
      password: await hash('admin123', 12),
      role: Role.ADMIN,
    },
  });

  // =============================================
  // COACHS
  // =============================================
  
  // Coach B2C - Bien-être
  const coach1 = await prisma.user.upsert({
    where: { email: 'marie.dupont@coach.fr' },
    update: {},
    create: {
      email: 'marie.dupont@coach.fr',
      name: 'Marie Dupont',
      password: await hash('coach123', 12),
      role: Role.COACH,
      coach: {
        create: {
          bio: 'Coach certifiée en développement personnel avec 10 ans d\'expérience. Spécialisée dans la gestion du stress et l\'équilibre de vie.',
          headline: 'Coach en gestion du stress',
          specialties: ['Gestion du stress', 'Confiance en soi', 'Équilibre vie pro/perso'],
          methodologies: ['PNL', 'Pleine conscience'],
          interventionModes: [InterventionMode.INDIVIDUAL],
          targetAudience: [TargetAudience.INDIVIDUAL, TargetAudience.EMPLOYEE],
          acceptsCorporate: false,
          hourlyRate: 8000, // 80€
          verified: true,
          badgeLevel: BadgeLevel.VERIFIED,
          city: 'Paris',
        },
      },
    },
  });

  // Coach B2B - Executive coaching
  const coach2 = await prisma.user.upsert({
    where: { email: 'thomas.martin@coach.fr' },
    update: {},
    create: {
      email: 'thomas.martin@coach.fr',
      name: 'Thomas Martin',
      password: await hash('coach123', 12),
      role: Role.COACH,
      coach: {
        create: {
          bio: 'Expert en coaching de dirigeants et transformation des organisations. 15 ans d\'expérience en entreprise avant de devenir coach.',
          headline: 'Executive Coach & Leadership',
          specialties: ['Leadership', 'Management', 'Prise de parole', 'Gestion du changement'],
          methodologies: ['MBTI', 'Process Com', '360° Feedback', 'Ennéagramme'],
          interventionModes: [InterventionMode.INDIVIDUAL, InterventionMode.TEAM, InterventionMode.ORGANIZATION],
          targetAudience: [TargetAudience.EXECUTIVE, TargetAudience.MANAGER],
          acceptsCorporate: true,
          hourlyRate: 15000, // 150€
          dailyRate: 200000, // 2000€
          verified: true,
          badgeLevel: BadgeLevel.PREMIUM,
          city: 'Lyon',
          certifications: {
            create: [
              {
                name: 'Certification ICF PCC',
                issuer: 'International Coaching Federation',
                year: 2019,
                verified: true,
              },
              {
                name: 'Certification MBTI',
                issuer: 'The Myers-Briggs Company',
                year: 2018,
                verified: true,
              },
            ],
          },
          references: {
            create: [
              {
                companyName: 'BNP Paribas',
                sector: 'Banque',
                missionType: 'Coaching dirigeants',
                year: 2023,
                testimonial: 'Thomas a accompagné notre COMEX dans une période de transformation majeure.',
                contactName: 'Marie D., DRH',
                canDisplay: true,
              },
              {
                companyName: 'L\'Oréal',
                sector: 'Cosmétiques',
                missionType: 'Team coaching',
                year: 2022,
                canDisplay: true,
              },
            ],
          },
        },
      },
    },
  });

  // =============================================
  // UTILISATEUR TEST
  // =============================================
  const user = await prisma.user.upsert({
    where: { email: 'user@test.fr' },
    update: {},
    create: {
      email: 'user@test.fr',
      name: 'Jean Test',
      password: await hash('user123', 12),
      role: Role.USER,
    },
  });

  // =============================================
  // ORGANISATION TEST (B2B)
  // =============================================
  const org = await prisma.organization.upsert({
    where: { siret: '12345678901234' },
    update: {},
    create: {
      name: 'Acme Corp',
      legalName: 'Acme Corporation SAS',
      siret: '12345678901234',
      vatNumber: 'FR12345678901',
      billingAddress: '123 Avenue des Champs-Élysées',
      billingCity: 'Paris',
      billingPostcode: '75008',
      billingCountry: 'FR',
      contactName: 'Sophie Martin',
      contactEmail: 'sophie.martin@acme.fr',
      maxUsersAllowed: 50,
      budgetAllocated: 5000000, // 50 000€
    },
  });

  // Ajouter un membre à l'organisation
  const orgMember = await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: 'EMPLOYEE',
      sessionsAllowed: 10,
    },
  });

  console.log({ admin, coach1, coach2, user, org, orgMember });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 📊 INDEX RECOMMANDÉS

Les index sont déjà définis dans le schéma avec `@@index()`. Voici le récapitulatif :

| Table | Champs indexés | Raison |
|-------|---------------|--------|
| User | `email` | Recherche par email (login) |
| Coach | `verified`, `specialties`, `city` | Filtres de recherche |
| Booking | `userId`, `coachId`, `scheduledAt`, `status` | Requêtes fréquentes |
| Session | `status` | Filtrer les sessions en cours de traitement |
| Consent | `sessionId`, `userId` | Vérification rapide des consentements |

---

## 🔐 DONNÉES SENSIBLES

| Champ | Protection |
|-------|------------|
| `User.password` | Hashé avec bcrypt (jamais en clair) |
| `User.email` | Chiffré au repos (si requis) |
| `Consent.ipAddress` | Conservation limitée (6 mois) |
| `Session.audioUrl` | URL signée avec expiration |
| `Session.transcript` | Chiffré au repos |

---

## 🗑️ POLITIQUE DE RÉTENTION (RGPD)

| Donnée | Durée | Action |
|--------|-------|--------|
| Audio | 30 jours | Suppression automatique S3 |
| Transcript | 1 an | Anonymisation ou suppression |
| Résumés | Illimité | Sauf demande de l'utilisateur |
| Consentements | 5 ans | Conservation légale |
| Logs de connexion | 1 an | Suppression automatique |

---

*Dernière mise à jour : Janvier 2026*
