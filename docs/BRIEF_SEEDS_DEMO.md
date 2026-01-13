# BRIEF CLAUDE CODE : Seeds de Démo Réalistes

> **Objectif** : Créer des données de démo crédibles pour présenter l'app à une coach.
> **Temps estimé** : 1h30
> **Principe** : La coach doit se projeter immédiatement dans l'outil.

---

## 🎯 CE QU'ON VEUT MONTRER

| Persona | Ce qu'il voit | Objectif |
|---------|---------------|----------|
| **Coach (Thomas)** | Dashboard rempli, clients, revenus, factures | "Je veux cet outil !" |
| **Coachée (Marie)** | Historique séances, résumés IA, moments marqués | "C'est exactement ce qu'il me faut" |
| **Visiteur** | Liste de coachs variés et crédibles | "Je trouve facilement mon coach" |

---

## ÉTAPE 1 : Coachs fictifs (3-5 profils)

Créer dans `prisma/seed.ts` :

### Coach 1 : Thomas Martin — Executive Coach (B2B)

```typescript
{
  user: {
    email: 'thomas.martin@demo.trustcoach.fr',
    name: 'Thomas Martin',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    role: 'COACH',
  },
  coach: {
    bio: `Ancien directeur commercial chez L'Oréal pendant 15 ans, je me suis reconverti dans le coaching exécutif après une formation certifiante ICF. 

J'accompagne les managers et dirigeants dans leur prise de poste, leur leadership et la gestion des situations complexes.

Ma méthode : un mix de coaching orienté solutions et d'outils issus des neurosciences pour des résultats concrets et durables.`,
    headline: 'Executive Coach • Leadership & Performance',
    specialties: ['Leadership', 'Prise de poste', 'Gestion du stress', 'Management'],
    hourlyRate: 15000, // 150€
    sessionDuration: 60,
    city: 'Paris',
    mode: 'HYBRID',
    languages: ['fr', 'en'],
    
    // B2B
    acceptsCorporate: true,
    methodologies: ['ICF', 'Process Com', 'MBTI'],
    interventionModes: ['INDIVIDUAL', 'TEAM'],
    targetAudience: ['EXECUTIVE', 'MANAGER'],
    dailyRate: 150000, // 1500€/jour
    
    // Infos légales (pour facturation)
    legalName: 'Thomas Martin EI',
    siret: '12345678901234',
    businessAddress: '45 rue du Faubourg Saint-Honoré, 75008 Paris',
    vatExempt: false, // Pas en micro-entreprise
  },
  availabilities: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }, // Lundi matin
    { dayOfWeek: 1, startTime: '14:00', endTime: '18:00' }, // Lundi après-midi
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' }, // Mercredi
    { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' }, // Vendredi matin
  ],
}
```

### Coach 2 : Sophie Dubois — Coach Bien-être (B2C)

```typescript
{
  user: {
    email: 'sophie.dubois@demo.trustcoach.fr',
    name: 'Sophie Dubois',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    role: 'COACH',
  },
  coach: {
    bio: `Après 10 ans dans la communication, j'ai choisi de me consacrer à ce qui me passionne vraiment : accompagner les personnes en quête de sens et d'équilibre.

Formée à la PNL et à la pleine conscience, je propose un accompagnement bienveillant pour vous aider à :
• Retrouver confiance en vous
• Gérer votre stress et vos émotions
• Clarifier vos objectifs de vie

Chaque parcours est unique, et je m'adapte à votre rythme.`,
    headline: 'Coach Bien-être • Confiance & Équilibre',
    specialties: ['Confiance en soi', 'Gestion du stress', 'Équilibre vie pro/perso', 'Développement personnel'],
    hourlyRate: 8000, // 80€
    sessionDuration: 60,
    city: 'Lyon',
    mode: 'REMOTE',
    languages: ['fr'],
    
    // B2C uniquement
    acceptsCorporate: false,
    methodologies: ['PNL', 'Pleine conscience'],
    interventionModes: ['INDIVIDUAL'],
    targetAudience: ['INDIVIDUAL'],
    
    // Infos légales
    legalName: 'Sophie Dubois Entrepreneur Individuel',
    siret: '98765432109876',
    businessAddress: '12 rue de la République, 69001 Lyon',
    vatExempt: true, // Micro-entreprise
  },
  availabilities: [
    { dayOfWeek: 2, startTime: '10:00', endTime: '19:00' }, // Mardi
    { dayOfWeek: 4, startTime: '10:00', endTime: '19:00' }, // Jeudi
    { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' }, // Samedi matin
  ],
}
```

### Coach 3 : Marc Lefebvre — Coach Reconversion

```typescript
{
  user: {
    email: 'marc.lefebvre@demo.trustcoach.fr',
    name: 'Marc Lefebvre',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    role: 'COACH',
  },
  coach: {
    bio: `J'ai moi-même vécu une reconversion professionnelle à 42 ans, passant de l'ingénierie à l'accompagnement. Cette expérience m'a donné une compréhension profonde des défis que vous traversez.

Spécialisé dans les transitions professionnelles, je vous aide à :
• Faire le bilan de vos compétences transférables
• Explorer de nouvelles voies alignées avec vos valeurs
• Construire un plan d'action concret

Mon approche est pragmatique et orientée résultats.`,
    headline: 'Coach Carrière • Reconversion & Transition',
    specialties: ['Reconversion professionnelle', 'Bilan de compétences', 'Recherche d\'emploi', 'Entrepreneuriat'],
    hourlyRate: 9500, // 95€
    sessionDuration: 75,
    city: 'Bordeaux',
    mode: 'HYBRID',
    languages: ['fr', 'en', 'es'],
    
    acceptsCorporate: true,
    methodologies: ['DISC', 'Analyse transactionnelle'],
    interventionModes: ['INDIVIDUAL', 'GROUP'],
    targetAudience: ['INDIVIDUAL', 'EMPLOYEE'],
    
    legalName: 'Marc Lefebvre EI',
    siret: '45678912345678',
    businessAddress: '8 place des Quinconces, 33000 Bordeaux',
    vatExempt: true,
  },
  availabilities: [
    { dayOfWeek: 1, startTime: '14:00', endTime: '20:00' }, // Lundi soir
    { dayOfWeek: 3, startTime: '09:00', endTime: '13:00' }, // Mercredi matin
    { dayOfWeek: 4, startTime: '14:00', endTime: '20:00' }, // Jeudi soir
  ],
}
```

### Coach 4 : Amina Benali — Coach Parentalité

```typescript
{
  user: {
    email: 'amina.benali@demo.trustcoach.fr',
    name: 'Amina Benali',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    role: 'COACH',
  },
  coach: {
    bio: `Maman de 3 enfants et ancienne psychologue scolaire, j'accompagne les parents qui veulent améliorer leur relation avec leurs enfants.

Mon approche s'inspire de la discipline positive et de la communication non-violente (CNV). Je vous aide à :
• Gérer les conflits sans crier
• Poser des limites avec bienveillance
• Retrouver du plaisir dans votre rôle de parent

Les séances peuvent se faire en solo ou en couple.`,
    headline: 'Coach Parentalité • Éducation Positive',
    specialties: ['Parentalité', 'Communication familiale', 'Gestion des conflits', 'Adolescence'],
    hourlyRate: 7000, // 70€
    sessionDuration: 60,
    city: 'Marseille',
    mode: 'REMOTE',
    languages: ['fr', 'ar'],
    
    acceptsCorporate: false,
    methodologies: ['CNV', 'Discipline positive'],
    interventionModes: ['INDIVIDUAL'],
    targetAudience: ['INDIVIDUAL'],
    
    legalName: 'Amina Benali EI',
    siret: '78912345678901',
    businessAddress: '25 boulevard Longchamp, 13001 Marseille',
    vatExempt: true,
  },
  availabilities: [
    { dayOfWeek: 1, startTime: '20:00', endTime: '22:00' }, // Lundi soir (après coucher enfants)
    { dayOfWeek: 3, startTime: '20:00', endTime: '22:00' }, // Mercredi soir
    { dayOfWeek: 5, startTime: '14:00', endTime: '17:00' }, // Vendredi après-midi
  ],
}
```

### Coach 5 : Nicolas Roux — Coach Sportif Mental

```typescript
{
  user: {
    email: 'nicolas.roux@demo.trustcoach.fr',
    name: 'Nicolas Roux',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    role: 'COACH',
  },
  coach: {
    bio: `Ancien athlète de haut niveau (décathlon), je me suis formé à la préparation mentale pour accompagner sportifs et entrepreneurs dans leur quête de performance.

Ma spécialité : vous aider à performer sous pression, que ce soit pour une compétition, un pitch ou une prise de parole importante.

Techniques utilisées : visualisation, ancrage, gestion du stress, routines de performance.`,
    headline: 'Préparateur Mental • Performance & Dépassement',
    specialties: ['Préparation mentale', 'Performance', 'Prise de parole', 'Gestion de la pression'],
    hourlyRate: 12000, // 120€
    sessionDuration: 90,
    city: 'Paris',
    mode: 'HYBRID',
    languages: ['fr', 'en'],
    
    acceptsCorporate: true,
    methodologies: ['Préparation mentale', 'PNL', 'Sophrologie'],
    interventionModes: ['INDIVIDUAL', 'TEAM'],
    targetAudience: ['INDIVIDUAL', 'EXECUTIVE', 'MANAGER'],
    dailyRate: 200000, // 2000€/jour
    
    legalName: 'Nicolas Roux EI',
    siret: '32165498732165',
    businessAddress: '18 avenue des Champs-Élysées, 75008 Paris',
    vatExempt: false,
  },
  availabilities: [
    { dayOfWeek: 2, startTime: '07:00', endTime: '10:00' }, // Mardi tôt
    { dayOfWeek: 2, startTime: '18:00', endTime: '21:00' }, // Mardi soir
    { dayOfWeek: 4, startTime: '07:00', endTime: '10:00' }, // Jeudi tôt
    { dayOfWeek: 4, startTime: '18:00', endTime: '21:00' }, // Jeudi soir
  ],
}
```

---

## ÉTAPE 2 : Utilisatrice démo "Marie"

### User Marie avec historique complet

```typescript
{
  user: {
    email: 'marie.dupont@demo.trustcoach.fr',
    name: 'Marie Dupont',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    role: 'USER',
  },
}
```

### Bookings de Marie avec Thomas (le coach executive)

```typescript
// Séance 1 : Passée il y a 3 semaines (COMPLETED)
{
  booking: {
    userId: marie.id,
    coachId: thomas.coach.id,
    scheduledAt: subWeeks(new Date(), 3),
    duration: 60,
    price: 15000,
    status: 'COMPLETED',
    mode: 'REMOTE',
  },
  session: {
    startedAt: subWeeks(new Date(), 3),
    endedAt: addHours(subWeeks(new Date(), 3), 1),
    audioUrl: 'https://example.com/demo-audio-1.mp3',
    transcription: `[Transcription de la séance 1]
    
Thomas : Bonjour Marie, comment allez-vous depuis notre premier échange ?

Marie : Bonjour Thomas. Honnêtement, la semaine a été difficile. J'ai eu une réunion avec mon N+1 qui s'est mal passée...

Thomas : Racontez-moi ce qui s'est passé.

Marie : Il m'a reproché de ne pas avoir assez de visibilité sur mon équipe. J'ai ressenti ça comme une attaque personnelle. J'ai eu du mal à répondre, je me suis sentie paralysée.

Thomas : Ce que vous décrivez ressemble à une réaction de stress aigu. Qu'avez-vous ressenti physiquement à ce moment-là ?

Marie : Mon cœur s'est accéléré, j'avais les mains moites. Et après la réunion, j'ai ruminé pendant des heures.

Thomas : C'est une réaction normale face à ce que vous avez perçu comme une menace. On va travailler sur deux axes : d'abord, comprendre ce qui se joue émotionnellement, et ensuite, préparer une stratégie pour votre prochaine interaction avec lui.

[...]

Marie : Je réalise que j'ai peur de ne pas être à la hauteur de ce poste. C'est la première fois que je manage une équipe.

Thomas : C'est un insight important. Cette peur est normale, mais elle ne doit pas vous paralyser. On va travailler sur votre posture de manager.`,
    
    summaryRaw: `## Points clés de la séance

### Situation abordée
Marie a vécu une réunion difficile avec son N+1 qui lui a reproché un manque de visibilité sur son équipe. Elle a ressenti cette remarque comme une attaque personnelle et s'est sentie paralysée.

### Émotions identifiées
- Stress aigu pendant la réunion (accélération cardiaque, mains moites)
- Rumination après la réunion
- Peur profonde de ne pas être à la hauteur du poste

### Insight principal
Marie prend conscience que sa réaction est liée à sa peur de l'échec dans son nouveau rôle de manager. C'est sa première expérience de management.

### Pistes de travail
1. Comprendre les mécanismes émotionnels face aux critiques
2. Préparer une stratégie de communication avec le N+1
3. Travailler sur la posture de manager

### Actions pour la prochaine séance
- [ ] Noter les situations où Marie se sent "paralysée"
- [ ] Identifier 3 réussites récentes avec son équipe
- [ ] Préparer les points à aborder avec son N+1`,

    summaryFinal: `## Résumé de votre séance du 23 décembre

### Ce que nous avons exploré
Nous avons analysé votre réaction lors de la réunion difficile avec votre N+1. Vous avez identifié une **peur de ne pas être à la hauteur** de votre nouveau rôle de manager, ce qui explique votre réaction de stress face aux critiques.

### Moment clé ⭐
Votre prise de conscience : "C'est la première fois que je manage une équipe, et j'ai peur de ne pas y arriver."

### Ce que vous allez faire d'ici notre prochaine séance
1. Noter les situations où vous vous sentez paralysée
2. Lister 3 réussites récentes avec votre équipe
3. Réfléchir aux points à clarifier avec votre N+1

### Prochaine séance
Nous travaillerons sur votre posture de manager et préparerons votre prochaine interaction avec votre N+1.`,
  },
  markedMoments: [
    {
      timestamp: 847, // 14:07
      note: 'Prise de conscience : peur de ne pas être à la hauteur',
      createdBy: 'USER',
    },
  ],
}

// Séance 2 : Passée il y a 1 semaine (COMPLETED)
{
  booking: {
    userId: marie.id,
    coachId: thomas.coach.id,
    scheduledAt: subWeeks(new Date(), 1),
    duration: 60,
    price: 15000,
    status: 'COMPLETED',
    mode: 'REMOTE',
  },
  session: {
    summaryFinal: `## Résumé de votre séance du 6 janvier

### Ce que nous avons exploré
Nous avons travaillé sur votre **posture de manager** et préparé votre conversation avec votre N+1. Vous avez identifié que vous aviez tendance à sur-expliquer vos décisions, ce qui peut être perçu comme un manque d'assurance.

### Moments clés ⭐
1. Exercice de prise de parole : vous avez réussi à formuler une demande claire en moins de 30 secondes
2. Déclic : "Je n'ai pas besoin de justifier chaque décision"

### Progrès constatés
- Vous avez eu une conversation constructive avec votre N+1
- Vous vous êtes sentie plus sereine lors de la réunion d'équipe de vendredi
- Votre équipe a remarqué que vous étiez "plus affirmée"

### Actions pour la suite
1. Continuer le journal des réussites
2. Pratiquer la technique "Stop-Respire-Réponds"
3. Oser déléguer une tâche importante cette semaine`,
  },
  markedMoments: [
    {
      timestamp: 623,
      note: 'Exercice prise de parole - demande claire en 30s',
      createdBy: 'COACH',
    },
    {
      timestamp: 1847,
      note: 'Déclic : pas besoin de tout justifier',
      createdBy: 'USER',
    },
  ],
}

// Séance 3 : À venir dans 3 jours (CONFIRMED)
{
  booking: {
    userId: marie.id,
    coachId: thomas.coach.id,
    scheduledAt: addDays(new Date(), 3),
    duration: 60,
    price: 15000,
    status: 'CONFIRMED',
    mode: 'REMOTE',
  },
}
```

---

## ÉTAPE 3 : Facture de démo

```typescript
{
  invoice: {
    number: 'FAC-2026-01-0001',
    coachId: thomas.coach.id,
    userId: marie.id,
    bookingId: booking1.id,
    
    coachLegalName: 'Thomas Martin EI',
    coachSiret: '12345678901234',
    coachAddress: '45 rue du Faubourg Saint-Honoré, 75008 Paris',
    coachVatMention: 'TVA 20%',
    
    clientName: 'Marie Dupont',
    clientEmail: 'marie.dupont@demo.trustcoach.fr',
    
    description: 'Séance de coaching - Leadership & Prise de poste',
    quantity: 1,
    unitPriceHT: 12500, // 125€ HT
    amountHT: 12500,
    amountTTC: 15000, // 150€ TTC
    
    status: 'SENT',
    sentAt: subDays(new Date(), 5),
  },
}
```

---

## ÉTAPE 4 : Conversation de démo (si messagerie implémentée)

```typescript
{
  conversation: {
    userId: marie.id,
    coachId: thomas.coach.id,
    status: 'ACTIVE',
  },
  messages: [
    {
      senderId: marie.id,
      senderType: 'USER',
      content: "Bonjour Thomas, j'ai vu votre profil et votre parcours m'intéresse beaucoup. Je suis en prise de poste depuis 3 mois et j'ai du mal à trouver ma place. Est-ce quelque chose que vous accompagnez ?",
      createdAt: subWeeks(new Date(), 4),
    },
    {
      senderId: thomas.id,
      senderType: 'COACH',
      content: "Bonjour Marie, merci pour votre message. Oui, l'accompagnement des prises de poste est ma spécialité. C'est une période charnière qui mérite un vrai travail. Quels sont vos principaux défis aujourd'hui ?",
      createdAt: subWeeks(new Date(), 4),
    },
    {
      senderId: marie.id,
      senderType: 'USER',
      content: "Mon principal défi c'est de m'affirmer face à mon équipe et mon N+1. J'ai tendance à douter de mes décisions. J'aimerais qu'on travaille là-dessus.",
      createdAt: subWeeks(new Date(), 4),
    },
    {
      senderId: thomas.id,
      senderType: 'COACH',
      content: "Je comprends, c'est très courant en prise de poste. Je vous propose qu'on en discute lors d'une première séance. Vous verrez dans mon calendrier que j'ai des disponibilités cette semaine. À très vite !",
      createdAt: subWeeks(new Date(), 4),
    },
  ],
}
```

---

## ÉTAPE 5 : Certifications et références (pour Thomas)

```typescript
// Certifications
{
  certifications: [
    {
      coachId: thomas.coach.id,
      name: 'Professional Certified Coach (PCC)',
      issuer: 'International Coaching Federation',
      year: 2019,
      verified: true,
      verifiedAt: subMonths(new Date(), 6),
    },
    {
      coachId: thomas.coach.id,
      name: 'Certification Process Communication',
      issuer: 'Kahler Communication France',
      year: 2020,
      verified: true,
    },
  ],
}

// Références entreprises
{
  references: [
    {
      coachId: thomas.coach.id,
      companyName: 'L\'Oréal',
      sector: 'Cosmétiques',
      year: 2023,
      testimonial: 'Thomas a accompagné notre équipe de direction dans une période de transformation. Son approche pragmatique et bienveillante a fait la différence.',
      contactName: 'Sophie R., DRH',
      canDisplay: true,
    },
    {
      coachId: thomas.coach.id,
      companyName: 'BNP Paribas',
      sector: 'Banque',
      year: 2024,
      testimonial: 'Excellent accompagnement de nos managers en prise de poste. Résultats visibles dès les premières semaines.',
      contactName: 'Marc D., Directeur Formation',
      canDisplay: true,
    },
  ],
}
```

---

## 📁 FICHIER SEED COMPLET

Créer/modifier `prisma/seed.ts` avec toutes ces données.

```bash
# Après modification du seed
npx prisma db seed
```

---

## ✅ CHECKLIST

- [ ] 5 coachs avec profils complets et variés
- [ ] Photos Unsplash réalistes
- [ ] Bios crédibles et différenciantes
- [ ] Disponibilités cohérentes
- [ ] User Marie avec historique
- [ ] 2 séances passées avec résumés IA complets
- [ ] Moments marqués ⭐
- [ ] 1 séance à venir
- [ ] 1 facture émise
- [ ] Conversation de démo (si messagerie)
- [ ] Certifications et références pour Thomas

---

## 🎯 COMPTES DE TEST

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Coach | thomas.martin@demo.trustcoach.fr | Demo2024! |
| Coachée | marie.dupont@demo.trustcoach.fr | Demo2024! |
| Visiteur | (pas de compte, navigation publique) | — |

---

**Commence par créer le fichier seed.ts complet puis lance `npx prisma db seed` !**
