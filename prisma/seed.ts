import {
  PrismaClient,
  Role,
  BadgeLevel,
  InterventionMode,
  TargetAudience,
  BookingStatus,
  InvoiceStatus,
  SessionStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

// Helper pour les dates
function subWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - weeks * 7);
  return result;
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function setTime(date: Date, hours: number, minutes: number): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

async function main() {
  console.log("🌱 Seeding database with demo data...\n");

  // =============================================
  // ÉTAPE 0: CLEANUP - Supprimer les données existantes
  // =============================================
  console.log("🧹 Cleaning up existing demo data...");

  // Supprimer dans l'ordre pour respecter les contraintes FK
  await prisma.chatMessage.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.markedMoment.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.certification.deleteMany({});
  await prisma.coachReference.deleteMany({});
  await prisma.coach.deleteMany({});

  console.log("  ✅ Cleanup complete\n");

  // =============================================
  // ÉTAPE 1: COACHS
  // =============================================
  console.log("📌 Creating coaches...");

  // COACH 1: Thomas Martin (Jeff) — Executive Coach B2B
  const thomasUser = await prisma.user.upsert({
    where: { email: "jeff@eddy.tv" },
    update: {
      name: "Thomas Martin",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      role: Role.ADMIN,
    },
    create: {
      email: "jeff@eddy.tv",
      name: "Thomas Martin",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      role: Role.ADMIN,
    },
  });

  const thomasCoach = await prisma.coach.create({
    data: {
      userId: thomasUser.id,
      bio: `Ancien directeur commercial chez L'Oréal pendant 15 ans, je me suis reconverti dans le coaching exécutif après une formation certifiante ICF.

J'accompagne les managers et dirigeants dans leur prise de poste, leur leadership et la gestion des situations complexes.

Ma méthode : un mix de coaching orienté solutions et d'outils issus des neurosciences pour des résultats concrets et durables.`,
      headline: "Executive Coach • Leadership & Performance",
      specialties: ["Leadership", "Prise de poste", "Gestion du stress", "Management"],
      languages: ["fr", "en"],
      methodologies: ["ICF", "Process Com", "MBTI"],
      interventionModes: [InterventionMode.INDIVIDUAL, InterventionMode.TEAM],
      targetAudience: [TargetAudience.EXECUTIVE, TargetAudience.MANAGER],
      acceptsCorporate: true,
      hourlyRate: 15000,
      dailyRate: 150000,
      verified: true,
      badgeLevel: BadgeLevel.PREMIUM,
      city: "Paris",
      country: "FR",
      offersInPerson: true,
      offersRemote: true,
      legalName: "Thomas Martin EI",
      siret: "12345678901234",
      businessAddress: "45 rue du Faubourg Saint-Honoré, 75008 Paris",
      vatExempt: false,
      totalSessions: 127,
      averageRating: 4.9,
    },
  });

  // Disponibilités Thomas
  await prisma.availability.createMany({
    data: [
      { coachId: thomasCoach.id, dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
      { coachId: thomasCoach.id, dayOfWeek: 1, startTime: "14:00", endTime: "18:00" },
      { coachId: thomasCoach.id, dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
      { coachId: thomasCoach.id, dayOfWeek: 5, startTime: "09:00", endTime: "12:00" },
    ],
  });

  // Certifications Thomas
  await prisma.certification.createMany({
    data: [
      {
        coachId: thomasCoach.id,
        name: "Professional Certified Coach (PCC)",
        issuer: "International Coaching Federation",
        year: 2019,
        verified: true,
      },
      {
        coachId: thomasCoach.id,
        name: "Certification Process Communication",
        issuer: "Kahler Communication France",
        year: 2020,
        verified: true,
      },
    ],
  });

  // Références Thomas
  await prisma.coachReference.createMany({
    data: [
      {
        coachId: thomasCoach.id,
        companyName: "L'Oréal",
        sector: "Cosmétiques",
        year: 2023,
        testimonial: "Thomas a accompagné notre équipe de direction dans une période de transformation. Son approche pragmatique et bienveillante a fait la différence.",
        contactName: "Sophie R., DRH",
        canDisplay: true,
      },
      {
        coachId: thomasCoach.id,
        companyName: "BNP Paribas",
        sector: "Banque",
        year: 2024,
        testimonial: "Excellent accompagnement de nos managers en prise de poste. Résultats visibles dès les premières semaines.",
        contactName: "Marc D., Directeur Formation",
        canDisplay: true,
      },
    ],
  });

  console.log("  ✅ Thomas Martin (Jeff) — Executive Coach");

  // COACH 2: Sophie Dubois (Candice) — Coach Bien-être B2C
  const sophieUser = await prisma.user.upsert({
    where: { email: "candice@aocprod.com" },
    update: {
      name: "Sophie Dubois",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
      role: Role.ADMIN,
    },
    create: {
      email: "candice@aocprod.com",
      name: "Sophie Dubois",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
      role: Role.ADMIN,
    },
  });

  const sophieCoach = await prisma.coach.create({
    data: {
      userId: sophieUser.id,
      bio: `Après 10 ans dans la communication, j'ai choisi de me consacrer à ce qui me passionne vraiment : accompagner les personnes en quête de sens et d'équilibre.

Formée à la PNL et à la pleine conscience, je propose un accompagnement bienveillant pour vous aider à :
• Retrouver confiance en vous
• Gérer votre stress et vos émotions
• Clarifier vos objectifs de vie

Chaque parcours est unique, et je m'adapte à votre rythme.`,
      headline: "Coach Bien-être • Confiance & Équilibre",
      specialties: ["Confiance en soi", "Gestion du stress", "Équilibre vie pro/perso", "Développement personnel"],
      languages: ["fr"],
      methodologies: ["PNL", "Pleine conscience"],
      interventionModes: [InterventionMode.INDIVIDUAL],
      targetAudience: [TargetAudience.INDIVIDUAL],
      acceptsCorporate: false,
      hourlyRate: 8000,
      verified: true,
      badgeLevel: BadgeLevel.VERIFIED,
      city: "Lyon",
      country: "FR",
      offersInPerson: false,
      offersRemote: true,
      legalName: "Sophie Dubois Entrepreneur Individuel",
      siret: "98765432109876",
      businessAddress: "12 rue de la République, 69001 Lyon",
      vatExempt: true,
      totalSessions: 89,
      averageRating: 4.8,
    },
  });

  await prisma.availability.createMany({
    data: [
      { coachId: sophieCoach.id, dayOfWeek: 2, startTime: "10:00", endTime: "19:00" },
      { coachId: sophieCoach.id, dayOfWeek: 4, startTime: "10:00", endTime: "19:00" },
      { coachId: sophieCoach.id, dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
    ],
  });

  console.log("  ✅ Sophie Dubois (Candice) — Coach Bien-être");

  // COACH 3: Marc Lefebvre — Coach Reconversion
  const marcUser = await prisma.user.upsert({
    where: { email: "marc.lefebvre@demo.trustcoach.fr" },
    update: {},
    create: {
      email: "marc.lefebvre@demo.trustcoach.fr",
      name: "Marc Lefebvre",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      role: Role.COACH,
    },
  });

  const marcCoach = await prisma.coach.create({
    data: {
      userId: marcUser.id,
      bio: `J'ai moi-même vécu une reconversion professionnelle à 42 ans, passant de l'ingénierie à l'accompagnement. Cette expérience m'a donné une compréhension profonde des défis que vous traversez.

Spécialisé dans les transitions professionnelles, je vous aide à :
• Faire le bilan de vos compétences transférables
• Explorer de nouvelles voies alignées avec vos valeurs
• Construire un plan d'action concret

Mon approche est pragmatique et orientée résultats.`,
      headline: "Coach Carrière • Reconversion & Transition",
      specialties: ["Reconversion professionnelle", "Bilan de compétences", "Recherche d'emploi", "Entrepreneuriat"],
      languages: ["fr", "en", "es"],
      methodologies: ["DISC", "Analyse transactionnelle"],
      interventionModes: [InterventionMode.INDIVIDUAL, InterventionMode.GROUP],
      targetAudience: [TargetAudience.INDIVIDUAL, TargetAudience.EMPLOYEE],
      acceptsCorporate: true,
      hourlyRate: 9500,
      verified: true,
      badgeLevel: BadgeLevel.VERIFIED,
      city: "Bordeaux",
      country: "FR",
      offersInPerson: true,
      offersRemote: true,
      legalName: "Marc Lefebvre EI",
      siret: "45678912345678",
      businessAddress: "8 place des Quinconces, 33000 Bordeaux",
      vatExempt: true,
      totalSessions: 64,
      averageRating: 4.7,
    },
  });

  await prisma.availability.createMany({
    data: [
      { coachId: marcCoach.id, dayOfWeek: 1, startTime: "14:00", endTime: "20:00" },
      { coachId: marcCoach.id, dayOfWeek: 3, startTime: "09:00", endTime: "13:00" },
      { coachId: marcCoach.id, dayOfWeek: 4, startTime: "14:00", endTime: "20:00" },
    ],
  });

  console.log("  ✅ Marc Lefebvre — Coach Reconversion");

  // COACH 4: Amina Benali — Coach Parentalité
  const aminaUser = await prisma.user.upsert({
    where: { email: "amina.benali@demo.trustcoach.fr" },
    update: {},
    create: {
      email: "amina.benali@demo.trustcoach.fr",
      name: "Amina Benali",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      role: Role.COACH,
    },
  });

  const aminaCoach = await prisma.coach.create({
    data: {
      userId: aminaUser.id,
      bio: `Maman de 3 enfants et ancienne psychologue scolaire, j'accompagne les parents qui veulent améliorer leur relation avec leurs enfants.

Mon approche s'inspire de la discipline positive et de la communication non-violente (CNV). Je vous aide à :
• Gérer les conflits sans crier
• Poser des limites avec bienveillance
• Retrouver du plaisir dans votre rôle de parent

Les séances peuvent se faire en solo ou en couple.`,
      headline: "Coach Parentalité • Éducation Positive",
      specialties: ["Parentalité", "Communication familiale", "Gestion des conflits", "Adolescence"],
      languages: ["fr", "ar"],
      methodologies: ["CNV", "Discipline positive"],
      interventionModes: [InterventionMode.INDIVIDUAL],
      targetAudience: [TargetAudience.INDIVIDUAL],
      acceptsCorporate: false,
      hourlyRate: 7000,
      verified: true,
      badgeLevel: BadgeLevel.VERIFIED,
      city: "Marseille",
      country: "FR",
      offersInPerson: false,
      offersRemote: true,
      legalName: "Amina Benali EI",
      siret: "78912345678901",
      businessAddress: "25 boulevard Longchamp, 13001 Marseille",
      vatExempt: true,
      totalSessions: 156,
      averageRating: 4.9,
    },
  });

  await prisma.availability.createMany({
    data: [
      { coachId: aminaCoach.id, dayOfWeek: 1, startTime: "20:00", endTime: "22:00" },
      { coachId: aminaCoach.id, dayOfWeek: 3, startTime: "20:00", endTime: "22:00" },
      { coachId: aminaCoach.id, dayOfWeek: 5, startTime: "14:00", endTime: "17:00" },
    ],
  });

  console.log("  ✅ Amina Benali — Coach Parentalité");

  // COACH 5: Nicolas Roux — Préparateur Mental
  const nicolasUser = await prisma.user.upsert({
    where: { email: "nicolas.roux@demo.trustcoach.fr" },
    update: {},
    create: {
      email: "nicolas.roux@demo.trustcoach.fr",
      name: "Nicolas Roux",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
      role: Role.COACH,
    },
  });

  const nicolasCoach = await prisma.coach.create({
    data: {
      userId: nicolasUser.id,
      bio: `Ancien athlète de haut niveau (décathlon), je me suis formé à la préparation mentale pour accompagner sportifs et entrepreneurs dans leur quête de performance.

Ma spécialité : vous aider à performer sous pression, que ce soit pour une compétition, un pitch ou une prise de parole importante.

Techniques utilisées : visualisation, ancrage, gestion du stress, routines de performance.`,
      headline: "Préparateur Mental • Performance & Dépassement",
      specialties: ["Préparation mentale", "Performance", "Prise de parole", "Gestion de la pression"],
      languages: ["fr", "en"],
      methodologies: ["Préparation mentale", "PNL", "Sophrologie"],
      interventionModes: [InterventionMode.INDIVIDUAL, InterventionMode.TEAM],
      targetAudience: [TargetAudience.INDIVIDUAL, TargetAudience.EXECUTIVE, TargetAudience.MANAGER],
      acceptsCorporate: true,
      hourlyRate: 12000,
      dailyRate: 200000,
      verified: true,
      badgeLevel: BadgeLevel.PREMIUM,
      city: "Paris",
      country: "FR",
      offersInPerson: true,
      offersRemote: true,
      legalName: "Nicolas Roux EI",
      siret: "32165498732165",
      businessAddress: "18 avenue des Champs-Élysées, 75008 Paris",
      vatExempt: false,
      totalSessions: 203,
      averageRating: 4.8,
    },
  });

  await prisma.availability.createMany({
    data: [
      { coachId: nicolasCoach.id, dayOfWeek: 2, startTime: "07:00", endTime: "10:00" },
      { coachId: nicolasCoach.id, dayOfWeek: 2, startTime: "18:00", endTime: "21:00" },
      { coachId: nicolasCoach.id, dayOfWeek: 4, startTime: "07:00", endTime: "10:00" },
      { coachId: nicolasCoach.id, dayOfWeek: 4, startTime: "18:00", endTime: "21:00" },
    ],
  });

  console.log("  ✅ Nicolas Roux — Préparateur Mental");

  // =============================================
  // ÉTAPE 2: COACHÉS
  // =============================================
  console.log("\n📌 Creating coachees...");

  // COACHÉE 1: Marie Dupont (Fabrice) — Cliente de Thomas
  const marieUser = await prisma.user.upsert({
    where: { email: "fabrice@aocprod.com" },
    update: {
      name: "Marie Dupont",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
      role: Role.ADMIN,
    },
    create: {
      email: "fabrice@aocprod.com",
      name: "Marie Dupont",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
      role: Role.ADMIN,
    },
  });

  console.log("  ✅ Marie Dupont (Fabrice)");

  // COACHÉE 2: Laura Petit (Katia) — Cliente de Sophie
  const lauraUser = await prisma.user.upsert({
    where: { email: "kdenard@gmail.com" },
    update: {
      name: "Laura Petit",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      role: Role.ADMIN,
    },
    create: {
      email: "kdenard@gmail.com",
      name: "Laura Petit",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      role: Role.ADMIN,
    },
  });

  console.log("  ✅ Laura Petit (Katia)");

  // =============================================
  // ÉTAPE 3: BOOKINGS ET SESSIONS
  // =============================================
  console.log("\n📌 Creating bookings and sessions...");

  const now = new Date();

  // BOOKING 1: Marie ↔ Thomas — Séance 1 (il y a 3 semaines, COMPLETED)
  const booking1Date = setTime(subWeeks(now, 3), 10, 0);
  const booking1 = await prisma.booking.create({
    data: {
      userId: marieUser.id,
      coachId: thomasCoach.id,
      scheduledAt: booking1Date,
      duration: 60,
      price: 15000,
      status: BookingStatus.COMPLETED,
      mode: "REMOTE",
      currency: "EUR",
      session: {
        create: {
          status: SessionStatus.COMPLETED,
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
          summaryFinal: `## Résumé de votre séance du ${booking1Date.toLocaleDateString("fr-FR")}

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
      },
    },
  });

  // Moment marqué pour la séance 1
  const session1 = await prisma.session.findUnique({ where: { bookingId: booking1.id } });
  if (session1) {
    await prisma.markedMoment.create({
      data: {
        sessionId: session1.id,
        timestamp: 847,
        note: "Prise de conscience : peur de ne pas être à la hauteur",
      },
    });
  }

  console.log("  ✅ Booking 1: Marie ↔ Thomas (Séance 1 - Completed)");

  // BOOKING 2: Marie ↔ Thomas — Séance 2 (il y a 1 semaine, COMPLETED)
  const booking2Date = setTime(subWeeks(now, 1), 10, 0);
  const booking2 = await prisma.booking.create({
    data: {
      userId: marieUser.id,
      coachId: thomasCoach.id,
      scheduledAt: booking2Date,
      duration: 60,
      price: 15000,
      status: BookingStatus.COMPLETED,
      mode: "REMOTE",
      currency: "EUR",
      session: {
        create: {
          status: SessionStatus.COMPLETED,
          summaryRaw: `## Résumé de votre séance du ${booking2Date.toLocaleDateString("fr-FR")}

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
          summaryFinal: `## Résumé de votre séance du ${booking2Date.toLocaleDateString("fr-FR")}

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
      },
    },
  });

  // Moments marqués pour la séance 2
  const session2 = await prisma.session.findUnique({ where: { bookingId: booking2.id } });
  if (session2) {
    await prisma.markedMoment.createMany({
      data: [
        {
          sessionId: session2.id,
          timestamp: 623,
          note: "Exercice prise de parole - demande claire en 30s",
        },
        {
          sessionId: session2.id,
          timestamp: 1847,
          note: "Déclic : pas besoin de tout justifier",
        },
      ],
    });
  }

  console.log("  ✅ Booking 2: Marie ↔ Thomas (Séance 2 - Completed)");

  // BOOKING 3: Marie ↔ Thomas — Séance 3 (dans 3 jours, CONFIRMED)
  const booking3Date = setTime(addDays(now, 3), 10, 0);
  await prisma.booking.create({
    data: {
      userId: marieUser.id,
      coachId: thomasCoach.id,
      scheduledAt: booking3Date,
      duration: 60,
      price: 15000,
      status: BookingStatus.CONFIRMED,
      mode: "REMOTE",
      currency: "EUR",
    },
  });

  console.log("  ✅ Booking 3: Marie ↔ Thomas (Séance 3 - À venir)");

  // BOOKING 4: Laura ↔ Sophie — Séance 1 (il y a 10 jours, COMPLETED)
  const booking4Date = setTime(subDays(now, 10), 14, 0);
  await prisma.booking.create({
    data: {
      userId: lauraUser.id,
      coachId: sophieCoach.id,
      scheduledAt: booking4Date,
      duration: 60,
      price: 8000,
      status: BookingStatus.COMPLETED,
      mode: "REMOTE",
      currency: "EUR",
      session: {
        create: {
          status: SessionStatus.COMPLETED,
          summaryRaw: `## Résumé de votre séance du ${booking4Date.toLocaleDateString("fr-FR")}

### Ce que nous avons exploré
Nous avons fait connaissance et identifié vos objectifs pour cet accompagnement. Vous traversez une période de **questionnement professionnel** : après 8 ans dans le même poste, vous ressentez un besoin de changement mais avez du mal à identifier ce que vous voulez vraiment.

### Ce qui a émergé
- Un sentiment d'ennui au travail depuis environ 1 an
- La peur de "tout plaquer" sans savoir où aller
- Une envie de retrouver du sens et de l'enthousiasme

### Exercice proposé
Tenir un "journal de joie" pendant 2 semaines : noter chaque jour 3 moments où vous avez ressenti du plaisir, même minime.

### Prochaine séance
Nous analyserons ensemble votre journal pour identifier des patterns et pistes d'exploration.`,
          summaryFinal: `## Résumé de votre séance du ${booking4Date.toLocaleDateString("fr-FR")}

### Ce que nous avons exploré
Nous avons fait connaissance et identifié vos objectifs pour cet accompagnement. Vous traversez une période de **questionnement professionnel** : après 8 ans dans le même poste, vous ressentez un besoin de changement mais avez du mal à identifier ce que vous voulez vraiment.

### Ce qui a émergé
- Un sentiment d'ennui au travail depuis environ 1 an
- La peur de "tout plaquer" sans savoir où aller
- Une envie de retrouver du sens et de l'enthousiasme

### Exercice proposé
Tenir un "journal de joie" pendant 2 semaines : noter chaque jour 3 moments où vous avez ressenti du plaisir, même minime.

### Prochaine séance
Nous analyserons ensemble votre journal pour identifier des patterns et pistes d'exploration.`,
        },
      },
    },
  });

  console.log("  ✅ Booking 4: Laura ↔ Sophie (Séance 1 - Completed)");

  // BOOKING 5: Laura ↔ Sophie — Séance 2 (dans 4 jours, CONFIRMED)
  const booking5Date = setTime(addDays(now, 4), 14, 0);
  await prisma.booking.create({
    data: {
      userId: lauraUser.id,
      coachId: sophieCoach.id,
      scheduledAt: booking5Date,
      duration: 60,
      price: 8000,
      status: BookingStatus.CONFIRMED,
      mode: "REMOTE",
      currency: "EUR",
    },
  });

  console.log("  ✅ Booking 5: Laura ↔ Sophie (Séance 2 - À venir)");

  // =============================================
  // ÉTAPE 4: FACTURES
  // =============================================
  console.log("\n📌 Creating invoices...");

  // Facture pour la séance 1 de Marie avec Thomas
  await prisma.invoice.create({
    data: {
      number: "FAC-2026-01-0001",
      coachId: thomasCoach.id,
      userId: marieUser.id,
      bookingId: booking1.id,
      coachLegalName: "Thomas Martin EI",
      coachSiret: "12345678901234",
      coachAddress: "45 rue du Faubourg Saint-Honoré, 75008 Paris",
      coachVatMention: "TVA 20%",
      clientName: "Marie Dupont",
      clientEmail: "fabrice@aocprod.com",
      description: "Séance de coaching - Leadership & Prise de poste",
      quantity: 1,
      unitPriceHT: 12500,
      amountHT: 12500,
      amountTTC: 15000,
      status: InvoiceStatus.SENT,
      sentAt: subDays(now, 5),
    },
  });

  console.log("  ✅ Facture FAC-2026-01-0001 (Thomas → Marie)");

  // =============================================
  // ÉTAPE 5: CONVERSATIONS
  // =============================================
  console.log("\n📌 Creating conversations...");

  // Conversation Thomas ↔ Marie
  const conversation1 = await prisma.conversation.create({
    data: {
      userId: marieUser.id,
      coachId: thomasCoach.id,
      status: "ACTIVE",
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        conversationId: conversation1.id,
        senderId: marieUser.id,
        senderRole: "USER",
        content: "Bonjour Thomas, j'ai vu votre profil et votre parcours m'intéresse beaucoup. Je suis en prise de poste depuis 3 mois et j'ai du mal à trouver ma place. Est-ce quelque chose que vous accompagnez ?",
        createdAt: subWeeks(now, 4),
      },
      {
        conversationId: conversation1.id,
        senderId: thomasUser.id,
        senderRole: "COACH",
        content: "Bonjour Marie, merci pour votre message. Oui, l'accompagnement des prises de poste est ma spécialité. C'est une période charnière qui mérite un vrai travail. Quels sont vos principaux défis aujourd'hui ?",
        createdAt: subWeeks(now, 4),
      },
      {
        conversationId: conversation1.id,
        senderId: marieUser.id,
        senderRole: "USER",
        content: "Mon principal défi c'est de m'affirmer face à mon équipe et mon N+1. J'ai tendance à douter de mes décisions. J'aimerais qu'on travaille là-dessus.",
        createdAt: subWeeks(now, 4),
      },
      {
        conversationId: conversation1.id,
        senderId: thomasUser.id,
        senderRole: "COACH",
        content: "Je comprends, c'est très courant en prise de poste. Je vous propose qu'on en discute lors d'une première séance. Vous verrez dans mon calendrier que j'ai des disponibilités cette semaine. À très vite !",
        createdAt: subWeeks(now, 4),
      },
    ],
  });

  console.log("  ✅ Conversation Thomas ↔ Marie");

  // Conversation Sophie ↔ Laura
  const conversation2 = await prisma.conversation.create({
    data: {
      userId: lauraUser.id,
      coachId: sophieCoach.id,
      status: "ACTIVE",
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        conversationId: conversation2.id,
        senderId: lauraUser.id,
        senderRole: "USER",
        content: "Bonjour Sophie, je cherche un accompagnement pour m'aider à y voir plus clair dans ma vie professionnelle. J'ai l'impression de tourner en rond depuis quelques mois.",
        createdAt: subWeeks(now, 2),
      },
      {
        conversationId: conversation2.id,
        senderId: sophieUser.id,
        senderRole: "COACH",
        content: "Bonjour Laura, merci de votre message. Ce sentiment est plus courant qu'on ne le pense, et c'est souvent le signe qu'un changement est nécessaire. Qu'est-ce qui vous a poussée à chercher un accompagnement maintenant ?",
        createdAt: subWeeks(now, 2),
      },
      {
        conversationId: conversation2.id,
        senderId: lauraUser.id,
        senderRole: "USER",
        content: "Je crois que j'ai besoin d'un regard extérieur. Mes proches me disent que j'ai 'tout pour être heureuse' mais je ne me sens pas épanouie. J'aimerais comprendre ce qui me manque.",
        createdAt: subWeeks(now, 2),
      },
      {
        conversationId: conversation2.id,
        senderId: sophieUser.id,
        senderRole: "COACH",
        content: "Je comprends parfaitement. Chercher l'épanouissement n'a rien à voir avec 'avoir tout'. C'est un chemin personnel. Je vous propose une première séance pour explorer ensemble ce qui compte vraiment pour vous. Vous trouverez mes disponibilités dans mon calendrier.",
        createdAt: subWeeks(now, 2),
      },
    ],
  });

  console.log("  ✅ Conversation Sophie ↔ Laura");

  // =============================================
  // ÉTAPE 6: BOOKINGS POUR THOMAS (en tant que client)
  // =============================================
  console.log("\n📌 Creating bookings for Thomas as a client...");

  // Thomas (jeff@eddy.tv) est aussi client de Nicolas (Préparateur Mental)
  // Cela permet de tester l'espace client avec le même compte

  // BOOKING 6: Thomas ↔ Nicolas — Séance 1 (il y a 2 semaines, COMPLETED)
  const booking6Date = setTime(subWeeks(now, 2), 18, 0);
  const booking6 = await prisma.booking.create({
    data: {
      userId: thomasUser.id,
      coachId: nicolasCoach.id,
      scheduledAt: booking6Date,
      duration: 60,
      price: 12000,
      status: BookingStatus.COMPLETED,
      mode: "IN_PERSON",
      currency: "EUR",
      session: {
        create: {
          status: SessionStatus.COMPLETED,
          summaryRaw: `## Résumé de votre séance du ${booking6Date.toLocaleDateString("fr-FR")}

### Ce que nous avons exploré
Première séance ensemble. Nous avons identifié vos objectifs : **améliorer votre performance lors des présentations en public** et **gérer le stress avant les événements importants**.

### Ce qui a émergé
- Une anxiété anticipatoire importante avant les keynotes
- Des symptômes physiques (mains moites, voix qui tremble) les 5 premières minutes
- Une fois lancé, vous retrouvez vos moyens

### Techniques abordées
1. La technique de respiration 4-7-8 pour calmer le système nerveux
2. L'ancrage : créer un geste associé à un état de confiance

### Actions pour la prochaine séance
- Pratiquer la respiration 4-7-8 chaque matin pendant 5 minutes
- Identifier 3 moments de votre vie où vous vous êtes senti totalement confiant`,
          summaryFinal: `## Résumé de votre séance du ${booking6Date.toLocaleDateString("fr-FR")}

### Ce que nous avons exploré
Première séance ensemble. Nous avons identifié vos objectifs : **améliorer votre performance lors des présentations en public** et **gérer le stress avant les événements importants**.

### Ce qui a émergé
- Une anxiété anticipatoire importante avant les keynotes
- Des symptômes physiques (mains moites, voix qui tremble) les 5 premières minutes
- Une fois lancé, vous retrouvez vos moyens

### Techniques abordées
1. La technique de respiration 4-7-8 pour calmer le système nerveux
2. L'ancrage : créer un geste associé à un état de confiance

### Actions pour la prochaine séance
- Pratiquer la respiration 4-7-8 chaque matin pendant 5 minutes
- Identifier 3 moments de votre vie où vous vous êtes senti totalement confiant`,
        },
      },
    },
  });

  // Moment marqué
  const session6 = await prisma.session.findUnique({ where: { bookingId: booking6.id } });
  if (session6) {
    await prisma.markedMoment.create({
      data: {
        sessionId: session6.id,
        timestamp: 1523,
        note: "Technique d'ancrage - geste de confiance identifié",
      },
    });
  }

  console.log("  ✅ Booking 6: Thomas ↔ Nicolas (Séance 1 - Completed)");

  // BOOKING 7: Thomas ↔ Nicolas — Séance 2 (il y a 3 jours, COMPLETED)
  const booking7Date = setTime(subDays(now, 3), 18, 0);
  await prisma.booking.create({
    data: {
      userId: thomasUser.id,
      coachId: nicolasCoach.id,
      scheduledAt: booking7Date,
      duration: 60,
      price: 12000,
      status: BookingStatus.COMPLETED,
      mode: "REMOTE",
      currency: "EUR",
      session: {
        create: {
          status: SessionStatus.COMPLETED,
          summaryRaw: `## Résumé de votre séance du ${booking7Date.toLocaleDateString("fr-FR")}

### Progrès constatés
Vous avez fait une présentation la semaine dernière et avez utilisé la technique de respiration avant de monter sur scène. Vous avez noté une **amélioration significative** : les tremblements ont disparu dès la 2ème minute au lieu de 5.

### Ce que nous avons travaillé
- Exercice de visualisation : revivre mentalement votre meilleure présentation
- Création d'une routine pré-événement personnalisée

### Votre routine pré-événement
1. 15 min avant : respiration 4-7-8 (3 cycles)
2. 5 min avant : visualisation rapide (succès passé)
3. Juste avant : ancrage (geste de confiance)

### Prochaine étape
Tester cette routine lors de votre prochaine keynote et observer les résultats.`,
          summaryFinal: `## Résumé de votre séance du ${booking7Date.toLocaleDateString("fr-FR")}

### Progrès constatés
Vous avez fait une présentation la semaine dernière et avez utilisé la technique de respiration avant de monter sur scène. Vous avez noté une **amélioration significative** : les tremblements ont disparu dès la 2ème minute au lieu de 5.

### Ce que nous avons travaillé
- Exercice de visualisation : revivre mentalement votre meilleure présentation
- Création d'une routine pré-événement personnalisée

### Votre routine pré-événement
1. 15 min avant : respiration 4-7-8 (3 cycles)
2. 5 min avant : visualisation rapide (succès passé)
3. Juste avant : ancrage (geste de confiance)

### Prochaine étape
Tester cette routine lors de votre prochaine keynote et observer les résultats.`,
        },
      },
    },
  });

  console.log("  ✅ Booking 7: Thomas ↔ Nicolas (Séance 2 - Completed)");

  // BOOKING 8: Thomas ↔ Nicolas — Séance 3 (dans 5 jours, CONFIRMED)
  const booking8Date = setTime(addDays(now, 5), 18, 0);
  await prisma.booking.create({
    data: {
      userId: thomasUser.id,
      coachId: nicolasCoach.id,
      scheduledAt: booking8Date,
      duration: 60,
      price: 12000,
      status: BookingStatus.CONFIRMED,
      mode: "IN_PERSON",
      currency: "EUR",
    },
  });

  console.log("  ✅ Booking 8: Thomas ↔ Nicolas (Séance 3 - À venir)");

  // Conversation Thomas (client) ↔ Nicolas (coach)
  const conversation3 = await prisma.conversation.create({
    data: {
      userId: thomasUser.id,
      coachId: nicolasCoach.id,
      status: "ACTIVE",
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        conversationId: conversation3.id,
        senderId: thomasUser.id,
        senderRole: "USER",
        content: "Bonjour Nicolas, je suis coach moi-même mais j'ai besoin d'un accompagnement pour améliorer ma performance lors de mes prises de parole. Votre parcours d'athlète m'intéresse beaucoup.",
        createdAt: subWeeks(now, 3),
      },
      {
        conversationId: conversation3.id,
        senderId: nicolasUser.id,
        senderRole: "COACH",
        content: "Bonjour Thomas ! C'est toujours intéressant d'accompagner des confrères. La prise de parole en public, c'est vraiment mon domaine de prédilection. Qu'est-ce qui vous pose le plus de difficultés ?",
        createdAt: subWeeks(now, 3),
      },
      {
        conversationId: conversation3.id,
        senderId: thomasUser.id,
        senderRole: "USER",
        content: "J'ai un stress important avant les keynotes, même après 10 ans de métier. Les 5 premières minutes sont toujours difficiles. J'aimerais trouver des techniques pour mieux gérer ça.",
        createdAt: subWeeks(now, 3),
      },
      {
        conversationId: conversation3.id,
        senderId: nicolasUser.id,
        senderRole: "COACH",
        content: "C'est très courant, même chez les professionnels expérimentés ! Le stress n'est pas l'ennemi, c'est l'art de le canaliser qui fait la différence. Je vous propose qu'on se voit pour une première séance. Vous verrez, on va travailler des techniques concrètes.",
        createdAt: subWeeks(now, 3),
      },
      {
        conversationId: conversation3.id,
        senderId: thomasUser.id,
        senderRole: "USER",
        content: "Merci Nicolas ! J'ai une keynote importante dans 3 semaines, j'aimerais être prêt. Je réserve une séance rapidement.",
        createdAt: subWeeks(now, 3),
      },
    ],
  });

  console.log("  ✅ Conversation Thomas ↔ Nicolas");

  // =============================================
  // FIN
  // =============================================
  console.log("\n✨ Seed completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🎯 COMPTES DE TEST:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("| Email                | Rôle          | Profil          |");
  console.log("|----------------------|---------------|-----------------|");
  console.log("| jeff@eddy.tv         | Coach+Client  | Thomas Martin   |");
  console.log("| candice@aocprod.com  | Coach         | Sophie Dubois   |");
  console.log("| fabrice@aocprod.com  | Client        | Marie Dupont    |");
  console.log("| kdenard@gmail.com    | Client        | Laura Petit     |");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n💡 jeff@eddy.tv peut tester les DEUX espaces :");
  console.log("   - /coach : voir ses clients (Marie Dupont)");
  console.log("   - /user  : voir ses séances avec Nicolas Roux (préparateur mental)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
