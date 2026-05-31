"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lightbulb, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentIdeaCard } from "@/components/cards/content-idea-card";
import { FeedbackModal } from "@/components/modals/feedback-modal";
import {
  getContentIdeas,
  approveContentIdea,
  rejectContentIdea,
  deleteContentIdea,
  regenerateContentIdeaWithFeedback,
} from "@/lib/api";
import type { ContentIdea } from "@/types";
import { toast } from "sonner";

export default function ContentIdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    ideaId: string | null;
    ideaTitle: string;
  }>({
    isOpen: false,
    ideaId: null,
    ideaTitle: "",
  });

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const data = await getContentIdeas();
        setIdeas(data);
      } catch (error) {
        console.error("İçerik fikirleri yüklenirken hata:", error);
        toast.error("İçerik fikirleri yüklenemedi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  const handleApprove = async (ideaId: string) => {
    setActionLoading(ideaId);
    try {
      const result = await approveContentIdea(ideaId);
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId ? { ...idea, status: "approved" } : idea
        )
      );
      toast.success("İçerik fikri onaylandı!");
    } catch {
      toast.error("Onaylama başarısız");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (ideaId: string) => {
    setActionLoading(ideaId);
    try {
      await rejectContentIdea(ideaId);
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId ? { ...idea, status: "rejected" } : idea
        )
      );
      toast.success("İçerik fikri reddedildi");
    } catch {
      toast.error("Reddetme başarısız");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (ideaId: string) => {
    setActionLoading(ideaId);
    try {
      await deleteContentIdea(ideaId);
      setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
      toast.success("İçerik fikri silindi");
    } catch {
      toast.error("Silme başarısız");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeedback = (ideaId: string) => {
    const idea = ideas.find((i) => i.id === ideaId);
    setFeedbackModal({
      isOpen: true,
      ideaId,
      ideaTitle: idea?.title || "",
    });
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    if (!feedbackModal.ideaId) return;

    try {
      const result = await regenerateContentIdeaWithFeedback(
        feedbackModal.ideaId,
        feedback
      );
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === feedbackModal.ideaId
            ? { ...result.idea, id: idea.id }
            : idea
        )
      );
      toast.success("Yeni içerik fikri oluşturuldu!");
    } catch {
      toast.error("Yeni fikir oluşturulamadı");
      throw new Error("Failed to regenerate");
    }
  };

  const handleCreate = (ideaId: string) => {
    router.push(`/dashboard/content-create/${ideaId}`);
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (statusFilter !== "all" && idea.status !== statusFilter) return false;
    if (platformFilter !== "all" && idea.platform !== platformFilter)
      return false;
    return true;
  });

  // Boş/null platform değerlerini çıkar — Radix Select boş value kabul etmez
  const uniquePlatforms = [
    ...new Set(
      ideas
        .map((idea) => idea.platform)
        .filter((p): p is string => typeof p === "string" && p.trim() !== "")
    ),
  ];

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
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Lightbulb className="h-6 w-6 text-primary" />
            İçerik Fikirleri
          </h1>
          <p className="text-muted-foreground">
            Trend bazlı haftalık içerik önerilerinizi inceleyin
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrele:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="pending">Bekliyor</SelectItem>
            <SelectItem value="approved">Onaylandı</SelectItem>
            <SelectItem value="rejected">Reddedildi</SelectItem>
            <SelectItem value="regenerated">Yeniden Oluşturuldu</SelectItem>
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Platformlar</SelectItem>
            {uniquePlatforms.map((platform) => (
              <SelectItem key={platform} value={platform}>
                {platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content Ideas Grid */}
      {filteredIdeas.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <ContentIdeaCard
              key={idea.id}
              idea={idea}
              onApprove={handleApprove}
              onReject={handleReject}
              onFeedback={handleFeedback}
              onCreate={handleCreate}
              onDelete={handleDelete}
              isLoading={actionLoading === idea.id}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Lightbulb className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <h3 className="mb-2 font-semibold text-foreground">
            İçerik fikri bulunamadı
          </h3>
          <p className="text-sm text-muted-foreground">
            Seçili filtrelere uygun içerik fikri bulunmuyor.
          </p>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() =>
          setFeedbackModal({ isOpen: false, ideaId: null, ideaTitle: "" })
        }
        onSubmit={handleFeedbackSubmit}
        ideaTitle={feedbackModal.ideaTitle}
      />
    </div>
  );
}
