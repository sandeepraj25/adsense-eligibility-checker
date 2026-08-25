"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/** Number that ticks up when it scrolls into view. Tabular, so it never jitters. */
export function CountUp({
  to,
  duration = 1.6,
  format,
  className,
  start = true,
}: {
  to: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
  start?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || !start) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(latest),
    });
    return () => controls.stop();
  }, [inView, start, to, duration, reduce]);

  const display = format
    ? format(value)
    : Math.round(value).toLocaleString("en-US");

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
