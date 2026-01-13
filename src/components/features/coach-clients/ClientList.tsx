"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientCard } from "./ClientCard";
import { ClientFilters } from "./ClientFilters";
import { Users } from "lucide-react";
import type { CoachClient, HealthStatus } from "@/actions/coach-clients.actions";

interface ClientListProps {
  clients: CoachClient[];
  totalClients: number;
}

export function ClientList({ clients, totalClients }: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<HealthStatus | "all">("all");

  // Filtrer les clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = client.name?.toLowerCase().includes(query);
        const matchesEmail = client.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }

      // Filtre par statut
      if (statusFilter !== "all" && client.healthStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [clients, searchQuery, statusFilter]);

  // Compter par statut
  const statusCounts = useMemo(() => {
    const counts: Record<HealthStatus, number> = {
      active: 0,
      review: 0,
      new: 0,
      inactive: 0,
    };
    clients.forEach((client) => {
      counts[client.healthStatus]++;
    });
    return counts;
  }, [clients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Mes clients
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalClients} client{totalClients > 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter("active")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.active}
            </div>
            <div className="text-xs text-muted-foreground">Actifs</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter("review")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {statusCounts.review}
            </div>
            <div className="text-xs text-muted-foreground">À revoir</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter("new")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.new}
            </div>
            <div className="text-xs text-muted-foreground">Nouveaux</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStatusFilter("inactive")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.inactive}
            </div>
            <div className="text-xs text-muted-foreground">Inactifs</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <ClientFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Liste des clients */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filteredClients.length === clients.length
              ? `${clients.length} client${clients.length > 1 ? "s" : ""}`
              : `${filteredClients.length} sur ${clients.length} client${clients.length > 1 ? "s" : ""}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {clients.length === 0 ? (
                <>
                  <p>Aucun client pour le moment</p>
                  <p className="text-sm mt-1">
                    Vos clients apparaîtront ici après leur première réservation
                  </p>
                </>
              ) : (
                <>
                  <p>Aucun client ne correspond à vos filtres</p>
                  <p className="text-sm mt-1">
                    Essayez de modifier vos critères de recherche
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
