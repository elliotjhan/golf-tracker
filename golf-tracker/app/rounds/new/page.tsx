"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type RoundEntry = {
  id: string;
  par: number;
  score: number;
  createdAt: string;
};

const STORAGE_KEY = "golf-tracker-rounds";

function loadRounds(): RoundEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as RoundEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function NewRoundPage() {
  const [par, setPar] = useState("72");
  const [score, setScore] = useState("");
  const [rounds, setRounds] = useState<RoundEntry[]>(() => loadRounds());
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
  }, [rounds]);

  const latestRound = useMemo(() => rounds[0], [rounds]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPar = Number(par);
    const parsedScore = Number(score);

    if (!Number.isFinite(parsedPar) || !Number.isFinite(parsedScore)) {
      setMessage("Enter valid numbers for par and score.");
      return;
    }

    const entry: RoundEntry = {
      id: crypto.randomUUID(),
      par: parsedPar,
      score: parsedScore,
      createdAt: new Date().toISOString(),
    };

    setRounds((currentRounds) => [entry, ...currentRounds]);
    setScore("");
    setMessage("Score saved locally.");
  }

  const scoreDifference = latestRound ? latestRound.score - latestRound.par : 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-5 text-sm text-white/70">
          <Link href="/" className="tracking-[0.3em] uppercase">
            Golf Tracker
          </Link>
          <span>Submit round</span>
        </header>

        <div className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:py-16">
          <section>
            <p className="text-sm uppercase tracking-[0.35em] text-white/55">
              New round
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Save your overall golf score.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              Enter the course par and your final score. This first version
              stores each round in your browser so you can keep track without an
              account.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
            >
              <label className="block">
                <span className="mb-2 block text-sm text-white/70">
                  Course par
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={par}
                  onChange={(event) => setPar(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                  placeholder="72"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-white/70">
                  Your score
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                  placeholder="84"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Save score
                </button>
                <p className="text-sm text-white/60">{message}</p>
              </div>
            </form>
          </section>

          <aside className="space-y-4 lg:pt-12">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/55">Latest saved round</p>
              <div className="mt-3 text-3xl font-semibold">
                {latestRound ? `${latestRound.score}` : "--"}
              </div>
              <p className="mt-2 text-sm text-white/70">
                {latestRound
                  ? `Par ${latestRound.par} • ${scoreDifference >= 0 ? "+" : ""}${scoreDifference} relative to par`
                  : "Submit your first score to see it here."}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/55">Saved rounds</p>
              <ul className="mt-4 space-y-3">
                {rounds.length === 0 ? (
                  <li className="text-sm text-white/50">
                    No rounds saved yet.
                  </li>
                ) : (
                  rounds.map((round) => {
                    const difference = round.score - round.par;

                    return (
                      <li
                        key={round.id}
                        className="flex items-center justify-between border-b border-white/10 pb-3 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            Score {round.score}
                          </p>
                          <p className="text-xs text-white/50">
                            Par {round.par}
                          </p>
                        </div>
                        <div className="text-sm text-white/70">
                          {difference >= 0 ? "+" : ""}
                          {difference}
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
