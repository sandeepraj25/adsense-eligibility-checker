import { Eyebrow } from "./Eyebrow";
import { cn } from "@/lib/cn";

export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="t-display t-h2 max-w-2xl text-balance">{title}</h2>
      {lede ? (
        <p className={cn("t-body max-w-xl", align === "center" && "mx-auto")}>
          {lede}
        </p>
      ) : null}
    </div>
  );
}
