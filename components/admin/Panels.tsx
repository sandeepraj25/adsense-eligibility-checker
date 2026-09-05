import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * The two shapes every admin page is built from: a titled panel, and a
 * table that stays readable on a phone. Both are plain server components
 * — the panel is chrome, and putting chrome in a client bundle for no
 * interaction would be wasteful.
 */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("glass rounded-2xl", className)}>
      <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[1rem] font-medium text-cloud-50">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-cloud-600">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

/**
 * A horizontally scrollable table. Admin tables carry more columns than a
 * phone can show, and scrolling the table beats hiding columns that
 * someone came to the panel specifically to read.
 */
export function TableShell({
  head,
  children,
  className,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("-mx-5 overflow-x-auto px-5", className)}>
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/[0.08]">{head}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "t-eyebrow px-3 py-2.5 text-[0.625rem] font-medium whitespace-nowrap text-cloud-600 first:pl-0 last:pr-0",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  mono = false,
}: {
  children?: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-3 py-3 align-middle text-[0.875rem] text-cloud-200 first:pl-0 last:pr-0",
        mono && "t-data text-[0.8125rem]",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]",
        className,
      )}
    >
      {children}
    </tr>
  );
}

/** A filter row rendered as links, so filters survive a page reload. */
export function FilterTabs({
  options,
  current,
  className,
}: {
  options: { label: string; href: string; value: string; count?: number }[];
  current: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((option) => {
        const active = option.value === current;
        return (
          <Link
            key={option.value}
            href={option.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[0.8125rem] transition-colors",
              active
                ? "border-azure-500/40 bg-azure-500/12 text-azure-300"
                : "border-white/10 bg-white/[0.03] text-cloud-400 hover:border-white/16 hover:text-cloud-200",
            )}
          >
            {option.label}
            {option.count !== undefined ? (
              <span className="t-data ml-1.5 text-[0.75rem] text-cloud-600">
                {option.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

/** "Nothing matched" inside a panel — lighter than the full EmptyState. */
export function NoRows({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-8 text-center text-[0.875rem] text-cloud-600">{children}</p>
  );
}
