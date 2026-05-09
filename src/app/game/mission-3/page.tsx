import Link from "next/link";
import { mission3 } from "@/entities/mission";
import { MissionCard } from "@/features/mission-card/MissionCard";

export default function Mission3Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16">
        <div className="rounded-4xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-300">
                Миссия
              </p>
              <h1 className="mt-3 text-5xl font-semibold tracking-tight text-white">
                {mission3.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                {mission3.description}
              </p>
            </div>
            <Link
              href="/game"
              className="inline-flex cursor-pointer rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              Назад в Core Room
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {mission3.options.map((option) => (
            <MissionCard
              key={option.id}
              option={option}
              onSelect={() => undefined}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
