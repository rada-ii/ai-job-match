"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

interface ProfileFormProps {
  onProfileCreated: (profileId: string) => void;
}

const EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "0-1 years (Entry level)" },
  { value: "1-3", label: "1-3 years (Junior)" },
  { value: "3-5", label: "3-5 years (Mid-level)" },
  { value: "5+", label: "5+ years (Senior)" },
];

export default function ProfileForm({ onProfileCreated }: ProfileFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState("1-3");
  const [preferredRoleInput, setPreferredRoleInput] = useState("");
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [bio, setBio] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addRole = () => {
    const trimmed = preferredRoleInput.trim();
    if (trimmed && !preferredRoles.includes(trimmed)) {
      setPreferredRoles([...preferredRoles, trimmed]);
      setPreferredRoleInput("");
    }
  };

  const removeRole = (role: string) => {
    setPreferredRoles(preferredRoles.filter((r) => r !== role));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || skills.length === 0) {
      setError("Name and at least one skill are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          skills,
          experience,
          preferredRoles,
          location: location.trim() || null,
          remoteOnly,
          bio: bio.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create profile");
      }

      onProfileCreated(data.profile.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-sm"
    >
      <div className="space-y-5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={inputClass}
        />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name *"
          className={inputClass}
          required
        />

        {/* Skills */}
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Skills (e.g. React, TypeScript) *"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg transition border border-stone-300"
            >
              Add
            </button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-900 text-sm font-medium rounded-md border border-orange-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-orange-700"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          {EXPERIENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Preferred roles */}
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={preferredRoleInput}
              onChange={(e) => setPreferredRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRole();
                }
              }}
              placeholder="Preferred roles (optional)"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addRole}
              className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg transition border border-stone-300"
            >
              Add
            </button>
          </div>
          {preferredRoles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {preferredRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 text-sm font-medium rounded-md border border-amber-200"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => removeRole(role)}
                    className="hover:text-amber-700"
                    aria-label={`Remove ${role}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location + Remote */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
            className={inputClass}
          />
          <label className="flex items-center justify-center gap-3 cursor-pointer bg-stone-50 border border-stone-300 rounded-lg px-4 hover:bg-stone-100 transition">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="w-5 h-5 rounded border-stone-400 text-orange-600 focus:ring-orange-500 cursor-pointer"
            />
            <span className="text-sm font-semibold text-stone-700">
              Remote only
            </span>
          </label>
        </div>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short bio (optional) — what kind of work are you looking for?"
          rows={3}
          className={`${inputClass} resize-none`}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-10 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating profile...
              </>
            ) : (
              "Find Matches"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
