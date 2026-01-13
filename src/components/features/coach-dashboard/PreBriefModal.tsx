"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPreBriefData } from "@/actions/coach-dashboard.actions";
import { Star, MessageSquare, FileText, Calendar } from "lucide-react";

interface PreBriefModalProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PreBriefData {
  client: {
    id: string;
    name: string | null;
    email: string;
  };
  lastSession: {
    id: string;
    date: Date;
    summary: string | null;
    markedMoments: {
      id: string;
      timestamp: number;
      note: string | null;
    }[];
  } | null;
  totalSessions: number;
  recentMessages: {
    id: string;
    content: string;
    createdAt: Date;
    senderName: string | null;
  }[];
}

export function PreBriefModal({
  bookingId,
  open,
  onOpenChange,
}: PreBriefModalProps) {
  const [data, setData] = useState<PreBriefData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && bookingId) {
      setLoading(true);
      setError(null);
      getPreBriefData(bookingId)
        .then((result) => {
          if (result.error) {
            setError(result.error);
          } else {
            setData(result.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, bookingId]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pré-brief : {data?.client.name || "Client"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Stats client */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Badge variant="secondary" className="text-sm">
                  {data.totalSessions} séance{data.totalSessions > 1 ? "s" : ""}{" "}
                  réalisée{data.totalSessions > 1 ? "s" : ""}
                </Badge>
              </div>

              {/* Dernière séance */}
              {data.lastSession ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Dernière séance
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(data.lastSession.date)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Résumé */}
                    {data.lastSession.summary && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Résumé IA</h4>
                        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">
                          {data.lastSession.summary.length > 500
                            ? data.lastSession.summary.slice(0, 500) + "..."
                            : data.lastSession.summary}
                        </div>
                      </div>
                    )}

                    {/* Moments marqués */}
                    {data.lastSession.markedMoments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          Moments marqués
                        </h4>
                        <div className="space-y-2">
                          {data.lastSession.markedMoments.map((moment) => (
                            <div
                              key={moment.id}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Badge
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                {formatTimestamp(moment.timestamp)}
                              </Badge>
                              <span className="text-muted-foreground">
                                {moment.note || "Moment important"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    Aucune séance précédente avec ce client
                  </CardContent>
                </Card>
              )}

              {/* Messages récents */}
              {data.recentMessages.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Messages récents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.recentMessages.map((message) => (
                        <div
                          key={message.id}
                          className="text-sm border-l-2 border-muted pl-3"
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span className="font-medium">
                              {message.senderName}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(message.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
