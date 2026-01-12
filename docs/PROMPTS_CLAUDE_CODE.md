# Prompt de lancement pour Claude Code

> Copie-colle ce prompt lors de ta première session Claude Code.

---

## 🚀 Prompt de démarrage (Task 1.1)

```
Claude, lis attentivement le fichier CLAUDE.md à la racine. C'est ta constitution pour ce projet.

Ensuite, lis tous les fichiers dans le dossier docs/ :
- ARCHITECTURE.md (stack, patterns, Design System)
- SPECS.md (roadmap, tâches)
- DEFINITION_OF_DONE.md (checklists)
- PRISMA_SCHEMA.md (schéma BDD)

Une fois que tu as tout lu, exécute la Task 1.1 de SPECS.md : Setup projet.

Critères de succès pour cette tâche :
- [ ] npm run dev lance l'app sans erreur
- [ ] Structure des dossiers conforme à ARCHITECTURE.md
- [ ] TypeScript strict activé (no any, no implicit)
- [ ] Tailwind CSS + shadcn/ui installés
- [ ] Framer Motion installé
- [ ] Fonts configurées (DM Sans, Inter, Literata)
- [ ] Capacitor configuré
- [ ] Variables CSS du Design System en place
- [ ] .env.example créé avec les variables nécessaires

Important :
- Applique rigoureusement la Definition of Done
- On commence par les fondations, ne brûle pas les étapes
- Montre-moi la structure des dossiers une fois terminé

NE PASSE PAS à la Task 1.2 avant ma validation explicite.
```

---

## 📋 Prompts pour les tâches suivantes

### Task 1.2 : Base de données Prisma

```
Claude, exécute la Task 1.2 de SPECS.md : Base de données Prisma.

Utilise le schéma complet documenté dans docs/PRISMA_SCHEMA.md.
Commence par les modèles essentiels au MVP :
- User, Account, VerificationToken (NextAuth)
- Coach (avec tous les champs B2B)
- Availability

Critères de succès :
- [ ] schema.prisma créé selon PRISMA_SCHEMA.md
- [ ] Migration initiale appliquée
- [ ] Seed de test avec 3 coachs (1 B2C, 2 B2B)
- [ ] npx prisma studio accessible

NE PASSE PAS à la Task 1.3 avant ma validation.
```

### Task 1.3 : Authentification NextAuth

```
Claude, exécute la Task 1.3 de SPECS.md : Authentification NextAuth.

Critères de succès :
- [ ] Page /login avec formulaire email + password
- [ ] Page /register avec choix de rôle (User ou Coach)
- [ ] Session persistée
- [ ] Redirection après login
- [ ] Protection des routes /dashboard/*
- [ ] Validation Zod des formulaires
- [ ] Gestion des erreurs (email existant, mot de passe faible)

Applique le pattern Server Action documenté dans ARCHITECTURE.md.

NE PASSE PAS à la Task 1.4 avant ma validation.
```

### Task 1.4 : Layout et navigation

```
Claude, exécute la Task 1.4 de SPECS.md : Layout et navigation.

Applique le Design System "Serene Clarity" documenté dans ARCHITECTURE.md :
- Palette de couleurs (Deep Navy, Sage Green, Soft Linen)
- Typographie (DM Sans headings, Inter body)
- Espacements (échelle Tailwind)

Critères de succès :
- [ ] Header avec logo + menu + avatar user
- [ ] Sidebar dashboard (desktop)
- [ ] Bottom navigation (mobile)
- [ ] Dark mode toggle
- [ ] Responsive (mobile-first, testé 375px et 1280px)
- [ ] Animations d'entrée avec Framer Motion

NE PASSE PAS à la Phase 2 avant ma validation.
```

---

## 🔄 Prompt de review (à envoyer à Gemini)

Quand Claude Code génère du code complexe, envoie ce message à Gemini :

```
Gemini, voici le code que Claude Code a généré pour [NOM DE LA TÂCHE].

[COLLER LE CODE ICI]

Questions :
1. Est-ce que ça respecte l'architecture "Pragmatic Clean Layout" ?
2. Est-ce que les types B2B sont correctement utilisés ?
3. Est-ce que le Design System "Serene Clarity" est appliqué ?
4. Y a-t-il des red flags ou des améliorations à suggérer ?
```

---

## ⚠️ Prompts de debug (si Claude s'égare)

### Si Claude crée un système parallèle

```
STOP. Tu violes la règle "NO PARALLEL SYSTEMS" du CLAUDE.md.

Avant de créer [NOM DU FICHIER], vérifie :
1. Est-ce qu'un fichier similaire existe déjà ?
2. Peux-tu étendre l'existant plutôt que créer du nouveau ?

Liste-moi les fichiers existants dans [DOSSIER] avant de continuer.
```

### Si Claude code sans diagnostic

```
STOP. Tu violes la règle "DIAGNOSTIC FIRST" du CLAUDE.md.

Avant de proposer un fix, ajoute des console.log pour :
1. Logger les données d'entrée
2. Logger les données de sortie
3. Identifier où le problème se situe exactement

Montre-moi les logs avant de proposer une solution.
```

### Si une tâche prend plus de 2h

```
STOP. Cette tâche dépasse le temps prévu (2h max).

Découpe-la en sous-tâches plus petites.
Livre ce qui fonctionne maintenant.
On continuera dans une nouvelle session.
```

---

## ✅ Checklist de fin de session

Avant de terminer une session Claude Code :

```
Claude, avant de terminer, confirme :

- [ ] Tout le code compile sans erreur TypeScript
- [ ] npm run lint passe sans warning
- [ ] Les console.log de debug sont supprimés ou préfixés [DEV]
- [ ] La Definition of Done de la tâche est 100% cochée
- [ ] Les fichiers créés sont listés dans un récapitulatif

Génère un message de commit au format :
type(scope): description courte
```
