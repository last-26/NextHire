"use client";

import { Badge } from "@/components/ui/badge";

interface SkillMatchProps {
  matched: string[];
  missing: string[];
}

export function SkillMatch({ matched, missing }: SkillMatchProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Matched Skills ({matched.length})</h4>
        <div className="flex flex-wrap gap-1.5">
          {matched.map((skill) => (
            <Badge key={skill} variant="success">
              {skill}
            </Badge>
          ))}
          {matched.length === 0 && (
            <p className="text-sm text-muted-foreground">No matches found</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Missing Skills ({missing.length})</h4>
        <div className="flex flex-wrap gap-1.5">
          {missing.map((skill) => (
            <Badge key={skill} variant="destructive">
              {skill}
            </Badge>
          ))}
          {missing.length === 0 && (
            <p className="text-sm text-muted-foreground">No missing skills</p>
          )}
        </div>
      </div>
    </div>
  );
}
