"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-brand-soft text-brand-fg"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      }`}
    >
      {children}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-brand text-[13px] font-bold text-white">
              A
            </span>
            <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Account Prioritization
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            <NavLink href="/">Accounts</NavLink>
            <NavLink href="/scoring">Scoring</NavLink>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 text-xs text-zinc-500 dark:text-zinc-400">
          Internal tool for Adyen account managers. Priority scores are computed in-app from CRM,
          product usage and Gong call signals.
        </div>
      </footer>
    </div>
  );
}
