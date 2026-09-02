import Link from "next/link";

// Sub-navigation shared by the two account drill-in pages.
export function AccountTabs({
  domain,
  active,
}: {
  domain: string;
  active: "score" | "signals";
}) {
  const id = encodeURIComponent(domain);
  const tabs = [
    { key: "score", label: "Score breakdown", href: `/accounts/${id}` },
    { key: "signals", label: "Account signals", href: `/accounts/${id}/signals` },
  ] as const;

  return (
    <nav className="mt-4 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            active === t.key
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
