# DEFINITION_OF_DONE.md — TrustCoach IA

> Checklists obligatoires avant de considérer une tâche comme "terminée".
> **Règle d'or : Une feature non cochée à 100% n'est PAS terminée.**

---

## 🎯 POURQUOI CE DOCUMENT ?

Sur les projets précédents, on a souvent fait "les murs sans la plomberie" :
- UI codée mais pas les états d'erreur
- Formulaire créé mais pas la validation
- Feature "qui marche" mais qui plante en edge case

**Ce document garantit qu'on livre du code COMPLET, pas du code "à moitié fait".**

---

## ✅ CHECKLIST UNIVERSELLE

> À cocher pour CHAQUE tâche, quel que soit son type.

```markdown
## Checklist universelle
- [ ] Code compilé sans erreur TypeScript (`npm run type-check`)
- [ ] Pas de warning ESLint (`npm run lint`)
- [ ] Console.log de debug supprimés ou préfixés `[DEV]`
- [ ] Test manuel effectué
- [ ] Commit message descriptif (format: `type(scope): description`)
```

---

## 📄 NOUVELLE PAGE

> Création d'une nouvelle route/page dans `/app`

```markdown
## DoD : Nouvelle page

### Technique
- [ ] Route accessible (pas d'erreur 404)
- [ ] TypeScript : Props typées, pas de `any`
- [ ] Composants serveur par défaut (sauf si interactivité nécessaire)

### UI/UX
- [ ] État Loading : Skeleton ou spinner
- [ ] État Empty : Message + action suggérée
- [ ] État Error : Message + bouton retry
- [ ] État Success : Contenu affiché correctement
- [ ] Responsive : Testé mobile (375px) et desktop (1280px)
- [ ] Accessibilité : Navigation clavier, labels aria

### SEO (pages publiques)
- [ ] `<title>` dynamique
- [ ] `<meta name="description">` pertinente
- [ ] Open Graph tags (si partageable)

### Test manuel
- [ ] Rechargement de la page (pas de crash)
- [ ] Navigation depuis une autre page
- [ ] URL directe fonctionne
- [ ] Mobile : testé sur simulateur ou device
```

---

## 🧩 NOUVEAU COMPOSANT

> Création d'un composant dans `/components/features`

```markdown
## DoD : Nouveau composant

### Technique
- [ ] Props typées avec interface explicite
- [ ] Props obligatoires vs optionnelles clairement définies
- [ ] Valeurs par défaut si pertinent
- [ ] Pas de logique métier dans le composant (déléguer aux actions/hooks)

### Variants et états
- [ ] Tous les variants documentés (ex: size="sm" | "md" | "lg")
- [ ] État disabled (si applicable)
- [ ] État loading (si applicable)
- [ ] État error (si applicable)

### Accessibilité
- [ ] Rôle ARIA approprié
- [ ] Labels pour les éléments interactifs
- [ ] Focus visible
- [ ] Navigable au clavier

### Style
- [ ] Utilise les classes Tailwind du design system
- [ ] Pas de styles inline (sauf cas exceptionnel)
- [ ] Dark mode compatible

### Documentation
- [ ] Commentaire JSDoc sur le composant
- [ ] Exemple d'utilisation en commentaire

### Exemple attendu
```tsx
/**
 * Carte affichant un résumé de coach.
 * @example
 * <CoachCard coach={coachData} onBook={() => router.push('/booking')} />
 */
interface CoachCardProps {
  coach: Coach;
  onBook?: () => void;
  variant?: 'compact' | 'full';
}

export function CoachCard({ coach, onBook, variant = 'full' }: CoachCardProps) {
  // ...
}
```
```

---

## ⚡ SERVER ACTION

> Création d'une action serveur dans `/actions`

```markdown
## DoD : Server Action

### Structure obligatoire
- [ ] Directive `'use server'` en haut du fichier
- [ ] Validation Zod des inputs
- [ ] Try/catch avec gestion d'erreur
- [ ] Retour structuré `{ data, error }`
- [ ] Type de retour explicite `Promise<ActionResult<T>>`

### Sécurité
- [ ] Vérification de session (si action protégée)
- [ ] Vérification des permissions (user peut faire cette action ?)
- [ ] Données sensibles jamais loguées

### Logging
- [ ] Log des erreurs avec `console.error('[ACTION_NAME_ERROR]', error)`
- [ ] Pas de log des données sensibles (passwords, tokens)

### Template obligatoire
```typescript
'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { mySchema } from '@/validations/my.schema';
import { ActionResult } from '@/types';

export async function myAction(
  input: z.infer<typeof mySchema>
): Promise<ActionResult<MyType>> {
  try {
    // 1. Auth check (si nécessaire)
    const session = await auth();
    if (!session) {
      return { data: null, error: 'Non autorisé' };
    }

    // 2. Validation
    const validated = mySchema.parse(input);

    // 3. Logique métier
    const result = await myService(validated);

    // 4. Retour succès
    return { data: result, error: null };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: 'Données invalides' };
    }
    console.error('[MY_ACTION_ERROR]', error);
    return { data: null, error: 'Une erreur est survenue' };
  }
}
```
```

---

## 🗄️ NOUVELLE TABLE PRISMA

> Ajout d'un modèle dans `schema.prisma`

```markdown
## DoD : Nouvelle table Prisma

### Schéma
- [ ] Modèle ajouté dans `schema.prisma`
- [ ] `id` avec `@id @default(cuid())`
- [ ] `createdAt` et `updatedAt` (si pertinent)
- [ ] Relations définies (`@relation`)
- [ ] Index sur les champs fréquemment requêtés (`@@index`)
- [ ] Enums créés si nécessaire

### Migration
- [ ] `npx prisma migrate dev --name descriptive_name`
- [ ] Migration appliquée sans erreur
- [ ] Pas de perte de données (si migration sur table existante)

### Seed
- [ ] Données de test ajoutées dans `prisma/seed.ts`
- [ ] `npx prisma db seed` fonctionne

### Vérification
- [ ] `npx prisma studio` : table visible et données accessibles
- [ ] Types générés : `npx prisma generate`

### Documentation
- [ ] Commentaires Prisma sur les champs non évidents
- [ ] Documentation dans `docs/PRISMA_SCHEMA.md` mise à jour
```

---

## 🐛 BUG FIX

> Correction d'un bug existant

```markdown
## DoD : Bug fix

### Diagnostic (AVANT de coder)
- [ ] Symptôme exact identifié
- [ ] Étapes de reproduction documentées
- [ ] Logs ajoutés pour tracer le flux
- [ ] Cause racine identifiée (pas juste le symptôme)

### Correction
- [ ] Fix ciblé (minimum de fichiers modifiés)
- [ ] Pas de refactoring "en passant"
- [ ] Pas d'effets de bord sur d'autres features

### Vérification
- [ ] Bug reproduit AVANT le fix
- [ ] Bug corrigé APRÈS le fix
- [ ] Non-régression : les autres features marchent encore
- [ ] Edge cases vérifiés

### Commit
- [ ] Message format : `fix(scope): description courte`
- [ ] Référence au bug/issue si applicable

### Template de diagnostic
```
## Bug : [Titre]

**Symptôme** : 
[Description de ce qui ne marche pas]

**Reproduction** :
1. Aller sur...
2. Cliquer sur...
3. Observer...

**Attendu** :
[Ce qui devrait se passer]

**Logs** :
[Console.log ajoutés + résultats]

**Cause racine** :
[Explication technique]

**Fix** :
[Description de la solution]
```
```

---

## 🔄 REFACTORING

> Amélioration de code existant sans changer le comportement

```markdown
## DoD : Refactoring

### Avant de commencer
- [ ] Comportement actuel documenté
- [ ] Tests manuels passés AVANT refactoring
- [ ] Scope limité et défini (pas de "refactoring général")

### Pendant
- [ ] Commits atomiques (un changement = un commit)
- [ ] Pas de nouvelle feature cachée
- [ ] Pas de fix de bug caché

### Après
- [ ] Comportement identique (pas de régression)
- [ ] Tests manuels passés APRÈS refactoring
- [ ] Code plus lisible / maintenable

### Commit
- [ ] Message format : `refactor(scope): description`
```

---

## 📱 FEATURE MOBILE-ONLY

> Fonctionnalité spécifique aux apps natives (Capacitor)

```markdown
## DoD : Feature mobile-only

### Détection plateforme
- [ ] Vérification `Capacitor.isNativePlatform()`
- [ ] Fallback ou message explicite sur web

### Permissions
- [ ] Permission demandée avant utilisation
- [ ] Gestion du refus de permission
- [ ] Message explicatif si permission refusée

### Hook personnalisé
- [ ] Logique isolée dans `/hooks`
- [ ] États exposés : `isLoading`, `error`, `data`
- [ ] Cleanup dans `useEffect` si nécessaire

### Tests
- [ ] Testé sur iOS (simulateur ou device)
- [ ] Testé sur Android (simulateur ou device)
- [ ] Comportement web vérifié (fallback)

### Edge cases
- [ ] Pas de connexion réseau
- [ ] App en arrière-plan
- [ ] Interruption (appel téléphonique, etc.)
```

---

## 📝 FORMULAIRE

> Création d'un formulaire avec validation

```markdown
## DoD : Formulaire

### Structure
- [ ] Schéma Zod créé dans `/validations`
- [ ] React Hook Form ou form natif
- [ ] Labels pour chaque champ
- [ ] Placeholders explicites

### Validation
- [ ] Validation côté client (feedback immédiat)
- [ ] Validation côté serveur (Server Action)
- [ ] Messages d'erreur clairs et en français

### États
- [ ] État initial (champs vides ou pré-remplis)
- [ ] État loading (bouton submit désactivé + spinner)
- [ ] État erreur (messages sous les champs)
- [ ] État succès (toast ou redirection)

### Accessibilité
- [ ] Labels liés aux inputs (`htmlFor`)
- [ ] Erreurs annoncées aux lecteurs d'écran
- [ ] Navigation clavier fluide
- [ ] Focus sur premier champ en erreur

### UX
- [ ] Bouton submit désactivé si formulaire invalide
- [ ] Confirmation avant action destructrice
- [ ] Pas de rechargement de page
```

---

## 🚀 SMOKE TEST FINAL

> À faire avant CHAQUE merge/déploiement

```markdown
## Smoke Test Final

### Navigation
- [ ] Page d'accueil charge
- [ ] Login fonctionne
- [ ] Logout fonctionne
- [ ] Navigation principale fonctionne

### Features critiques
- [ ] Recherche de coachs fonctionne
- [ ] Profil coach s'affiche
- [ ] Réservation (jusqu'au paiement test)
- [ ] Résumé de séance (si applicable)

### Mobile
- [ ] App s'ouvre sur iOS
- [ ] App s'ouvre sur Android
- [ ] Navigation bottom bar fonctionne

### Performance
- [ ] Pas de freeze ou lag visible
- [ ] Images chargent correctement
- [ ] Pas d'erreur console (errors, pas warnings)
```

---

## 📋 TEMPLATE DE COMMIT

```
type(scope): description courte

[corps optionnel - explication détaillée]

[footer optionnel - références issues]
```

### Types
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `refactor` : Refactoring (pas de changement de comportement)
- `style` : Formatage, espaces, etc.
- `docs` : Documentation
- `test` : Ajout de tests
- `chore` : Maintenance (deps, config)

### Exemples
```
feat(booking): add calendar picker for slot selection
fix(auth): handle expired session redirect
refactor(coach): extract card component from list
docs(readme): add setup instructions
```

---

*Dernière mise à jour : Janvier 2026*
