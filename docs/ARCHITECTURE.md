# ARCHITECTURE.md — TrustCoach IA

> Décisions techniques figées. Ne pas modifier sans validation de Jeff.

---

## 🏗️ PHILOSOPHIE : "Pragmatic Clean Layout"

Ni Clean Architecture stricte (trop verbeux pour un MVP), ni chaos total.

**Principes :**
1. **Server Actions** pour le "wiring" UI ↔ Services
2. **Services découplés** pour la logique métier (testables)
3. **Hooks** pour la logique plateforme-spécifique
4. **Zod** partout (validation client ET serveur)

---

## 📁 STRUCTURE DES DOSSIERS DÉTAILLÉE

```
trustcoach-app/
│
├── CLAUDE.md                       # ⚡ Lu par Claude Code
├── capacitor.config.ts             # Config mobile
├── next.config.ts                  # Config Next.js
├── tailwind.config.ts              # Config Tailwind
├── tsconfig.json                   # Config TypeScript (strict)
│
├── prisma/
│   ├── schema.prisma               # Schéma BDD complet
│   ├── seed.ts                     # Données de test
│   └── migrations/                 # Historique migrations
│
├── public/
│   └── assets/                     # Images, icônes
│
├── src/
│   │
│   ├── app/                        # 📱 PAGES (App Router)
│   │   ├── layout.tsx              # Layout racine
│   │   ├── page.tsx                # Homepage
│   │   ├── globals.css             # Styles globaux
│   │   │
│   │   ├── (auth)/                 # Routes auth (groupe)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx          # Layout auth (sans header)
│   │   │
│   │   ├── (dashboard)/            # Routes protégées (groupe)
│   │   │   ├── layout.tsx          # Layout avec sidebar
│   │   │   │
│   │   │   ├── user/               # Espace utilisateur
│   │   │   │   ├── page.tsx        # Dashboard user
│   │   │   │   ├── bookings/       # Mes réservations
│   │   │   │   ├── sessions/       # Historique séances + résumés
│   │   │   │   └── profile/        # Mon profil
│   │   │   │
│   │   │   └── coach/              # Espace coach
│   │   │       ├── page.tsx        # Dashboard coach
│   │   │       ├── calendar/       # Mon calendrier
│   │   │       ├── clients/        # Mes clients
│   │   │       └── profile/        # Mon profil coach
│   │   │
│   │   ├── coaches/                # Pages publiques coachs
│   │   │   ├── page.tsx            # Liste/recherche
│   │   │   └── [id]/page.tsx       # Profil coach public
│   │   │
│   │   ├── booking/                # Flow de réservation
│   │   │   └── [coachId]/page.tsx  # Sélection créneau + paiement
│   │   │
│   │   └── api/                    # Routes API (webhooks, etc.)
│   │       ├── webhooks/
│   │       │   └── stripe/route.ts
│   │       └── auth/[...nextauth]/route.ts
│   │
│   ├── actions/                    # 🎯 SERVER ACTIONS
│   │   ├── auth.actions.ts         # Login, register, logout
│   │   ├── coach.actions.ts        # CRUD profil coach
│   │   ├── booking.actions.ts      # Réservation, annulation
│   │   ├── session.actions.ts      # Séances, résumés
│   │   └── user.actions.ts         # CRUD profil user
│   │
│   ├── services/                   # 🔧 LOGIQUE MÉTIER
│   │   ├── ai.service.ts           # Claude API + Whisper
│   │   ├── stripe.service.ts       # Paiement
│   │   ├── email.service.ts        # Notifications
│   │   ├── storage.service.ts      # Upload S3/Cloudinary
│   │   └── calendar.service.ts     # Gestion disponibilités
│   │
│   ├── hooks/                      # 🪝 HOOKS PERSONNALISÉS
│   │   ├── useAuth.ts              # Session utilisateur
│   │   ├── useAudioRecorder.ts     # Enregistrement (mobile)
│   │   ├── usePushNotifications.ts # Notifications push
│   │   ├── useOfflineQueue.ts      # File d'attente offline
│   │   └── usePlatform.ts          # Détection iOS/Android/Web
│   │
│   ├── components/                 # 🧩 COMPOSANTS
│   │   ├── ui/                     # shadcn/ui (NE PAS MODIFIER)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                 # Structure pages
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── features/               # Composants métier
│   │       ├── auth/
│   │       │   ├── LoginForm.tsx
│   │       │   └── RegisterForm.tsx
│   │       │
│   │       ├── coaches/
│   │       │   ├── CoachCard.tsx
│   │       │   ├── CoachList.tsx
│   │       │   ├── CoachFilters.tsx
│   │       │   └── CoachProfile.tsx
│   │       │
│   │       ├── booking/
│   │       │   ├── CalendarPicker.tsx
│   │       │   ├── TimeSlotPicker.tsx
│   │       │   └── PaymentForm.tsx
│   │       │
│   │       ├── session/
│   │       │   ├── AudioRecorder.tsx
│   │       │   ├── SessionSummary.tsx
│   │       │   └── SessionTimeline.tsx
│   │       │
│   │       └── common/
│   │           ├── LoadingSpinner.tsx
│   │           ├── ErrorMessage.tsx
│   │           ├── EmptyState.tsx
│   │           └── ConfirmDialog.tsx
│   │
│   ├── lib/                        # 📚 UTILS & CONFIG
│   │   ├── prisma.ts               # Client Prisma singleton
│   │   ├── auth.ts                 # Config NextAuth
│   │   ├── utils.ts                # Helpers (cn, formatDate, etc.)
│   │   └── constants.ts            # Constantes app
│   │
│   ├── validations/                # ✅ SCHÉMAS ZOD
│   │   ├── auth.schema.ts
│   │   ├── coach.schema.ts
│   │   ├── booking.schema.ts
│   │   └── session.schema.ts
│   │
│   └── types/                      # 📝 TYPES TYPESCRIPT
│       ├── index.ts                # Export centralisé
│       ├── auth.types.ts
│       ├── coach.types.ts
│       ├── booking.types.ts
│       └── session.types.ts
│
├── ios/                            # 📱 Projet Xcode (Capacitor)
├── android/                        # 📱 Projet Android (Capacitor)
│
└── docs/                           # 📖 DOCUMENTATION
    ├── ARCHITECTURE.md             # Ce fichier
    ├── SPECS.md                    # Spécifications fonctionnelles
    ├── DEFINITION_OF_DONE.md       # Checklists
    └── PRISMA_SCHEMA.md            # Documentation BDD
```

---

## 🔄 PATTERNS OBLIGATOIRES

### Pattern 1 : Server Action avec gestion d'erreur

```typescript
// actions/booking.actions.ts
'use server';

import { z } from 'zod';
import { bookingSchema } from '@/validations/booking.schema';
import { createBooking } from '@/services/calendar.service';
import { ActionResult } from '@/types';

export async function createBookingAction(
  formData: z.infer<typeof bookingSchema>
): Promise<ActionResult<Booking>> {
  try {
    // 1. Validation
    const validated = bookingSchema.parse(formData);
    
    // 2. Logique métier (déléguée au service)
    const booking = await createBooking(validated);
    
    // 3. Retour structuré
    return { data: booking, error: null };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: 'Données invalides' };
    }
    console.error('[BOOKING_ERROR]', error);
    return { data: null, error: 'Erreur lors de la réservation' };
  }
}
```

### Pattern 2 : Service découplé

```typescript
// services/ai.service.ts

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function generateSessionSummary(
  transcript: string,
  coachName: string
): Promise<SessionSummary> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Résume cette séance de coaching avec ${coachName}...`
    }]
  });
  
  // Parser et structurer la réponse
  return parseAIResponse(response);
}
```

### Pattern 3 : Hook mobile-safe

```typescript
// hooks/useAudioRecorder.ts

import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  const startRecording = useCallback(async () => {
    if (!isNative) {
      setError('Enregistrement disponible uniquement sur mobile');
      return;
    }

    try {
      const permission = await VoiceRecorder.requestAudioRecordingPermission();
      if (!permission.value) {
        setError('Permission micro refusée');
        return;
      }
      
      await VoiceRecorder.startRecording();
      setIsRecording(true);
      setError(null);
    } catch (e) {
      setError('Erreur démarrage enregistrement');
    }
  }, [isNative]);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return null;
    
    try {
      const result = await VoiceRecorder.stopRecording();
      setIsRecording(false);
      setAudioUri(result.value.recordDataBase64);
      return result.value;
    } catch (e) {
      setError('Erreur arrêt enregistrement');
      return null;
    }
  }, [isRecording]);

  return {
    isRecording,
    audioUri,
    error,
    isNative,
    startRecording,
    stopRecording,
  };
}
```

### Pattern 4 : Composant avec tous les états

```typescript
// components/features/coaches/CoachList.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { getCoaches } from '@/actions/coach.actions';
import { CoachCard } from './CoachCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';

export function CoachList({ filters }: CoachListProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['coaches', filters],
    queryFn: () => getCoaches(filters),
  });

  // État Loading
  if (isLoading) {
    return <LoadingSpinner message="Recherche des coachs..." />;
  }

  // État Error
  if (isError) {
    return <ErrorMessage error={error} retry={() => refetch()} />;
  }

  // État Empty
  if (!data?.length) {
    return (
      <EmptyState
        title="Aucun coach trouvé"
        description="Essayez de modifier vos critères de recherche"
        action={{ label: 'Réinitialiser', onClick: resetFilters }}
      />
    );
  }

  // État Success
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((coach) => (
        <CoachCard key={coach.id} coach={coach} />
      ))}
    </div>
  );
}
```

---

## 🗄️ SCHÉMA PRISMA (APERÇU)

```prisma
// Voir docs/PRISMA_SCHEMA.md pour le schéma complet

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          Role      @default(USER)
  // ... relations
}

model Coach {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  bio           String?
  specialties   String[]
  verified      Boolean   @default(false)
  badgeLevel    BadgeLevel @default(STANDARD)
  // ... relations
}

model Booking {
  id            String    @id @default(cuid())
  userId        String
  coachId       String
  scheduledAt   DateTime
  status        BookingStatus @default(PENDING)
  // ... relations
}

model Session {
  id            String    @id @default(cuid())
  bookingId     String    @unique
  audioUrl      String?
  transcript    String?
  summaryRaw    String?   // Version IA brute
  summaryFinal  String?   // Version validée coach
  // ... relations
}

model Consent {
  id            String    @id @default(cuid())
  sessionId     String
  userId        String
  coachId       String
  type          ConsentType // AUDIO_RECORDING, DATA_PROCESSING
  acceptedAt    DateTime
  // RGPD compliance
}
```

---

## 📱 CONFIGURATION CAPACITOR

```typescript
// capacitor.config.ts

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trustcoach.app',
  appName: 'TrustCoach',
  webDir: 'out',  // Export statique Next.js
  bundledWebRuntime: false,
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
    },
  },
};

export default config;
```

---

## 🚫 PATTERNS INTERDITS

| ❌ Interdit | ✅ Faire plutôt |
|-------------|-----------------|
| `any` dans TypeScript | Types explicites ou `unknown` + type guard |
| Logique métier dans les composants | Déléguer aux Server Actions / Services |
| `try/catch` vide | Toujours logger l'erreur + retourner un message |
| Appel Capacitor sans vérification | Wrapper dans un hook avec `isNativePlatform()` |
| Créer un nouveau composant UI | Utiliser shadcn/ui existant |
| Modifier les composants shadcn/ui | Créer un wrapper dans `/components/features/` |

---

## 🔐 SÉCURITÉ

1. **Variables d'environnement** : Jamais dans le code, toujours `.env.local`
2. **Validation** : Zod côté client ET serveur (double validation)
3. **Auth** : Vérifier la session dans chaque Server Action protégée
4. **RGPD** : Consentement explicite avant enregistrement audio

---

## 📱 APP STORE COMPLIANCE (ajout Gemini)

### iOS — Info.plist

Apple est très strict sur les apps qui enregistrent de l'audio. Ces descriptions sont OBLIGATOIRES :

```xml
<!-- ios/App/App/Info.plist -->

<key>NSMicrophoneUsageDescription</key>
<string>TrustCoach utilise le microphone pour enregistrer vos séances de coaching. Ces enregistrements sont transcrits par IA pour générer un résumé personnalisé. Vous pouvez désactiver cette fonctionnalité à tout moment.</string>

<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>

<key>NSCameraUsageDescription</key>
<string>TrustCoach utilise la caméra pour les séances en visio et la photo de profil.</string>
```

### Android — AndroidManifest.xml

```xml
<!-- android/app/src/main/AndroidManifest.xml -->

<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />

<!-- Service pour enregistrement en arrière-plan -->
<service
  android:name=".AudioRecordingService"
  android:foregroundServiceType="microphone"
  android:exported="false" />
```

---

## 🎙️ GESTION AUDIO (corrections Gemini)

### Problème : Fichiers audio volumineux

Une séance d'1h en audio non compressé = 100-500 Mo.
Solution : **Compression côté client AVANT upload**.

### Hook de compression audio

```typescript
// hooks/useAudioCompressor.ts

import { Capacitor } from '@capacitor/core';

interface CompressedAudio {
  uri: string;
  size: number;
  duration: number;
  format: 'webm' | 'm4a';
}

export function useAudioCompressor() {
  const compress = async (rawAudioUri: string): Promise<CompressedAudio> => {
    if (!Capacitor.isNativePlatform()) {
      // Web : utiliser l'API MediaRecorder avec compression
      throw new Error('Compression web non implémentée');
    }

    // Mobile : utiliser un plugin natif de compression
    // Options recommandées :
    // - Format : AAC/M4A (meilleur ratio qualité/taille)
    // - Bitrate : 64kbps (suffisant pour la voix)
    // - Sample rate : 22050 Hz
    
    // Estimation : 1h de voix compressée ≈ 30 Mo
    
    // TODO: Intégrer un plugin comme cordova-plugin-audio-recorder-api
    // ou capacitor-audio-stream avec options de compression
    
    return {
      uri: rawAudioUri,
      size: 0,
      duration: 0,
      format: 'm4a',
    };
  };

  return { compress };
}
```

### Foreground Service (enregistrement arrière-plan)

**Problème** : Sur Android/iOS, si l'utilisateur change d'app (appel entrant, etc.), le WebView peut être tué et l'enregistrement perdu.

**Solution** : Utiliser un plugin qui supporte le Foreground Service.

```typescript
// hooks/useAudioRecorder.ts (version améliorée)

import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';

export function useAudioRecorder() {
  // ...

  const startRecording = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      setError('Enregistrement disponible uniquement sur mobile');
      return;
    }

    try {
      // 1. Vérifier les permissions
      const permission = await VoiceRecorder.requestAudioRecordingPermission();
      if (!permission.value) {
        setError('Permission micro refusée');
        return;
      }

      // 2. Démarrer avec Foreground Service
      // Note: capacitor-voice-recorder gère automatiquement le foreground service
      // Si vous utilisez un autre plugin, configurez-le explicitement
      await VoiceRecorder.startRecording();
      
      setIsRecording(true);
      setError(null);
      
    } catch (e) {
      console.error('[AUDIO_ERROR]', e);
      setError('Erreur démarrage enregistrement');
    }
  }, []);

  // ...
}
```

### Plugins recommandés pour l'audio

| Plugin | Usage | Foreground Service |
|--------|-------|-------------------|
| `capacitor-voice-recorder` | Enregistrement simple | ✅ Oui |
| `@nicholasbraun/audio-recorder` | Plus de contrôle | ✅ Oui |
| `capacitor-audio-stream` | Streaming temps réel | ⚠️ À configurer |

---

## 📊 MONITORING AUDIO

### Suivi du pipeline de traitement

Utiliser le champ `Session.status` pour tracker chaque étape :

```
IDLE → RECORDING → UPLOADING → TRANSCRIBING → SUMMARIZING → COMPLETED
                      ↓              ↓              ↓
               UPLOAD_FAILED  TRANSCRIBE_FAILED  SUMMARIZE_FAILED
```

### Métriques à surveiller

| Métrique | Seuil d'alerte | Action |
|----------|---------------|--------|
| Taille audio moyenne | > 50 Mo | Vérifier compression |
| Temps d'upload | > 60s | Optimiser chunking |
| Taux d'échec transcription | > 5% | Vérifier qualité audio |
| Taux d'échec résumé | > 2% | Vérifier prompts Claude |

---

*Dernière mise à jour : Janvier 2026*

---

## 🎨 DESIGN SYSTEM — "Serene Clarity"

> Identité visuelle co-construite avec Gemini.
> L'interface doit être comme un bureau de coach bien rangé : calme, inspirante, sans désordre.

### Philosophie

**"Serene Clarity"** — Une app qui respire, qui ne stresse pas, qui accompagne.

| Principe | Application |
|----------|-------------|
| **Calme** | Pas de couleurs criardes, animations douces |
| **Confiance** | Tons profonds (navy, sage), badges vérifiés visibles |
| **Clarté** | Hiérarchie visuelle claire, espaces généreux |
| **Humanité** | Touches organiques, photos réelles, typographie chaleureuse |

---

### Palette de couleurs

#### Principe d'unification (décision Gemini)

> **Pas deux thèmes séparés** — Une seule UI, mais les accents s'adaptent au contexte du coach.
> - Coach B2C (bien-être) → Accents Sage Green
> - Coach B2B (business) → Accents Slate Blue

#### Mode Clair (défaut)

```css
:root {
  /* Primary - Confiance */
  --primary: #1A2B48;           /* Deep Navy */
  --primary-foreground: #FFFFFF;
  
  /* Secondary - Croissance (B2C default) */
  --secondary: #88A096;         /* Sage Green */
  --secondary-foreground: #FFFFFF;
  
  /* Secondary Business (appliqué dynamiquement si coach B2B) */
  --secondary-business: #3B82F6; /* Blue 500 */
  
  /* Accent - RÉSERVÉ aux Moments Marqués & Insights IA uniquement */
  --accent: #D4AF37;            /* Muted Gold */
  --accent-foreground: #1A2B48;
  
  /* Backgrounds */
  --background: #F9F7F2;        /* Soft Linen */
  --background-card: #FFFFFF;
  --background-muted: #F1EDE6;
  
  /* Text */
  --foreground: #1A2B48;
  --muted-foreground: #64748B;
  
  /* Status */
  --success: #22C55E;           /* Pour les validations, badges */
  --warning: #F59E0B;
  --error: #EF4444;
  
  /* Borders */
  --border: #E2E8F0;
  --border-focus: #88A096;
}

/* Contexte B2B - appliqué sur les pages coach business */
[data-coach-type="business"] {
  --secondary: #3B82F6;         /* Blue 500 */
  --border-focus: #3B82F6;
}
```

#### Mode Sombre

```css
:root.dark {
  --background: #0F172A;
  --background-card: #1E293B;
  --foreground: #F8FAFC;
  --muted-foreground: #94A3B8;
  --border: #334155;
}
```

#### Mode "Silence" (Enregistrement)

```css
:root.silence {
  --background: #0A0A0A;        /* Noir profond */
  --foreground: #FAFAFA;
  --accent: #D4AF37;            /* Gold pour le bouton Marquer uniquement */
}
```

#### Règle d'usage du Gold (#D4AF37) — STRICTE

| ✅ Autorisé | ❌ Interdit |
|-------------|-------------|
| Bouton "Marquer ce moment" | Badges premium |
| Icône ⭐ des insights IA | Boutons de succès |
| Highlight des citations extraites | Éléments décoratifs |
| Bordure des "Moments Marqués" dans le résumé | Navigation |

> **Règle** : Le Gold dit "Ceci est une pépite de sagesse". Ne pas diluer.

---

### Typographie

> **Décision Gemini** : Le Serif crée une "rupture cognitive" — Sans-Serif pour l'action, Serif pour la réflexion.

```css
/* Headings - Moderne et affirmé */
--font-heading: 'DM Sans', sans-serif;

/* Body - Lisible et neutre (action, gestion) */
--font-body: 'Inter', sans-serif;

/* Accents - Citations, résumés, insights (réflexion, humain) */
--font-accent: 'Literata', serif;

/* Échelle */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Line heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

**Usage sémantique :**

| Font | Contexte | Signal cognitif |
|------|----------|-----------------|
| `font-heading` (DM Sans) | Titres de pages, noms | "Navigation, structure" |
| `font-body` (Inter) | Texte courant, formulaires, boutons | "Action, gestion" |
| `font-accent` (Literata) | Citations coach, insights IA, résumés | "Réflexion, sagesse" |

**Exemple d'application :**
```tsx
{/* Insight IA avec typographie Serif */}
<blockquote className="font-accent text-lg italic border-l-4 border-accent pl-4">
  "La culpabilité que vous ressentez n'est pas un signal d'échec, 
  c'est un signal de valeurs."
</blockquote>
```

---

### Espacements

Basé sur l'échelle Tailwind (4px base) :

```
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

**Règles :**
- Padding cards : `p-6` (24px)
- Gap entre cards : `gap-4` (16px)
- Marges de page : `px-4` mobile, `px-8` desktop
- Espacement sections : `py-12` (48px)

---

### Border Radius

```css
--radius-sm: 0.375rem;  /* 6px - Inputs, badges */
--radius-md: 0.5rem;    /* 8px - Buttons */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Modals */
--radius-2xl: 1.5rem;   /* 24px - Large cards */
--radius-full: 9999px;  /* Avatars, pills */
```

---

### Ombres

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Ombre "glow" pour les éléments focus */
--shadow-glow: 0 0 0 3px rgba(136, 160, 150, 0.3);
```

---

### Composants shadcn/ui requis

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add progress
```

---

### Animations et transitions

#### Librairies

```bash
npm install framer-motion
npm install lottie-react  # Pour le mode Silence
```

#### Timings globaux

```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

#### Micro-interactions

| Élément | Animation |
|---------|-----------|
| **Boutons** | Scale 0.98 on press, 150ms |
| **Cards hover** | Translate Y -2px + shadow-lg, 200ms |
| **Modals** | Fade in + scale from 0.95, 300ms spring |
| **Toasts** | Slide in from bottom, 300ms |
| **Page transitions** | Fade + slide, 200ms |
| **Bouton "Marquer"** | Pulse + haptic feedback |
| **Check-in mood** | Emoji bounce on select |
| **Timeline stagger** | Éléments apparaissent séquentiellement, 50ms delay chacun |

---

### Mode "Silence" (Séance présentielle)

**Objectif** : Zéro distraction pendant l'enregistrement.

#### Activation
- Auto quand l'enregistrement démarre
- Toggle manuel disponible pour désactiver

#### Visuel
```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│     ○ Animation Lottie      │
│       (Breathing Circle     │
│        style Calm/Siri)     │
│                             │
│                             │
│                             │
│   ┌───┐         ┌───────┐  │
│   │ ⭐ │         │ STOP  │  │
│   └───┘         └───────┘  │
└─────────────────────────────┘

- Fond : #0A0A0A (noir profond)
- Pas de timer visible par défaut
- Tap écran → timer apparaît 2s puis fade out (décision Gemini)
- Bouton ⭐ : Gold (#D4AF37) + pulse subtil
```

#### Animation Lottie — Spécifications (recommandation Gemini)

**Style recherché** : "Fluid Blob" / "Breathing Circle"

| Caractéristique | Valeur |
|-----------------|--------|
| **Inspiration** | Apple Siri, app Calm |
| **Mouvement** | Cycle de respiration lent (pas synchro avec la voix) |
| **Durée boucle** | 4-6 secondes |
| **Couleur** | Blanc, 8-12% opacité |
| **Forme** | Cercle organique avec déformation subtile |
| **Rythme** | Inspire (2s) → Pause (0.5s) → Expire (2.5s) → Pause (0.5s) |

**Références LottieFiles à explorer** :
- "Breathing animation"
- "Calm meditation"
- "Fluid blob"
- "Organic pulse"

**Alternative custom** : Créer avec After Effects + Bodymovin
```json
// Structure simplifiée
{
  "type": "ellipse",
  "scale": {
    "keyframes": [
      { "time": 0, "value": [100, 100] },
      { "time": 2, "value": [108, 108] },
      { "time": 4, "value": [100, 100] }
    ]
  },
  "opacity": 0.1
}
```

#### Timer "Tap to Reveal" (décision Gemini)

**Comportement** :
1. Timer caché par défaut (préserve la bulle de discussion)
2. L'utilisateur tape n'importe où sur l'écran
3. Timer apparaît en fade-in (200ms)
4. Timer reste visible 2 secondes
5. Timer disparaît en fade-out (300ms)
6. Nouveau tap → recommence le cycle

**Justification** : Le coaching peut générer de l'anxiété sur le temps. Cacher le timer préserve le moment, le révéler sur demande redonne le contrôle.

---

### Fil d'Ariane (Timeline)

**Design vertical inspiré des parcours de vie.**

```
    ●──── Aujourd'hui
    │     Check-in: 😊
    │     "Bonne énergie"
    │
    ●──── 12 jan - Séance #4
    │     ⭐ Déclic culpabilité
    │     → Voir résumé
    │
    ○╌╌╌╌ 19 jan - Séance #5
    │     (à venir)
    │
    ○╌╌╌╌ Objectif: Mars 2026
          "Oser dire non"
```

**Légende :**
- `●` Cercle plein : Événement passé
- `○` Cercle vide : Événement futur
- `─` Trait continu : Passé
- `╌` Trait pointillé : Futur

**Animation d'entrée :**
- Stagger animation : chaque élément apparaît avec 50ms de délai
- Fade in + slide from left

---

### Icônes

**Librairie** : Lucide React (déjà inclus avec shadcn/ui)

```bash
npm install lucide-react
```

**Icônes clés :**
```tsx
import {
  User, Calendar, Clock, Star, Check, X,
  Mic, MicOff, Play, Pause, Upload,
  FileText, MessageSquare, TrendingUp,
  Building2, Users, Target, Award,
  ChevronRight, ChevronDown, MoreHorizontal
} from 'lucide-react';
```

---

### Responsive breakpoints

```css
/* Tailwind defaults */
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
--screen-2xl: 1536px; /* Extra large */
```

**Approche Mobile-first :**
- Design pour 375px d'abord
- Puis adapter pour les breakpoints supérieurs
- Bottom navigation sur mobile, sidebar sur desktop

---

### Exemples de composants stylés

#### Card Coach

```tsx
<Card className="group hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg">
  <CardHeader className="flex flex-row items-center gap-4">
    <Avatar className="h-16 w-16">
      <AvatarImage src={coach.avatarUrl} />
      <AvatarFallback>{coach.initials}</AvatarFallback>
    </Avatar>
    <div>
      <h3 className="font-heading text-lg font-semibold">{coach.name}</h3>
      <p className="text-muted-foreground text-sm">{coach.headline}</p>
    </div>
    {coach.verified && (
      <Badge variant="secondary" className="ml-auto">
        <Award className="h-3 w-3 mr-1" /> Vérifié
      </Badge>
    )}
  </CardHeader>
  <CardContent>
    <p className="text-sm line-clamp-2">{coach.bio}</p>
    <div className="flex gap-2 mt-3">
      {coach.specialties.slice(0, 3).map(s => (
        <Badge key={s} variant="outline">{s}</Badge>
      ))}
    </div>
  </CardContent>
  <CardFooter className="flex justify-between">
    <span className="font-semibold">{formatPrice(coach.hourlyRate)}/h</span>
    <Button>Voir le profil</Button>
  </CardFooter>
</Card>
```

#### Bouton "Marquer ce moment"

```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  className="w-16 h-16 rounded-full bg-accent text-accent-foreground 
             flex items-center justify-center shadow-lg"
  onClick={handleMark}
>
  <Star className="h-8 w-8" />
</motion.button>
```

---

### Checklist Design System

Avant de valider un écran :

```markdown
- [ ] Couleurs conformes à la palette
- [ ] Typographie correcte (heading/body/accent)
- [ ] Espacements cohérents (échelle 4px)
- [ ] Border radius appropriés
- [ ] États hover/focus/active définis
- [ ] Animation d'entrée si liste
- [ ] Responsive testé (375px, 768px, 1280px)
- [ ] Dark mode vérifié
- [ ] Accessibilité (contraste, focus visible)
```
