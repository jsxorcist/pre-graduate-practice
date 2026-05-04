import Link from "next/link";

export default function GamePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-4 rounded-4xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                Игровой режим
              </p>
              <h1 className="text-4xl font-semibold text-white">Игра</h1>
            </div>
            <Link
              href="/"
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              Вернуться на старт
            </Link>
          </div>
          <p className="max-w-3xl text-slate-400">
            Здесь будет сцена Three.js и основная игровая механика. Пока виден
            пустой контейнер для 3D-сцены.
          </p>
          <div className="rounded-4xl border border-dashed border-white/15 bg-slate-950/70 p-8">
            <div className="flex h-96 items-center justify-center rounded-3xl border border-white/10 bg-black/70 text-center text-slate-400">
              Пустой контейнер для 3D-сцены
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
