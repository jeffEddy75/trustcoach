"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { HealthStatus } from "@/actions/coach-clients.actions";

interface ClientFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: HealthStatus | "all";
  onStatusChange: (value: HealthStatus | "all") => void;
}

export function ClientFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: ClientFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Recherche */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filtre par statut */}
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusChange(value as HealthStatus | "all")}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="active">Actifs</SelectItem>
          <SelectItem value="review">À revoir</SelectItem>
          <SelectItem value="new">Nouveaux</SelectItem>
          <SelectItem value="inactive">Inactifs</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
