"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  MapPin,
  Briefcase,
  DollarSign,
  Wifi,
  Sparkles,
  FileText,
  Search,
  Brain,
  CheckCircle2,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  level: string;
  description: string;
  skills: string[];
  salary: string | null;
  remote: boolean;
}

interface Match {
  id: string;
  score: number;
  reasoning: string;
  job: Job;
}

interface MatchesListProps {
  profileId: string;
  onGenerateCoverLetter: (matchId: string) => void;
}

export default function MatchesList({
  profileId,
  onGenerateCoverLetter,
}: MatchesListProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const fetchMatches = useCallback((signal?: AbortSignal) => {
    queueMicrotask(() => {
      void (async () => {
        if (signal?.aborted) return;

        setIsLoading(true);
        setError(null);
        setLoadingStep(0);

        try {
          const response = await fetch("/api/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileId }),
            signal,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch matches");
          }

          if (!signal?.aborted) {
            setMatches(data.matches);
          }
        } catch (err) {
          if (signal?.aborted) return;
          setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
          if (!signal?.aborted) {
            setIsLoading(false);
          }
        }
      })();
    });
  }, [profileId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMatches(controller.signal);

    return () => controller.abort();
  }, [fetchMatches]);

  // Animacija koraka u loading state-u
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerateCoverLetter = async (matchId: string) => {
    setGeneratingFor(matchId);
    try {
      await onGenerateCoverLetter(matchId);
    } finally {
      setGeneratingFor(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-900 bg-emerald-50 border-emerald-300";
    if (score >= 70) return "text-orange-900 bg-orange-50 border-orange-300";
    if (score >= 50) return "text-amber-900 bg-amber-50 border-amber-300";
    return "text-stone-700 bg-stone-100 border-stone-300";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent match";
    if (score >= 70) return "Strong match";
    if (score >= 50) return "Decent match";
    if (score >= 30) return "Weak match";
    return "Poor match";
  };

  if (isLoading) {
    const steps = [
      { icon: Search, text: "Loading available jobs" },
      { icon: Brain, text: "AI analyzing your profile" },
      { icon: Sparkles, text: "Ranking best matches" },
    ];

    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm">
        {/* Hero animated icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">
            Finding your matches
          </h3>
          <p className="text-stone-600">
            Claude is analyzing your profile against every job posting
          </p>
        </div>

        {/* Step indicators */}
        <div className="max-w-md mx-auto space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === loadingStep;
            const isDone = index < loadingStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-orange-50 border border-orange-200"
                    : isDone
                      ? "bg-stone-50 border border-stone-200"
                      : "bg-stone-50/50 border border-transparent"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? "bg-orange-600 text-white"
                      : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`font-semibold text-sm ${
                    isActive
                      ? "text-orange-900"
                      : isDone
                        ? "text-stone-700"
                        : "text-stone-400"
                  }`}
                >
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-stone-500 mt-6">
          This usually takes 5-15 seconds
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 font-semibold mb-3">{error}</p>
        <button
          onClick={() => fetchMatches()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Your Top Matches
        </h2>
        <span className="text-sm font-medium text-stone-500">
          {matches.length} jobs ranked
        </span>
      </div>

      {matches.map((match) => (
        <div
          key={match.id}
          className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                {match.job.title}
              </h3>
              <p className="text-stone-600 font-medium">{match.job.company}</p>
            </div>
            <div
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-sm font-bold ${getScoreColor(
                match.score,
              )}`}
            >
              {match.score}% · {getScoreLabel(match.score)}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-stone-600 mb-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {match.job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              {match.job.type} · {match.job.level}
            </span>
            {match.job.salary && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                {match.job.salary}
              </span>
            )}
            {match.job.remote && (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Wifi className="w-4 h-4" />
                Remote
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {match.job.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs font-semibold rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-stone-900 uppercase tracking-widest">
                Why this matches
              </span>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              {match.reasoning}
            </p>
          </div>

          <button
            onClick={() => handleGenerateCoverLetter(match.id)}
            disabled={generatingFor === match.id}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingFor === match.id ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating cover letter...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Cover Letter
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
