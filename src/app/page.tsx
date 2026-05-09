import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="rounded-4xl border border-white/10 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950/90 p-8 shadow-[0_30px_120px_-40px_rgba(14,22,45,0.9)] sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-8">
              <span className="inline-flex rounded-full bg-orange-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-orange-300">
                Dopamine Office
              </span>
              <div className="space-y-6">
                <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  Включай игру и почувствуй ценности команды
                </h1>
                <p className="max-w-xl text-lg leading-8 text-slate-300">
                  На старте ты попадаешь в Core Room, где один объект ведёт к
                  первой миссии. Всё пространство живёт, реагирует и показывает
                  настроение компании.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/game"
                  className="inline-flex cursor-pointer rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-orange-400"
                >
                  Начать игру
                </Link>
                <Link
                  href="#values"
                  className="inline-flex cursor-pointer rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                >
                  Ценности
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-fuchsia-500/20 via-orange-500/10 to-cyan-400/10 p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="absolute inset-0 bg-white/5" />
              <div className="relative space-y-5">
                <div className="rounded-4xl bg-slate-950/80 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.9)]">
                  <p className="text-sm uppercase tracking-[0.35em] text-orange-300">
                    Core Room
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold text-white">
                    Твоя первая зона
                  </h2>
                  <p className="mt-3 text-slate-300">
                    Один объект. Один выбор. Первая миссия начинается здесь.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Ответственность", color: "bg-orange-500/15" },
                    { title: "Прозрачность", color: "bg-cyan-500/10" },
                    { title: "Скорость", color: "bg-fuchsia-500/10" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className={`${item.color} rounded-3xl border border-white/10 p-4 text-sm font-medium text-slate-100`}
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <section
            id="values"
            className="mt-10 rounded-4xl border border-white/10 bg-slate-950/80 p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
                  Что важно
                </p>
                <h2 className="text-3xl font-semibold text-white">
                  Три движущие силы проекта
                </h2>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Ответственность",
                  description:
                    "Игрок принимает решение и видит, как мир меняется.",
                },
                {
                  title: "Прозрачность",
                  description:
                    "Решения становятся понятнее через визуальную реакцию.",
                },
                {
                  title: "Скорость",
                  description: "Действие должно быть быстрым и уверенным.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-slate-200"
                >
                  <h3 className="text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {item.description}
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
