import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full rounded-[36px] border border-white/10 bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/20 backdrop-blur-sm">
          <div className="space-y-6 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              MVP игрового проекта
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Ценности команды: игра-приключение
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Познакомьтесь с ценностями компании через игровой стартовый экран
              и 3D-навигацию.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/game"
                className="inline-flex rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Начать игру
              </Link>
              <Link
                href="#about"
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              >
                О проекте
              </Link>
            </div>
          </div>
          <section
            id="about"
            className="mt-14 rounded-[28px] border border-white/5 bg-slate-950/80 p-8"
          >
            <h2 className="text-2xl font-semibold text-white">Структура MVP</h2>
            <p className="mt-4 max-w-3xl text-slate-400">
              Здесь начальный экран проекта. Дальше будет игра с трехмерной
              сценой, миссиями и прогрессом.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Ответственность", "Прозрачность", "Скорость"].map((value) => (
                <div
                  key={value}
                  className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-left"
                >
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                    Ценность
                  </p>
                  <p className="mt-2 text-base font-medium text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
