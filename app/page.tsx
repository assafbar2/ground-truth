"use client";

import { useState, useRef } from "react";

interface Perspective {
  ideology: string;
  headline: string;
  tagline: string;
  body: string;
  keyValues: string[];
}

const IDEOLOGY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  Left: { bg: "bg-red-950/40", border: "border-red-700/50", label: "bg-red-700" },
  "Center-Left": { bg: "bg-orange-950/30", border: "border-orange-600/50", label: "bg-orange-600" },
  Center: { bg: "bg-zinc-800/60", border: "border-zinc-600/50", label: "bg-zinc-600" },
  "Center-Right": { bg: "bg-blue-950/30", border: "border-blue-600/50", label: "bg-blue-600" },
  Right: { bg: "bg-indigo-950/40", border: "border-indigo-700/50", label: "bg-indigo-700" },
};

export default function Home() {
  const [topic, setTopic] = useState("");
  const [perspectives, setPerspectives] = useState<Perspective[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTopic, setSubmittedTopic] = useState("");
  const inFlightRef = useRef(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inFlightRef.current) return;
    const trimmed = topic.trim();
    if (!trimmed) {
      setError("Please enter a topic.");
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setPerspectives(null);
    setSubmittedTopic(trimmed);

    try {
      const res = await fetch("/api/perspectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
        signal: AbortSignal.timeout(16000),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't reach a perspective on that. Try again.");
      } else {
        setPerspectives(data.perspectives);
      }
    } catch {
      setError("Couldn't reach a perspective on that. Try again.");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-16 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-2xl mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Ground Truth</h1>
        <p className="text-zinc-500 text-sm">
          One topic. Five perspectives. No algorithm.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a news topic…"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors text-base"
            disabled={loading}
            maxLength={600}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-zinc-100 text-zinc-900 font-semibold px-6 py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
          >
            {loading ? "…" : "Go"}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-red-400 text-sm">{error}</p>
        )}
      </form>

      {/* Loading */}
      {loading && (
        <div className="w-full max-w-2xl text-center text-zinc-500 text-sm animate-pulse">
          Gathering perspectives on &ldquo;{submittedTopic}&rdquo;…
        </div>
      )}

      {/* Results */}
      {perspectives && !loading && (
        <div className="w-full max-w-4xl">
          <p className="text-zinc-600 text-xs text-center mb-8 tracking-wide uppercase">
            {submittedTopic}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {perspectives.map((p) => {
              const colors = IDEOLOGY_COLORS[p.ideology] ?? IDEOLOGY_COLORS["Center"];
              return (
                <div
                  key={p.ideology}
                  className={`rounded-xl border p-5 flex flex-col gap-3 ${colors.bg} ${colors.border}`}
                >
                  {/* Label */}
                  <span className={`self-start text-xs font-bold px-2 py-0.5 rounded-full text-white ${colors.label}`}>
                    {p.ideology}
                  </span>

                  {/* Headline */}
                  <h2 className="text-base font-semibold leading-snug text-zinc-100">
                    {p.headline}
                  </h2>

                  {/* Tagline */}
                  <p className="text-zinc-400 text-sm italic leading-relaxed">
                    {p.tagline}
                  </p>

                  {/* Body */}
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {p.body}
                  </p>

                  {/* Key Values */}
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-zinc-700/40">
                    {p.keyValues.map((v) => (
                      <span
                        key={v}
                        className="text-xs text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 text-zinc-700 text-xs text-center">
        Perspectives are AI-generated framings, not news summaries.
      </footer>
    </main>
  );
}
