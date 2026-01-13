import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCoachDashboardData } from "@/actions/coach-dashboard.actions";
import { CoachDashboard } from "@/components/features/coach-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace coach | TrustCoach",
  description: "Gérez votre activité de coaching",
};

export default async function CoachDashboardPage() {
  const user = await getCurrentDbUser();

  if (!user) {
    redirect("/sign-in");
  }

  const result = await getCoachDashboardData();

  if (result.error || !result.data) {
    redirect("/user");
  }

  return (
    <CoachDashboard
      coach={result.data.coach}
      upcomingBookings={result.data.upcomingBookings}
      monthRevenue={result.data.monthRevenue}
      monthSessions={result.data.monthSessions}
    />
  );
}
