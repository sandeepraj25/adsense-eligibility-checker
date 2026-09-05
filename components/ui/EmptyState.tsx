import { cn } from "@/lib/cn";
import { ButtonLink } from "./Button";

/**
 * The "nothing here yet" state. Deliberately not a sad grey box: a faint
 * dot field and a single soft glow keep it feeling like part of the
 * product rather than a dead end.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass relative overflow-hidden rounded-2xl px-6 py-14 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="dot-field pointer-events-none absolute inset-0 opacity-45"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-iris-500/12 blur-3xl"
      />

      <div className="relative mx-auto max-w-sm">
        {icon ? (
          <div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-azure-300">
            {icon}
          </div>
        ) : null}

        <h3 className="t-h3 text-cloud-50">{title}</h3>
        {body ? (
          <p className="mx-auto mt-2.5 max-w-[34ch] text-[0.9375rem] leading-relaxed text-cloud-400">
            {body}
          </p>
        ) : null}

        {action ? (
          <div className="mt-6 flex justify-center">
            <ButtonLink href={action.href} size="md">
              {action.label}
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}
