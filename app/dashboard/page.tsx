"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CalendarDays,
  Link2,
  Play,
  ArrowRight,
  Loader2,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardMetricCard } from "@/components/cards/dashboard-metric-card";
import {
  getDashboardSummary,
  getRecentContentIdeas,
  getUpcomingScheduledPosts,
  startWeeklyFlow,
  ensureTrendPool,
} from "@/lib/api";
import type { DashboardSummary, ContentIdea, ScheduledPost } from "@/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentIdeas, setRecentIdeas] = useState<ContentIdea[]>([]);
  const [upcomingPosts, setUpcomingPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingFlow, setIsStartingFlow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, ideasData, postsData] = await Promise.all([
          getDashboardSummary(),
          getRecentContentIdeas(),
          getUpcomingScheduledPosts(),
        ]);
        setSummary(summaryData);
        setRecentIdeas(ideasData);
        setUpcomingPosts(postsData);
      } catch (error) {
        console.error("Dashboard veri yüklenirken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartFlow = async () => {
    setIsStartingFlow(true);
    try {
      // 1. Önce trend pool'un bu hafta için var olduğundan emin ol
      //    (yoksa Weekly Trend Pool Builder webhook'u tetikler, ~60-90 sn)
      const tp = await ensureTrendPool();
      if (!tp.skipped) {
        toast.info("Trend havuzu oluşturuluyor... (~60-90 sn)");
      }

      // 2. Haftalık akışı başlat (artık trend pool garantili)
      const result = await startWeeklyFlow();
      const msg = result.ideasCount
        ? `${result.ideasCount} içerik fikri oluşturuldu! İçerik Fikirleri sayfasını kontrol edin.`
        : "Haftalık akış başlatıldı! İçerik fikirleri hazırlanıyor...";
      toast.success(msg);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Akış başlatılamadı";
      toast.error(message);
    } finally {
      setIsStartingFlow(false);
    }
  };

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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            İçerik üretim sürecinizi takip edin
          </p>
        </div>
        <Button onClick={handleStartFlow} disabled={isStartingFlow}>
          {isStartingFlow ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Haftalık Akışı Başlat
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          icon={FileText}
          title="Toplam Üretilen İçerik"
          value={summary?.totalContent || 0}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardMetricCard
          icon={Clock}
          title="Onay Bekleyen Fikirler"
          value={summary?.pendingApproval || 0}
        />
        <DashboardMetricCard
          icon={CalendarDays}
          title="Bu Hafta Planlanan"
          value={summary?.thisWeekPlanned || 0}
        />
        <DashboardMetricCard
          icon={Link2}
          title="Bağlı Platformlar"
          value={summary?.connectedPlatforms || 0}
        />
      </div>

      {/* Weekly Flow Status */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Haftalık Akış Durumu
              </h3>
              <p className="text-sm text-muted-foreground">
                {summary?.weeklyFlowStatus === "completed"
                  ? "Haftalık içerik fikirleri hazır!"
                  : "Yeni haftalık akış başlatın"}
              </p>
            </div>
          </div>
          {summary?.weeklyFlowStatus === "completed" && (
            <Badge className="bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Tamamlandı
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Content Ideas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Son İçerik Fikirleri</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/content-ideas">
                Tümünü Gör
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentIdeas.length > 0 ? (
              <div className="space-y-4">
                {recentIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="flex items-start justify-between rounded-lg border border-border/50 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">
                          {idea.title}
                        </h4>
                        {getStatusBadge(idea.status)}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {idea.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{idea.platform}</span>
                        <span>•</span>
                        <span>{idea.contentFormat}</span>
                        <span>•</span>
                        <span>{idea.suggestedDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Henüz içerik fikri yok. Haftalık akışı başlatın!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Scheduled Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Yaklaşan Paylaşımlar</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/calendar">
                Takvime Git
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingPosts.length > 0 ? (
              <div className="space-y-4">
                {upcomingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                  >
                    <div>
                      <h4 className="font-medium text-foreground">
                        {post.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{post.platform}</span>
                        <span>•</span>
                        <span>
                          {post.scheduledDate} {post.scheduledTime}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      Programlandı
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Henüz programlanmış paylaşım yok.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
