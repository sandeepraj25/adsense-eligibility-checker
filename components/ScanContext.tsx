"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ScanState = {
  /** Domain the visitor entered, echoed into the report preview. */
  domain: string;
  setDomain: (next: string) => void;
  /** Bumped on each submit so the report replays its scan animation. */
  runId: number;
  runScan: (domain: string) => void;
};

const ScanContext = createContext<ScanState | null>(null);

const DEMO_DOMAIN = "northfield.blog";

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [domain, setDomain] = useState(DEMO_DOMAIN);
  const [runId, setRunId] = useState(0);

  const runScan = useCallback((next: string) => {
    setDomain(next);
    setRunId((id) => id + 1);
  }, []);

  return (
    <ScanContext.Provider value={{ domain, setDomain, runId, runScan }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error("useScan must be used inside <ScanProvider>");
  return ctx;
}
