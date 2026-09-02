import Link from "next/link";
import type { ReactNode } from "react";
import type { CrmAccount } from "@/lib/types";

export function AccountHeader({
  account,
  right,
}: {
  account: CrmAccount;
  right?: ReactNode;
}) {
  return (
    <>
      <Link
        href="/"
        className="text-sm text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
      >
        ← All accounts
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {account.company_name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {account.industry ?? "—"} · Owned by {account.account_owner}
            {account.location ? ` · ${account.location}` : ""}
          </p>
          <a
            href={account.domain}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
          >
            {account.domain.replace(/^https?:\/\//, "")} ↗
          </a>
        </div>
        {right}
      </header>
    </>
  );
}
