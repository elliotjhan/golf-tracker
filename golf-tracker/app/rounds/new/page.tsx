"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type RoundEntry = {
  id: string;
  date: string;
  par: number;
  score: number;
  createdAt: string;
};

type ActiveTab = "entry" | "scores" | "graph";

type RoundFormValues = {
  date: string;
  par: string;
  score: string;
};

const STORAGE_KEY = "golf-tracker-rounds";

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
      <path d="M19 6l-1 13.2A1.8 1.8 0 0 1 16.2 21H7.8A1.8 1.8 0 0 1 6 19.2L5 6" />
      <path d="M10 10v6" />
      <path d="M14 10v6" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

type RoundFormProps = {
  editingRound?: RoundEntry;
  message: string;
  onSubmit: (values: RoundFormValues) => void;
  onCancelEdit: () => void;
};

function RoundForm({
  editingRound,
  message,
  onSubmit,
  onCancelEdit,
}: RoundFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(editingRound?.date ?? today);
  const [par, setPar] = useState(editingRound ? String(editingRound.par) : "");
  const [score, setScore] = useState(
    editingRound ? String(editingRound.score) : "",
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      date,
      par,
      score,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
    >
      {editingRound ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
          Editing round from {editingRound.date}
        </div>
      ) : null}

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
        <span className="mb-2 block text-sm text-white/70">Course par</span>
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
        <span className="mb-2 block text-sm text-white/70">Your score</span>
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
          {editingRound ? "Update score" : "Save score"}
        </button>
        {editingRound ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white"
          >
            Cancel edit
          </button>
        ) : null}
        <p className="text-sm text-white/60">{message}</p>
      </div>
    </form>
  );
}

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rounds, setRounds] = useState<RoundEntry[]>(() => loadRounds());
  const [message, setMessage] = useState("");
  const [formResetSeed, setFormResetSeed] = useState(0);
  const [pendingDeleteRoundId, setPendingDeleteRoundId] = useState<
    string | null
  >(null);

  const tabParam = searchParams.get("tab");
  const editParam = searchParams.get("edit");
  const activeTab: ActiveTab =
    tabParam === "scores" || tabParam === "graph" || tabParam === "entry"
      ? tabParam
      : "entry";
  const editingRound = useMemo(
    () => rounds.find((round) => round.id === editParam),
    [editParam, rounds],
  );

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

    const relativeScores = graphRounds.map((round) => round.score - round.par);
    const minScore = 0;
    const maxScore = Math.max(...relativeScores);
    const range = Math.max(maxScore - minScore, 1);
    const width = 720;
    const height = 280;
    const paddingX = 28;
    const paddingY = 28;

    const points = graphRounds.map((round, index) => {
      const relativeScore = round.score - round.par;
      const x =
        graphRounds.length === 1
          ? width / 2
          : paddingX +
            (index * (width - paddingX * 2)) / (graphRounds.length - 1);
      const y =
        height -
        paddingY -
        ((Math.max(relativeScore, 0) - minScore) / range) *
          (height - paddingY * 2);

      return {
        ...round,
        relativeScore,
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

  function handleSubmit(values: RoundFormValues) {
    const parsedPar = Number(values.par);
    const parsedScore = Number(values.score);

    if (!Number.isFinite(parsedPar) || !Number.isFinite(parsedScore)) {
      setMessage("Enter valid numbers for par and score.");
      return;
    }

    if (editingRound) {
      setRounds((currentRounds) =>
        currentRounds.map((round) =>
          round.id === editingRound.id
            ? {
                ...round,
                date: values.date,
                par: parsedPar,
                score: parsedScore,
              }
            : round,
        ),
      );
      router.replace("/rounds/new?tab=scores");
      setMessage("Score updated locally.");
      setFormResetSeed((currentSeed) => currentSeed + 1);
      return;
    }

    const entry: RoundEntry = {
      id: crypto.randomUUID(),
      date: values.date,
      par: parsedPar,
      score: parsedScore,
      createdAt: new Date().toISOString(),
    };

    setRounds((currentRounds) => [entry, ...currentRounds]);
    setMessage("Score saved locally.");
    setFormResetSeed((currentSeed) => currentSeed + 1);
  }

  function handleEditRound(id: string) {
    setPendingDeleteRoundId(null);
    router.push(`/rounds/new?tab=entry&edit=${id}`);
  }

  function handleCancelEdit() {
    router.replace("/rounds/new?tab=scores");
    setMessage("");
    setFormResetSeed((currentSeed) => currentSeed + 1);
  }

  function handleDeleteRound(id: string) {
    setRounds((currentRounds) =>
      currentRounds.filter((round) => round.id !== id),
    );
    setPendingDeleteRoundId(null);
    setMessage("Score deleted.");
  }

  const scoreDifference = latestRound ? latestRound.score - latestRound.par : 0;
  const isScoresTab = activeTab === "scores";
  const isGraphTab = activeTab === "graph";

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[67rem] flex-col px-6 py-8 sm:px-10 lg:px-12">
        <div
          className={`grid flex-1 gap-8 py-10 lg:items-start lg:py-16 ${
            isScoresTab || isGraphTab
              ? "lg:grid-cols-1"
              : "lg:grid-cols-[1.25fr_0.75fr]"
          }`}
        >
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
              <RoundForm
                key={`${editParam ?? "new"}-${formResetSeed}`}
                editingRound={editingRound}
                message={message}
                onSubmit={handleSubmit}
                onCancelEdit={handleCancelEdit}
              />
            ) : activeTab === "scores" ? (
              <div className="mt-10 space-y-6">
                {latestRound ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <p className="text-sm text-white/55">Latest saved round</p>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <div className="text-3xl font-semibold">
                          {latestRound.score}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/70">
                          <span>{latestRound.date}</span>
                          <span className="text-white/35">•</span>
                          <span>Par {latestRound.par}</span>
                        </div>
                      </div>
                      <div className="text-sm text-white/70">
                        {scoreDifference >= 0 ? "+" : ""}
                        {scoreDifference} relative to par
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                  <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.75fr] gap-3 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.28em] text-white/45">
                    <div>Date</div>
                    <div>Par</div>
                    <div>Score</div>
                    <div>To Par</div>
                    <div className="text-right">Actions</div>
                  </div>

                  <div className="divide-y divide-white/10">
                    {rounds.length === 0 ? (
                      <div className="px-6 py-8 text-sm text-white/50">
                        No rounds saved yet.
                      </div>
                    ) : (
                      rounds.map((round) => {
                        const difference = round.score - round.par;

                        return (
                          <div
                            key={round.id}
                            className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.75fr] items-center gap-3 px-6 py-4 text-sm"
                          >
                            <div className="text-white/85">{round.date}</div>
                            <div className="text-white/70">{round.par}</div>
                            <div className="font-medium text-white">
                              {round.score}
                            </div>
                            <div className="text-white/70">
                              {difference >= 0 ? "+" : ""}
                              {difference}
                            </div>
                            <div className="relative flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditRound(round.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/5 hover:text-white"
                                aria-label={`Edit round on ${round.date}`}
                              >
                                <PencilIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingDeleteRoundId((currentId) =>
                                    currentId === round.id ? null : round.id,
                                  )
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/5 hover:text-white"
                                aria-label={`Delete round on ${round.date}`}
                              >
                                <TrashIcon />
                              </button>

                              {pendingDeleteRoundId === round.id ? (
                                <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-2xl border border-white/10 bg-black px-3 py-3 text-left shadow-2xl shadow-black/50">
                                  <p className="text-xs text-white/70">
                                    Are you sure?
                                  </p>
                                  <div className="mt-3 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteRound(round.id)
                                      }
                                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-white/90"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingDeleteRoundId(null)
                                      }
                                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
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
                            {point.relativeScore >= 0 ? "+" : ""}
                            {point.relativeScore}
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
                      <span>Low: 0</span>
                      <span>
                        High: {graphMetrics.maxScore >= 0 ? "+" : ""}
                        {graphMetrics.maxScore}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </section>

          {activeTab === "entry" ? (
            <aside className="space-y-4 lg:pt-12">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-white/55">Latest saved round</p>
                <div className="mt-3 text-3xl font-semibold">
                  {latestRound ? `${latestRound.score}` : "--"}
                </div>
                {latestRound ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/70">
                    <span>{latestRound.date}</span>
                    <span className="text-white/35">•</span>
                    <span>Par {latestRound.par}</span>
                  </div>
                ) : null}
                <p className="mt-2 text-sm text-white/70">
                  {latestRound
                    ? `
                        ${scoreDifference >= 0 ? "+" : ""}${scoreDifference}
                        relative to par
                      `
                        .replace(/\s+/g, " ")
                        .trim()
                    : "Submit your first score to see it here."}
                </p>
              </div>
            </aside>
          ) : isGraphTab ? (
            <aside className="hidden lg:block" aria-hidden="true" />
          ) : null}
        </div>
      </section>
    </main>
  );
}
