"use client";

import {
  Check,
  X,
  MessageSquare,
  PenTool,
  Calendar,
  Clock,
  TrendingUp,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ContentIdea } from "@/types";

interface ContentIdeaCardProps {
  idea: ContentIdea;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onFeedback: (id: string) => void;
  onCreate: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  isRegenerating?: boolean;
}

export function ContentIdeaCard({
  idea,
  onApprove,
  onReject,
  onFeedback,
  onCreate,
  onDelete,
  isLoading,
  isRegenerating,
}: ContentIdeaCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            Onaylandı
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Bekliyor</Badge>;
      case "rejected":
        return <Badge variant="destructive">Reddedildi</Badge>;
      case "regenerated":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Yeniden Oluşturuldu
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrendSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      SerpApi: "bg-purple-100 text-purple-700",
      Apify: "bg-orange-100 text-orange-700",
      "Social Trend": "bg-pink-100 text-pink-700",
      "Search Trend": "bg-cyan-100 text-cyan-700",
    };
    return (
      <Badge className={`${colors[source] || "bg-gray-100 text-gray-700"} hover:opacity-90`}>
        <TrendingUp className="mr-1 h-3 w-3" />
        {source}
      </Badge>
    );
  };

  return (
    <Card className="relative border border-border/50 transition-shadow hover:shadow-md">
      {/* Regenerating Overlay */}
      {isRegenerating && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm font-medium text-foreground">
            Yeniden oluşturuluyor...
          </p>
        </div>
      )}
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {getStatusBadge(idea.status)}
              {getTrendSourceBadge(idea.trendSource)}
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {idea.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {idea.description}
        </p>

        {/* Meta Info */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{idea.suggestedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{idea.suggestedTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline">{idea.platform}</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline">{idea.contentFormat}</Badge>
          </div>
        </div>

        {/* Trend Keyword */}
        <div className="mb-4 rounded-lg bg-secondary/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Trend Anahtar Kelime
          </p>
          <p className="mt-1 font-medium text-foreground">{idea.trendKeyword}</p>
        </div>

        {/* Feedback if exists */}
        {idea.feedback && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-700">Geri Bildirim</p>
            <p className="mt-1 text-sm text-amber-800">{idea.feedback}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-border/50 pt-4">
          {idea.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => onApprove(idea.id)}
                disabled={isLoading}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Onayla
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(idea.id)}
                disabled={isLoading}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Reddet
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFeedback(idea.id)}
                disabled={isLoading}
                className="gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                Feedback Ver
              </Button>
            </>
          )}
          {(idea.status === "approved" || idea.status === "regenerated") && (
            <Button
              size="sm"
              onClick={() => onCreate(idea.id)}
              disabled={isLoading}
              className="gap-1"
            >
              <PenTool className="h-4 w-4" />
              İçeriği Oluştur
            </Button>
          )}
          {idea.status === "rejected" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFeedback(idea.id)}
              disabled={isLoading}
              className="gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              Feedback Ver
            </Button>
          )}
          {/* Sil butonu — tüm durumlarda görünür */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(idea.id)}
            disabled={isLoading}
            className="ml-auto gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Sil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
