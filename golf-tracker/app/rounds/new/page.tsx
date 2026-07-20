"use client";

import { useEffect, useMemo, useState } from "react";

type RoundEntry = {
  id: string;
  date: string;
  par: number;
  score: number;
  createdAt: string;
};

type ActiveTab = "entry" | "scores" | "graph";

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
  const today = new Date().toISOString().slice(0, 10);
  const [activeTab, setActiveTab] = useState<ActiveTab>("entry");
  const [par, setPar] = useState("");
  const [score, setScore] = useState("");
  const [date, setDate] = useState(today);
  const [rounds, setRounds] = useState<RoundEntry[]>(() => loadRounds());
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
  }, [rounds]);

  const latestRound = useMemo(() => rounds[0], [rounds]);
  const graphRounds = useMemo(() => [...rounds].reverse(), [rounds]);
  const graphMetrics = useMemo(() => {
    if (graphRounds.length === 0) {
      return null;
    }

    const scores = graphRounds.map((round) => round.score);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = Math.max(maxScore - minScore, 1);
    const width = 720;
    const height = 280;
    const paddingX = 28;
    const paddingY = 28;

    const points = graphRounds.map((round, index) => {
      const x =
        graphRounds.length === 1
          ? width / 2
          : paddingX +
            (index * (width - paddingX * 2)) / (graphRounds.length - 1);
      const y =
        height -
        paddingY -
        ((round.score - minScore) / range) * (height - paddingY * 2);

      return {
        ...round,
        x,
        y,
      };
    });

    const polylinePoints = points
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    return {
      width,
      height,
      minScore,
      maxScore,
      points,
      polylinePoints,
    };
  }, [graphRounds]);

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
      date,
      par: parsedPar,
      score: parsedScore,
      createdAt: new Date().toISOString(),
    };

    setRounds((currentRounds) => [entry, ...currentRounds]);
    setScore("");
    setMessage("Score saved locally.");
  }

  function handleDeleteRound(id: string) {
    setRounds((currentRounds) =>
      currentRounds.filter((round) => round.id !== id),
    );
    setMessage("Score deleted.");
  }

  const scoreDifference = latestRound ? latestRound.score - latestRound.par : 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 py-4 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("entry")}
            className={`rounded-full px-4 py-2 transition ${
              activeTab === "entry"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("scores")}
            className={`rounded-full px-4 py-2 transition ${
              activeTab === "scores"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Scores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("graph")}
            className={`rounded-full px-4 py-2 transition ${
              activeTab === "graph"
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Graph
          </button>
        </div>

        <div className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:py-16">
          <section>
            <p className="text-sm uppercase tracking-[0.35em] text-white/55">
              {activeTab === "graph"
                ? "Score graph"
                : activeTab === "scores"
                  ? "Saved scores"
                  : "New round"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {activeTab === "graph"
                ? "See your scores over time."
                : activeTab === "scores"
                  ? "Review every saved round."
                  : "Save your overall golf score."}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
              {activeTab === "graph"
                ? "A simple view of your saved scores plotted as a line graph from the rounds stored in your browser."
                : activeTab === "scores"
                  ? "Check your saved rounds, compare them to par, and delete anything you no longer want to keep."
                  : "Enter the course par and your final score. This first version stores each round in your browser so you can keep track without an account."}
            </p>

            {activeTab === "entry" ? (
              <form
                onSubmit={handleSubmit}
                className="mt-10 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
              >
                <label className="block">
                  <span className="mb-2 block text-sm text-white/70">Date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                  />
                </label>

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
            ) : activeTab === "graph" ? (
              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
                {graphMetrics === null ? (
                  <p className="text-sm text-white/50">No rounds saved yet.</p>
                ) : (
                  <div className="overflow-x-auto pb-2">
                    <svg
                      viewBox={`0 0 ${graphMetrics.width} ${graphMetrics.height}`}
                      className="h-[320px] w-full min-w-[640px]"
                      role="img"
                      aria-label="Line graph of saved golf scores"
                    >
                      <line
                        x1="28"
                        y1={graphMetrics.height - 28}
                        x2={graphMetrics.width - 28}
                        y2={graphMetrics.height - 28}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                      />
                      <line
                        x1="28"
                        y1="28"
                        x2="28"
                        y2={graphMetrics.height - 28}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                      />
                      <polyline
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={graphMetrics.polylinePoints}
                      />
                      {graphMetrics.points.map((point) => (
                        <g key={point.id}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="4.5"
                            fill="white"
                          />
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="9"
                            fill="transparent"
                          />
                          <text
                            x={point.x}
                            y={point.y - 14}
                            fill="rgba(255,255,255,0.7)"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            {point.score}
                          </text>
                          <text
                            x={point.x}
                            y={graphMetrics.height - 8}
                            fill="rgba(255,255,255,0.45)"
                            fontSize="10"
                            textAnchor="middle"
                          >
                            {point.date}
                          </text>
                        </g>
                      ))}
                    </svg>
                    <div className="mt-3 flex items-center justify-between text-xs text-white/45">
                      <span>Low: {graphMetrics.minScore}</span>
                      <span>High: {graphMetrics.maxScore}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
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

            {activeTab !== "graph" ? (
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
                              {round.date} • Par {round.par}
                            </p>
                          </div>
                          <div className="text-sm text-white/70">
                            {difference >= 0 ? "+" : ""}
                            {difference}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteRound(round.id)}
                            className="ml-4 rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 transition hover:border-white/25 hover:text-white"
                          >
                            Delete
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
