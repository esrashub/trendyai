"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isSameDay, isAfter, isBefore } from "date-fns";
import { tr } from "date-fns/locale";
import {
  CalendarDays,
  Loader2,
  List as ListIcon,
  LayoutGrid,
  Clock,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  subscribeToScheduledPosts,
  cancelScheduledPost,
  deleteScheduledPost,
} from "@/lib/api";
import type { ScheduledPost } from "@/types";

/* -------------------- yardımcılar -------------------- */

const platformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) return Instagram;
  if (p.includes("linkedin")) return Linkedin;
  if (p.includes("twitter") || p === "x") return Twitter;
  if (p.includes("facebook")) return Facebook;
  return CalendarDays;
};

const statusConfig = {
  scheduled: {
    label: "Programlandı",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  published: {
    label: "Yayınlandı",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  failed: {
    label: "Başarısız",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  cancelled: {
    label: "İptal",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: XCircle,
  },
} as const;

const TURKISH_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const TURKISH_MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

/* -------------------- Bileşen -------------------- */

export default function CalendarPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"month" | "list">("month");
  const [cursor, setCursor] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [postToCancel, setPostToCancel] = useState<ScheduledPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<ScheduledPost | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const unsubRef = useRef<(() => void) | null>(null);

  // Real-time Firestore listener
  useEffect(() => {
    setIsLoading(true);
    unsubRef.current = subscribeToScheduledPosts((data) => {
      setPosts(data);
      setIsLoading(false);
    });
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  /* -------------------- türetilmiş veri -------------------- */

  // Tarih bazında grupla
  const postsByDate = useMemo(() => {
    const map = new Map<string, ScheduledPost[]>();
    for (const p of posts) {
      const key = p.scheduledDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [posts]);

  // Yaklaşan (sadece scheduled + bugünden ileri)
  const upcoming = useMemo(() => {
    const now = new Date();
    return posts
      .filter((p) => p.status === "scheduled")
      .filter((p) => {
        try {
          const dt = parseISO(`${p.scheduledDate}T${p.scheduledTime}:00`);
          return isAfter(dt, now) || isSameDay(dt, now);
        } catch {
          return true;
        }
      });
  }, [posts]);

  const past = useMemo(() => {
    const now = new Date();
    return posts.filter((p) => {
      if (p.status === "cancelled") return true;
      try {
        const dt = parseISO(`${p.scheduledDate}T${p.scheduledTime}:00`);
        return isBefore(dt, now) && !isSameDay(dt, now);
      } catch {
        return false;
      }
    });
  }, [posts]);

  /* -------------------- ay grid'i -------------------- */

  // Pazartesi başlangıçlı 6x7 grid
  const calendarGrid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // Pzt=0, Pzr=6 olarak normalize
    const weekday = (firstOfMonth.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - weekday);

    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return cells;
  }, [cursor]);

  const monthLabel = `${TURKISH_MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

  const goPrevMonth = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNextMonth = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  const goToday = () => {
    setCursor(new Date());
    setSelectedDate(new Date());
  };

  /* -------------------- aksiyon handler'ları -------------------- */

  const handleCancel = async () => {
    if (!postToCancel) return;
    setActionLoading(true);
    try {
      await cancelScheduledPost(postToCancel.id);
      toast.success("Paylaşım iptal edildi");
      setPostToCancel(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İptal başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    setActionLoading(true);
    try {
      await deleteScheduledPost(postToDelete.id);
      toast.success("Programlanmış paylaşım silindi");
      setPostToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silme başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  const viewContent = (post: ScheduledPost) => {
    // generatedContentId formatı: content_{ideaId} → ideaId'yi çıkar
    const ideaId = post.generatedContentId.replace(/^content_/, "");
    router.push(`/dashboard/content-create/${ideaId}`);
  };

  /* -------------------- render -------------------- */

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Takvim yükleniyor...</p>
      </div>
    );
  }

  const selectedDatePosts = selectedDate
    ? postsByDate.get(format(selectedDate, "yyyy-MM-dd")) || []
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            <CalendarDays className="mr-2 inline h-7 w-7 text-primary" />
            Takvim
          </h1>
          <p className="text-muted-foreground">
            Programlanmış paylaşımlarını burada görebilirsin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            Bugün
          </Button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Toplam Programlı</p>
            <p className="mt-1 text-2xl font-bold">
              {posts.filter((p) => p.status === "scheduled").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Yayınlandı</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {posts.filter((p) => p.status === "published").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Başarısız</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {posts.filter((p) => p.status === "failed").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">İptal</p>
            <p className="mt-1 text-2xl font-bold text-gray-500">
              {posts.filter((p) => p.status === "cancelled").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View toggle */}
      <Tabs value={view} onValueChange={(v) => setView(v as "month" | "list")}>
        <TabsList>
          <TabsTrigger value="month">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Ay Görünümü
          </TabsTrigger>
          <TabsTrigger value="list">
            <ListIcon className="mr-2 h-4 w-4" />
            Liste
          </TabsTrigger>
        </TabsList>

        {/* MONTH VIEW */}
        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg capitalize">{monthLabel}</CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={goPrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                {TURKISH_DAYS.map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              {/* Date cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map((cell, i) => {
                  const inMonth = cell.getMonth() === cursor.getMonth();
                  const isToday = isSameDay(cell, new Date());
                  const isSelected =
                    selectedDate !== null && isSameDay(cell, selectedDate);
                  const cellKey = format(cell, "yyyy-MM-dd");
                  const cellPosts = postsByDate.get(cellKey) || [];
                  const hasScheduled = cellPosts.some(
                    (p) => p.status === "scheduled"
                  );
                  const hasPublished = cellPosts.some(
                    (p) => p.status === "published"
                  );
                  const hasFailed = cellPosts.some(
                    (p) => p.status === "failed"
                  );
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(cell)}
                      className={[
                        "relative min-h-[68px] rounded-lg border p-1 text-left text-sm transition-colors",
                        inMonth
                          ? "bg-card hover:bg-secondary/50"
                          : "bg-muted/30 text-muted-foreground/50",
                        isSelected && "ring-2 ring-primary",
                        isToday && "border-primary",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={[
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                            isToday && "bg-primary font-bold text-primary-foreground",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {cell.getDate()}
                        </span>
                        {cellPosts.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 text-[10px]"
                          >
                            {cellPosts.length}
                          </Badge>
                        )}
                      </div>
                      {/* Status dots */}
                      <div className="mt-1 flex gap-0.5">
                        {hasScheduled && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                        {hasPublished && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                        {hasFailed && (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected date detayı */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({selectedDatePosts.length} paylaşım)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDatePosts.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Bu tarihte programlanmış paylaşım yok.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDatePosts
                      .sort((a, b) =>
                        a.scheduledTime.localeCompare(b.scheduledTime)
                      )
                      .map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onView={viewContent}
                          onCancel={setPostToCancel}
                          onDelete={setPostToDelete}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* LIST VIEW */}
        <TabsContent value="list" className="space-y-4">
          {/* Yaklaşan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Yaklaşan Paylaşımlar
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({upcoming.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="mb-2 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Yaklaşan programlanmış paylaşım yok.
                  </p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push("/dashboard/content-ideas")}
                  >
                    İçerik Fikirleri'ne Git
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onView={viewContent}
                      onCancel={setPostToCancel}
                      onDelete={setPostToDelete}
                      showDate
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Geçmiş */}
          {past.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Geçmiş Paylaşımlar
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({past.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {past.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onView={viewContent}
                      onCancel={setPostToCancel}
                      onDelete={setPostToDelete}
                      showDate
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* İptal Dialog */}
      <AlertDialog
        open={postToCancel !== null}
        onOpenChange={(open) => !open && setPostToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paylaşımı iptal et?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu paylaşım iptal edilecek, ancak takvimde kayıt olarak kalacak.
              Tamamen silmek için "Sil" seçeneğini kullan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              İptal Et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sil Dialog */}
      <AlertDialog
        open={postToDelete !== null}
        onOpenChange={(open) => !open && setPostToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paylaşımı sil?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu programlanmış paylaşım kalıcı olarak silinecek. Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* -------------------- alt bileşen: PostCard -------------------- */

function PostCard({
  post,
  onView,
  onCancel,
  onDelete,
  showDate = false,
}: {
  post: ScheduledPost;
  onView: (p: ScheduledPost) => void;
  onCancel: (p: ScheduledPost) => void;
  onDelete: (p: ScheduledPost) => void;
  showDate?: boolean;
}) {
  const PlatformIcon = platformIcon(post.platform);
  const status = statusConfig[post.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-secondary/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <PlatformIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{post.title}</p>
          <Badge variant="outline" className={`shrink-0 ${status.className}`}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {status.label}
          </Badge>
        </div>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {showDate && (
            <>
              <CalendarDays className="h-3 w-3" />
              {format(parseISO(post.scheduledDate), "d MMM yyyy", {
                locale: tr,
              })}
              <Separator orientation="vertical" className="h-3" />
            </>
          )}
          <Clock className="h-3 w-3" />
          {post.scheduledTime}
          <Separator orientation="vertical" className="h-3" />
          <span className="capitalize">{post.platform}</span>
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView(post)}
          title="İçeriği gör"
        >
          <Eye className="h-4 w-4" />
        </Button>
        {post.status === "scheduled" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCancel(post)}
            title="İptal et"
            className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(post)}
          title="Sil"
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
