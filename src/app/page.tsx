"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import MatchesList from "@/components/MatchesList";
import CoverLetterModal from "@/components/CoverLetterModal";
import ChatBot from "@/components/ChatBot";

type View = "form" | "matches";

export default function Home() {
  const [view, setView] = useState<View>("form");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const handleProfileCreated = (id: string) => {
    setProfileId(id);
    setView("matches");
  };

  const handleGenerateCoverLetter = (matchId: string) => {
    setSelectedMatchId(matchId);
  };

  const handleReset = () => {
    setView("form");
    setProfileId(null);
    setSelectedMatchId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Navigation */}
      <nav className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight">
              <span className="text-stone-900">JOB</span>
              <span className="text-[#d97757]">MATCH</span>
            </span>
          </div>
          {view === "matches" && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-[#d97757] bg-stone-900 hover:bg-stone-800 rounded-lg transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              New search
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8 sm:py-12">
          {view === "form" && (
            <>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 px-8 py-12 sm:px-12 sm:py-16 mb-8 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-15 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500 opacity-10 rounded-full blur-3xl" />

                <div className="relative text-center">
                  <div className="inline-block px-3 py-1 mb-4 text-xs font-bold text-[#d97757] bg-orange-500/10 border border-orange-500/20 rounded-full uppercase tracking-widest">
                    AI-Powered
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                    Find your match
                  </h1>
                  <p className="text-stone-300 max-w-xl mx-auto leading-relaxed">
                    Tell us about your skills and experience. Our AI ranks jobs
                    tailored to your profile and crafts personalized cover
                    letters in seconds.
                  </p>
                </div>
              </div>

              <ProfileForm onProfileCreated={handleProfileCreated} />
            </>
          )}

          {view === "matches" && profileId && (
            <MatchesList
              profileId={profileId}
              onGenerateCoverLetter={handleGenerateCoverLetter}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-stone-500">
          Built by{" "}
          <a
            href="https://github.com/rada-ii"
            className="text-[#d97757] hover:underline font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rada Ivanković
          </a>
          {" · "}
          Powered by Claude API
        </div>
      </footer>

      {selectedMatchId && (
        <CoverLetterModal
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      {/* Floating chat bot — uvek dostupan */}
      <ChatBot profileId={profileId} />
    </div>
  );
}
