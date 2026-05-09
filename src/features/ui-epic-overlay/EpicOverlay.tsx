"use client";

interface EpicOverlayProps {
  active: boolean;
}

export default function EpicOverlay({ active }: EpicOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${active ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      <div className="relative flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.45),transparent_45%)] blur-3xl opacity-90" />
        <div className="absolute -inset-y-8 -left-20 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3),transparent_50%)] blur-3xl" />
        <div className="absolute -inset-y-8 -right-20 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.28),transparent_50%)] blur-3xl" />
        <div className="relative flex flex-col items-center gap-4">
          <span className="text-5xl font-black uppercase tracking-[-0.08em] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.45)] sm:text-6xl md:text-7xl animate-epic-scale">
            what if i fall?
          </span>
          <span className="text-6xl font-black uppercase tracking-[-0.08em] text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-pink-400 to-cyan-300 drop-shadow-[0_0_30px_rgba(255,168,69,0.6)] sm:text-7xl md:text-8xl animate-epic-pulse">
            bro what if you fly
          </span>
          <span className="text-9xl font-black uppercase tracking-[-0.08em] text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-pink-400 to-cyan-300 drop-shadow-[0_0_30px_rgba(255,168,69,0.6)] sm:text-7xl md:text-8xl animate-epic-pulse">
            67
          </span>
        </div>
      </div>
      <style jsx>{`
        .animate-epic-scale {
          animation: epicScale 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .animate-epic-pulse {
          animation: epicPulse 1.2s ease-in-out infinite alternate 0.2s;
        }

        @keyframes epicScale {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          60% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes epicPulse {
          from {
            transform: scale(1);
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.25));
          }
          to {
            transform: scale(1.03);
            filter: drop-shadow(0 0 32px rgba(255, 255, 255, 0.38));
          }
        }
      `}</style>
    </div>
  );
}
