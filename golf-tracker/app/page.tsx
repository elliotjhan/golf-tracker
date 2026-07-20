export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
        <div className="flex flex-1 items-center py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm uppercase tracking-[0.35em] text-white/55">
              Track every round
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              A clean way to keep score on the course.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70 sm:text-xl">
              Log your golf scores in one place, review your rounds, and stay
              focused on lowering your handicap.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/rounds/new"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              >
                Start tracking
              </a>
            </div>
          </div>
        </div>

        <section
          id="features"
          className="grid gap-4 border-t border-white/10 py-8 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/55">Fast entry</p>
            <h2 className="mt-2 text-lg font-medium">Log rounds quickly</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/55">Score history</p>
            <h2 className="mt-2 text-lg font-medium">See how you improve</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/55">Course ready</p>
            <h2 className="mt-2 text-lg font-medium">Built for simple use</h2>
          </div>
        </section>
      </section>
    </main>
  );
}
