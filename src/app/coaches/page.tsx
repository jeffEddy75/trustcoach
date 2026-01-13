import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CoachCard } from "@/components/features/coaches/CoachCard";
import { CoachFilters } from "@/components/features/coaches/CoachFilters";
import { Pagination } from "@/components/features/common/Pagination";
import { EmptyState } from "@/components/features/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Trouver un coach | TrustCoach",
  description:
    "Découvrez nos coachs certifiés et trouvez celui qui correspond à vos besoins",
};

const COACHES_PER_PAGE = 9;

interface CoachesPageProps {
  searchParams: Promise<{
    q?: string;
    specialty?: string;
    city?: string;
    mode?: string;
    b2b?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

async function getCoaches(searchParams: Awaited<CoachesPageProps["searchParams"]>) {
  const {
    q,
    specialty,
    city,
    mode,
    b2b,
    minPrice,
    maxPrice,
    page = "1",
  } = searchParams;

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const skip = (currentPage - 1) * COACHES_PER_PAGE;

  // Build where clause
  const where: Prisma.CoachWhereInput = {
    verified: true,
  };

  // Search query
  if (q) {
    const searchTerm = q.toLowerCase();

    // Trouver les spécialités qui contiennent le terme de recherche
    const matchingSpecialties = await prisma.coach.findMany({
      where: { verified: true },
      select: { specialties: true },
    }).then(coaches => {
      const allSpecialties = coaches.flatMap(c => c.specialties);
      return [...new Set(allSpecialties)].filter(s =>
        s.toLowerCase().includes(searchTerm)
      );
    });

    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { headline: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
      // Chercher les coachs qui ont une des spécialités matchées
      ...(matchingSpecialties.length > 0
        ? [{ specialties: { hasSome: matchingSpecialties } }]
        : []),
    ];
  }

  // Specialty filter
  if (specialty) {
    where.specialties = { has: specialty };
  }

  // City filter
  if (city) {
    where.city = { equals: city, mode: "insensitive" };
  }

  // Mode filter
  if (mode === "remote") {
    where.offersRemote = true;
  } else if (mode === "inperson") {
    where.offersInPerson = true;
  }

  // B2B filter
  if (b2b === "true") {
    where.acceptsCorporate = true;
  }

  // Price range
  if (minPrice) {
    where.hourlyRate = {
      ...((where.hourlyRate as Prisma.IntNullableFilter) || {}),
      gte: parseInt(minPrice, 10) * 100,
    };
  }
  if (maxPrice) {
    where.hourlyRate = {
      ...((where.hourlyRate as Prisma.IntNullableFilter) || {}),
      lte: parseInt(maxPrice, 10) * 100,
    };
  }

  // Execute queries in parallel
  const [coaches, totalCount, allCoaches] = await Promise.all([
    prisma.coach.findMany({
      where,
      include: { user: true },
      orderBy: [
        { badgeLevel: "desc" },
        { averageRating: "desc" },
        { totalSessions: "desc" },
      ],
      skip,
      take: COACHES_PER_PAGE,
    }),
    prisma.coach.count({ where }),
    prisma.coach.findMany({
      where: { verified: true },
      select: { specialties: true, city: true },
    }),
  ]);

  // Extract all unique specialties and cities
  const specialtiesSet = new Set<string>();
  const citiesSet = new Set<string>();
  allCoaches.forEach((coach) => {
    coach.specialties.forEach((s) => specialtiesSet.add(s));
    if (coach.city) citiesSet.add(coach.city);
  });
  const allSpecialties = Array.from(specialtiesSet).sort();
  const allCities = Array.from(citiesSet).sort();

  const totalPages = Math.ceil(totalCount / COACHES_PER_PAGE);

  return {
    coaches,
    totalCount,
    filteredCount: totalCount,
    totalCoachesCount: allCoaches.length,
    allSpecialties,
    allCities,
    currentPage,
    totalPages,
  };
}

function CoachListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default async function CoachesPage({ searchParams }: CoachesPageProps) {
  const params = await searchParams;
  const {
    coaches,
    filteredCount,
    totalCoachesCount,
    allSpecialties,
    allCities,
    currentPage,
    totalPages,
  } = await getCoaches(params);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trouvez le coach qui vous correspond
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {totalCoachesCount} coachs certifiés pour vous accompagner dans
              votre développement personnel et professionnel.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar filters (desktop) */}
              <aside className="lg:w-72 shrink-0">
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                  <CoachFilters
                    specialties={allSpecialties}
                    cities={allCities}
                    totalCount={totalCoachesCount}
                    filteredCount={filteredCount}
                  />
                </Suspense>
              </aside>

              {/* Coach list */}
              <div className="flex-1">
                {coaches.length === 0 ? (
                  <EmptyState
                    title="Aucun coach trouvé"
                    description="Essayez de modifier vos critères de recherche ou effacez les filtres."
                    action={{
                      label: "Voir tous les coachs",
                      href: "/coaches",
                    }}
                  />
                ) : (
                  <>
                    {/* Results count */}
                    <div className="mb-6">
                      <p className="text-muted-foreground">
                        {filteredCount} coach{filteredCount > 1 ? "s" : ""}{" "}
                        trouvé{filteredCount > 1 ? "s" : ""}
                        {currentPage > 1 && ` — Page ${currentPage}`}
                      </p>
                    </div>

                    {/* Grid */}
                    <Suspense fallback={<CoachListSkeleton />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {coaches.map((coach) => (
                          <CoachCard key={coach.id} coach={coach} />
                        ))}
                      </div>
                    </Suspense>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-12">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          basePath="/coaches"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
