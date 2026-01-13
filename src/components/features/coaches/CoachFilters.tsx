"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CoachFiltersProps {
  specialties: string[];
  totalCount: number;
  filteredCount: number;
}

export function CoachFilters({
  specialties,
  totalCount,
  filteredCount,
}: CoachFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Current filter values from URL
  const searchFromUrl = searchParams.get("q") || "";
  const specialty = searchParams.get("specialty") || "";
  const mode = searchParams.get("mode") || "";
  const b2b = searchParams.get("b2b") === "true";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // Local state for search input (to avoid re-render on each keystroke)
  const [searchInput, setSearchInput] = useState(searchFromUrl);

  // Sync local state when URL changes (e.g., clear filters)
  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      params.delete("page");

      // Use startTransition to not block the UI during navigation
      startTransition(() => {
        router.replace(`/coaches?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  // Debounced search - only update URL after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchFromUrl) {
        updateParams({ q: searchInput || null });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchInput, searchFromUrl, updateParams]);

  const clearFilters = () => {
    setSearchInput("");
    router.push("/coaches");
  };

  const hasFilters = searchInput || specialty || mode || b2b || minPrice || maxPrice;

  // Shared search input component
  const searchIcon = isPending ? (
    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
  ) : (
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  );

  return (
    <>
      {/* Desktop filters */}
      <Card className="hidden lg:block sticky top-4">
        <CardContent className="p-6">
          <h3 className="font-heading font-semibold mb-4">Filtres</h3>
          <div className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                {searchIcon}
                <Input
                  placeholder="Nom, spécialité..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Specialty */}
            <div className="space-y-2">
              <Label>Spécialité</Label>
              <Select
                value={specialty}
                onValueChange={(value) =>
                  updateParams({ specialty: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les spécialités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les spécialités</SelectItem>
                  {specialties.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mode */}
            <div className="space-y-2">
              <Label>Mode de coaching</Label>
              <Select
                value={mode}
                onValueChange={(value) =>
                  updateParams({ mode: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modes</SelectItem>
                  <SelectItem value="remote">Visioconférence</SelectItem>
                  <SelectItem value="inperson">Présentiel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price range */}
            <div className="space-y-2">
              <Label>Tarif horaire</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParams({ minPrice: e.target.value })}
                  className="w-24"
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParams({ maxPrice: e.target.value })}
                  className="w-24"
                />
                <span className="text-muted-foreground text-sm">€/h</span>
              </div>
            </div>

            {/* B2B toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Coaching entreprise</Label>
                <p className="text-sm text-muted-foreground">
                  Coachs acceptant les missions B2B
                </p>
              </div>
              <Switch
                checked={b2b}
                onCheckedChange={(checked) =>
                  updateParams({ b2b: checked ? "true" : null })
                }
              />
            </div>

            {/* Clear filters */}
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="mr-2 h-4 w-4" />
                Effacer les filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile filters */}
      <div className="lg:hidden flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          {searchIcon}
          <Input
            placeholder="Rechercher un coach..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Specialty */}
              <div className="space-y-2">
                <Label>Spécialité</Label>
                <Select
                  value={specialty}
                  onValueChange={(value) =>
                    updateParams({ specialty: value === "all" ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les spécialités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les spécialités</SelectItem>
                    {specialties.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode */}
              <div className="space-y-2">
                <Label>Mode de coaching</Label>
                <Select
                  value={mode}
                  onValueChange={(value) =>
                    updateParams({ mode: value === "all" ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modes</SelectItem>
                    <SelectItem value="remote">Visioconférence</SelectItem>
                    <SelectItem value="inperson">Présentiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price range */}
              <div className="space-y-2">
                <Label>Tarif horaire</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParams({ minPrice: e.target.value })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParams({ maxPrice: e.target.value })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground text-sm">€/h</span>
                </div>
              </div>

              {/* B2B toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Coaching entreprise</Label>
                  <p className="text-sm text-muted-foreground">
                    Coachs acceptant les missions B2B
                  </p>
                </div>
                <Switch
                  checked={b2b}
                  onCheckedChange={(checked) =>
                    updateParams({ b2b: checked ? "true" : null })
                  }
                />
              </div>

              {/* Clear filters */}
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Effacer les filtres
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters badges */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {specialty && (
            <Badge variant="secondary" className="gap-1">
              {specialty}
              <button onClick={() => updateParams({ specialty: null })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {mode && (
            <Badge variant="secondary" className="gap-1">
              {mode === "remote" ? "Visio" : "Présentiel"}
              <button onClick={() => updateParams({ mode: null })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {b2b && (
            <Badge variant="secondary" className="gap-1">
              B2B
              <button onClick={() => updateParams({ b2b: null })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(minPrice || maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              {minPrice || "0"}€ - {maxPrice || "∞"}€
              <button
                onClick={() => updateParams({ minPrice: null, maxPrice: null })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <span className="text-sm text-muted-foreground self-center ml-2">
            {filteredCount} / {totalCount} coachs
          </span>
        </div>
      )}
    </>
  );
}
