/**
 * Static demo data for the homepage. No backend — these describe the
 * real review dimensions AdSense applications are judged on, so the
 * marketing surface stays honest about what the product measures.
 */

export type Status = "pass" | "warn" | "fail";

export type Check = {
  id: string;
  label: string;
  status: Status;
  detail: string;
};

export type Category = {
  id: string;
  name: string;
  /** Short taxonomy label used as an eyebrow. */
  code: string;
  weight: number;
  checks: Check[];
};

export const categories: Category[] = [
  {
    id: "content",
    name: "Content quality",
    code: "CNT",
    weight: 32,
    checks: [
      {
        id: "cnt-1",
        label: "Original long-form pages",
        status: "pass",
        detail: "41 of 48 pages exceed 900 words with no duplicate bodies.",
      },
      {
        id: "cnt-2",
        label: "Thin or placeholder pages",
        status: "warn",
        detail: "3 pages under 200 words. Expand or set them to noindex.",
      },
      {
        id: "cnt-3",
        label: "Restricted topics",
        status: "pass",
        detail: "No adult, weapons, or gambling signals detected.",
      },
      {
        id: "cnt-4",
        label: "Publishing consistency",
        status: "pass",
        detail: "11 posts in the last 90 days — steady cadence.",
      },
    ],
  },
  {
    id: "policy",
    name: "Required pages",
    code: "POL",
    weight: 26,
    checks: [
      {
        id: "pol-1",
        label: "Privacy policy",
        status: "pass",
        detail: "Found at /privacy with cookie and ad-serving disclosure.",
      },
      {
        id: "pol-2",
        label: "Contact route",
        status: "fail",
        detail: "No contact page or form. Reviewers treat this as a blocker.",
      },
      {
        id: "pol-3",
        label: "About page",
        status: "pass",
        detail: "Named author with a real bio at /about.",
      },
      {
        id: "pol-4",
        label: "Terms of service",
        status: "warn",
        detail: "Present but unlinked from the footer.",
      },
    ],
  },
  {
    id: "technical",
    name: "Technical health",
    code: "TEC",
    weight: 24,
    checks: [
      {
        id: "tec-1",
        label: "HTTPS across all routes",
        status: "pass",
        detail: "Valid certificate, no mixed content.",
      },
      {
        id: "tec-2",
        label: "Crawlability",
        status: "pass",
        detail: "robots.txt allows AdSense. Sitemap reachable.",
      },
      {
        id: "tec-3",
        label: "Mobile usability",
        status: "warn",
        detail: "Two templates overflow at 360px width.",
      },
      {
        id: "tec-4",
        label: "Core Web Vitals",
        status: "pass",
        detail: "LCP 1.9s · CLS 0.04 · INP 84ms.",
      },
    ],
  },
  {
    id: "navigation",
    name: "Site structure",
    code: "NAV",
    weight: 18,
    checks: [
      {
        id: "nav-1",
        label: "Primary navigation",
        status: "pass",
        detail: "Every section reachable in two clicks.",
      },
      {
        id: "nav-2",
        label: "Broken links",
        status: "warn",
        detail: "4 internal links return 404.",
      },
      {
        id: "nav-3",
        label: "Domain age and ownership",
        status: "pass",
        detail: "Registered 2 years 4 months. Public WHOIS.",
      },
    ],
  },
];

/** Hero card sequence — the checks that stream in on load. */
export const heroChecks: Array<{ label: string; status: Status }> = [
  { label: "HTTPS and certificate", status: "pass" },
  { label: "Privacy policy present", status: "pass" },
  { label: "Original content depth", status: "pass" },
  { label: "Contact page missing", status: "fail" },
  { label: "3 thin pages found", status: "warn" },
  { label: "Crawler access open", status: "pass" },
];

export const stats = [
  {
    value: 34,
    suffix: "",
    label: "Checks per scan",
    note: "Mapped to published policy",
  },
  {
    value: 18,
    suffix: "s",
    label: "Median scan time",
    note: "Full crawl of 50 pages",
  },
  {
    value: 71,
    suffix: "%",
    label: "First-try approvals",
    note: "Sites that fixed every blocker",
  },
  {
    value: 12400,
    suffix: "+",
    label: "Sites scanned",
    note: "Since launch",
  },
];
