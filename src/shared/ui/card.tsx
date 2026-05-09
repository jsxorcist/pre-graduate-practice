import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-4xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/20 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
