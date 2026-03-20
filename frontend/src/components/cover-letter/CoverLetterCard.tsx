"use client";

import { Badge } from "@/components/ui/badge";
import type { CoverLetter } from "@/types";

interface CoverLetterCardProps {
  coverLetter: CoverLetter;
  onClick?: () => void;
}

export function CoverLetterCard({ coverLetter, onClick }: CoverLetterCardProps) {
  const preview = coverLetter.content.slice(0, 150) + "...";
  const date = new Date(coverLetter.created_at).toLocaleDateString();

  return (
    <div
      onClick={onClick}
      className="rounded-lg border bg-card p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <Badge variant="secondary">{coverLetter.tone}</Badge>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{preview}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>v{coverLetter.version}</span>
        {coverLetter.is_edited && <Badge variant="outline">Edited</Badge>}
      </div>
    </div>
  );
}
