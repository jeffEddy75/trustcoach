import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, formatPrice } from "@/lib/utils";
import { Award, MapPin, Star, Video, Users } from "lucide-react";
import type { Coach, User } from "@prisma/client";

interface CoachCardProps {
  coach: Coach & { user: User };
}

export function CoachCard({ coach }: CoachCardProps) {
  return (
    <Card className="group hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg card-premium">
      <CardHeader className="flex flex-row items-start gap-4 pb-3">
        <Avatar className="h-16 w-16">
          <AvatarImage src={coach.avatarUrl || coach.user.image || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {getInitials(coach.user.name || coach.user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading text-lg font-semibold truncate">
              {coach.user.name}
            </h3>
            {coach.verified && (
              <Badge className="bg-green-100 text-green-800 shrink-0">
                <Award className="h-3 w-3 mr-1" />
                {coach.badgeLevel === "PREMIUM"
                  ? "Premium"
                  : "Vérifié"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm truncate">
            {coach.headline}
          </p>
          {coach.city && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {coach.city}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Bio preview */}
        {coach.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {coach.bio}
          </p>
        )}

        {/* Spécialités */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {coach.specialties.slice(0, 3).map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
          {coach.specialties.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{coach.specialties.length - 3}
            </Badge>
          )}
        </div>

        {/* Infos rapides */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {coach.averageRating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-accent fill-accent" />
              <span className="font-medium text-foreground">
                {coach.averageRating.toFixed(1)}
              </span>
            </div>
          )}
          {coach.totalSessions > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{coach.totalSessions} séances</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            <span>
              {coach.offersRemote && coach.offersInPerson
                ? "Visio & Présentiel"
                : coach.offersRemote
                  ? "Visio"
                  : "Présentiel"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t">
        <div>
          <span className="text-lg font-bold">
            {coach.hourlyRate ? formatPrice(coach.hourlyRate) : "—"}
          </span>
          <span className="text-muted-foreground text-sm">/h</span>
        </div>
        <Button asChild>
          <Link href={`/coaches/${coach.id}`}>Voir le profil</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
