"use client";

import { FileText, Target, Mail, Briefcase } from "lucide-react";

const stats = [
  { label: "Analyses Run", value: "0", icon: Target, color: "text-blue-600" },
  { label: "Applications", value: "0", icon: Briefcase, color: "text-green-600" },
  { label: "Cover Letters", value: "0", icon: Mail, color: "text-purple-600" },
  { label: "CVs Parsed", value: "0", icon: FileText, color: "text-orange-600" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome to NextHire. Start by analyzing a job posting.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-lg border p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              1
            </div>
            <div>
              <p className="font-medium">Upload your CV</p>
              <p className="text-sm text-muted-foreground">
                Support for PDF and DOCX formats
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              2
            </div>
            <div>
              <p className="font-medium">Paste a job description</p>
              <p className="text-sm text-muted-foreground">
                Or provide a URL to the job posting
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              3
            </div>
            <div>
              <p className="font-medium">Get AI-powered analysis</p>
              <p className="text-sm text-muted-foreground">
                ATS score, gap analysis, and personalized cover letter
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
