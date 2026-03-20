"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";

interface CoverLetterEditorProps {
  initialContent: string;
  onSave?: (content: string) => void;
}

export function CoverLetterEditor({ initialContent, onSave }: CoverLetterEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-1" />
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        {onSave && (
          <Button size="sm" onClick={() => onSave(content)}>
            Save
          </Button>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[400px] rounded-lg border bg-background p-4 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
