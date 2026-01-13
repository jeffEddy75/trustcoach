import {
  PrismaClient,
  Role,
  BadgeLevel,
  InterventionMode,
  TargetAudience,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // =============================================
  // ADMIN (Jeff)
  // =============================================
  const admin = await prisma.user.upsert({
    where: { email: "jeff@eddy.tv" },
    update: {},
    create: {
      email: "jeff@eddy.tv",
      name: "Jeff",
      password: await hash("admin123", 12), // Temporaire, tu utiliseras OAuth
      role: Role.ADMIN,
    },
  });
  console.log("Created admin:", admin.email);

  // =============================================
  // COACH 1 - B2C Bien-être
  // =============================================
  const coach1User = await prisma.user.upsert({
    where: { email: "marie.dupont@coach.fr" },
    update: {},
    create: {
      email: "marie.dupont@coach.fr",
      name: "Marie Dupont",
      password: await hash("coach123", 12),
      role: Role.COACH,
      coach: {
        create: {
          bio: "Coach certifiée en développement personnel avec 10 ans d'expérience. Spécialisée dans la gestion du stress et l'équilibre de vie. Mon approche bienveillante vous accompagne vers une meilleure version de vous-même.",
          headline: "Coach en gestion du stress et bien-être",
          specialties: [
            "Gestion du stress",
            "Confiance en soi",
            "Équilibre vie pro/perso",
          ],
          languages: ["fr", "en"],
          methodologies: ["PNL", "Pleine conscience"],
          interventionModes: [InterventionMode.INDIVIDUAL],
          targetAudience: [
            TargetAudience.INDIVIDUAL,
            TargetAudience.EMPLOYEE,
          ],
          acceptsCorporate: false,
          hourlyRate: 8000, // 80€
          verified: true,
          badgeLevel: BadgeLevel.VERIFIED,
          city: "Paris",
          country: "FR",
          offersInPerson: true,
          offersRemote: true,
          availabilities: {
            create: [
              { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }, // Lundi matin
              { dayOfWeek: 1, startTime: "14:00", endTime: "18:00" }, // Lundi après-midi
              { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" }, // Mercredi
              { dayOfWeek: 5, startTime: "09:00", endTime: "12:00" }, // Vendredi matin
            ],
          },
        },
      },
    },
  });
  console.log("Created coach B2C:", coach1User.email);

  // =============================================
  // COACH 2 - B2B Executive Coaching
  // =============================================
  const coach2User = await prisma.user.upsert({
    where: { email: "thomas.martin@coach.fr" },
    update: {},
    create: {
      email: "thomas.martin@coach.fr",
      name: "Thomas Martin",
      password: await hash("coach123", 12),
      role: Role.COACH,
      coach: {
        create: {
          bio: "Expert en coaching de dirigeants et transformation des organisations. 15 ans d'expérience en entreprise (ex-DG chez Capgemini) avant de devenir coach. Certifié ICF PCC et praticien MBTI.",
          headline: "Executive Coach & Leadership",
          specialties: [
            "Leadership",
            "Management",
            "Prise de parole",
            "Gestion du changement",
          ],
          languages: ["fr", "en", "de"],
          methodologies: [
            "MBTI",
            "Process Com",
            "360° Feedback",
            "Ennéagramme",
          ],
          interventionModes: [
            InterventionMode.INDIVIDUAL,
            InterventionMode.TEAM,
            InterventionMode.ORGANIZATION,
          ],
          targetAudience: [TargetAudience.EXECUTIVE, TargetAudience.MANAGER],
          acceptsCorporate: true,
          hourlyRate: 15000, // 150€
          dailyRate: 200000, // 2000€
          verified: true,
          badgeLevel: BadgeLevel.PREMIUM,
          city: "Lyon",
          country: "FR",
          offersInPerson: true,
          offersRemote: true,
          certifications: {
            create: [
              {
                name: "Certification ICF PCC",
                issuer: "International Coaching Federation",
                year: 2019,
                verified: true,
              },
              {
                name: "Certification MBTI Niveau II",
                issuer: "The Myers-Briggs Company",
                year: 2018,
                verified: true,
              },
            ],
          },
          references: {
            create: [
              {
                companyName: "BNP Paribas",
                sector: "Banque",
                missionType: "Coaching dirigeants",
                year: 2023,
                testimonial:
                  "Thomas a accompagné notre COMEX dans une période de transformation majeure. Son approche structurée et bienveillante a permis à nos directeurs de développer leur leadership.",
                contactName: "Marie D., DRH",
                canDisplay: true,
              },
              {
                companyName: "L'Oréal",
                sector: "Cosmétiques",
                missionType: "Team coaching",
                year: 2022,
                canDisplay: true,
              },
            ],
          },
          availabilities: {
            create: [
              { dayOfWeek: 1, startTime: "08:00", endTime: "19:00" }, // Lundi
              { dayOfWeek: 2, startTime: "08:00", endTime: "19:00" }, // Mardi
              { dayOfWeek: 3, startTime: "08:00", endTime: "19:00" }, // Mercredi
              { dayOfWeek: 4, startTime: "08:00", endTime: "19:00" }, // Jeudi
            ],
          },
        },
      },
    },
  });
  console.log("Created coach B2B Executive:", coach2User.email);

  // =============================================
  // COACH 3 - B2B Team & Manager Coaching
  // =============================================
  const coach3User = await prisma.user.upsert({
    where: { email: "sophie.bernard@coach.fr" },
    update: {},
    create: {
      email: "sophie.bernard@coach.fr",
      name: "Sophie Bernard",
      password: await hash("coach123", 12),
      role: Role.COACH,
      coach: {
        create: {
          bio: "Spécialiste du coaching d'équipe et de la cohésion. 12 ans d'expérience RH en startup et grands groupes. J'aide les managers à libérer le potentiel de leurs équipes.",
          headline: "Coach d'équipe & Cohésion",
          specialties: [
            "Cohésion d'équipe",
            "Management de proximité",
            "Communication non-violente",
            "Gestion des conflits",
          ],
          languages: ["fr", "en"],
          methodologies: ["Process Com", "Analyse Transactionnelle", "CNV"],
          interventionModes: [
            InterventionMode.INDIVIDUAL,
            InterventionMode.TEAM,
            InterventionMode.GROUP,
          ],
          targetAudience: [
            TargetAudience.MANAGER,
            TargetAudience.EMPLOYEE,
            TargetAudience.ENTREPRENEUR,
          ],
          acceptsCorporate: true,
          hourlyRate: 12000, // 120€
          dailyRate: 150000, // 1500€
          verified: true,
          badgeLevel: BadgeLevel.VERIFIED,
          city: "Bordeaux",
          country: "FR",
          offersInPerson: true,
          offersRemote: true,
          certifications: {
            create: [
              {
                name: "Certification Coach Agile",
                issuer: "ICAgile",
                year: 2020,
                verified: true,
              },
            ],
          },
          references: {
            create: [
              {
                companyName: "Doctolib",
                sector: "Tech / Santé",
                missionType: "Team building & cohésion",
                year: 2024,
                canDisplay: true,
              },
            ],
          },
          availabilities: {
            create: [
              { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" }, // Mardi
              { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" }, // Jeudi
              { dayOfWeek: 5, startTime: "09:00", endTime: "13:00" }, // Vendredi matin
            ],
          },
        },
      },
    },
  });
  console.log("Created coach B2B Team:", coach3User.email);

  // =============================================
  // UTILISATEUR TEST
  // =============================================
  const user = await prisma.user.upsert({
    where: { email: "user@test.fr" },
    update: {},
    create: {
      email: "user@test.fr",
      name: "Jean Test",
      password: await hash("user123", 12),
      role: Role.USER,
    },
  });
  console.log("Created test user:", user.email);

  // =============================================
  // ORGANISATION TEST (B2B)
  // =============================================
  const org = await prisma.organization.upsert({
    where: { siret: "12345678901234" },
    update: {},
    create: {
      name: "Acme Corp",
      legalName: "Acme Corporation SAS",
      siret: "12345678901234",
      vatNumber: "FR12345678901",
      billingAddress: "123 Avenue des Champs-Élysées",
      billingCity: "Paris",
      billingPostcode: "75008",
      billingCountry: "FR",
      contactName: "Sophie Martin",
      contactEmail: "sophie.martin@acme.fr",
      maxUsersAllowed: 50,
      budgetAllocated: 5000000, // 50 000€
    },
  });
  console.log("Created organization:", org.name);

  // Ajouter le user test comme membre de l'organisation
  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
  });

  if (!existingMember) {
    await prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: "EMPLOYEE",
        sessionsAllowed: 10,
      },
    });
    console.log("Added user to organization");
  }

  console.log("\nSeed completed successfully!");
  console.log("----------------------------");
  console.log("Admin: jeff@eddy.tv");
  console.log("Coachs de test: marie.dupont@coach.fr, thomas.martin@coach.fr, sophie.bernard@coach.fr");
  console.log("User test: user@test.fr");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
