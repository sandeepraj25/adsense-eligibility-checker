import type { Metadata } from "next";
import {
  Database,
  LockKeyhole,
  MonitorSmartphone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { PasswordForm } from "@/components/account/PasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SessionsPanel } from "@/components/account/SessionsPanel";
import { DataRow, PageHeading } from "@/components/dashboard/PageHeading";
import { ButtonLink } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth/guard";
import { countSessions } from "@/lib/db/accounts";
import { countReports, countWebsites } from "@/lib/db/audits";
import { getLatestSubscription } from "@/lib/db/billing";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Settings — Verdict",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser("/dashboard/settings");

  const sessions = countSessions(user.id);
  const reports = countReports(user.id);
  const websites = countWebsites(user.id);
  const subscription = getLatestSubscription(user.id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Settings"
        title="Your account"
        lede="Manage your profile, account security, active sessions, and account information."
      />

      {/* ── Main settings grid ── */}
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        {/* ── Large profile card ── */}
        <section className="glass edge-light relative overflow-hidden rounded-2xl border border-iris-400/30 p-6 sm:p-7">
          <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-iris-500/[0.10] blur-3xl" />

          <div className="relative">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="t-eyebrow text-iris-300">Profile</p>

                <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.03em] text-white sm:text-[2rem]">
                  {user.name}
                </h2>

                <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-cloud-400">
                  Update the personal information shown throughout your Verdict
                  account and invoices.
                </p>
              </div>

              <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-iris-400/35 bg-iris-500/[0.10] text-iris-300 shadow-[0_0_35px_rgba(139,92,246,0.12)]">
                <UserRound className="size-6" />
              </div>
            </div>

            <div className="mt-7 border-t border-white/[0.08] pt-6">
              <ProfileForm name={user.name} email={user.email} />
            </div>
          </div>
        </section>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-6">
          {/* Sessions */}
          <section className="glass edge-light relative overflow-hidden rounded-2xl p-6">
            <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-azure-500/[0.08] blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="t-eyebrow text-azure-300">Sessions</p>

                  <h2 className="mt-2 text-[1.25rem] font-semibold text-white">
                    Active devices
                  </h2>
                </div>

                <div className="grid size-11 place-items-center rounded-xl border border-azure-400/30 bg-azure-500/[0.08] text-azure-300">
                  <MonitorSmartphone className="size-5" />
                </div>
              </div>

              <div className="mt-5 border-t border-white/[0.07] pt-5">
                <SessionsPanel count={sessions} />
              </div>
            </div>
          </section>

          {/* Account overview */}
          <section className="glass edge-light relative overflow-hidden rounded-2xl p-6">
            <div className="pointer-events-none absolute -right-12 -bottom-12 size-44 rounded-full bg-mint-500/[0.06] blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="t-eyebrow text-mint-300">Account</p>

                  <h2 className="mt-2 text-[1.25rem] font-semibold text-white">
                    Account overview
                  </h2>
                </div>

                <div className="grid size-11 place-items-center rounded-xl border border-mint-400/30 bg-mint-500/[0.08] text-mint-300">
                  <ShieldCheck className="size-5" />
                </div>
              </div>

              <dl className="mt-5 border-y border-white/[0.07]">
                <DataRow label="Member since">
                  {formatDate(user.createdAt)}
                </DataRow>

                <DataRow label="Current plan">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-mint-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                    {subscription?.planName ?? "Free"}
                  </span>
                </DataRow>

                <DataRow label="Scans run">{reports}</DataRow>

                <DataRow label="Websites">{websites}</DataRow>

                <DataRow label="Account ID" mono>
                  {user.id}
                </DataRow>
              </dl>

              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink
                  href="/dashboard/billing"
                  variant="ghost"
                  size="sm"
                >
                  Billing &amp; invoices
                </ButtonLink>

                <ButtonLink
                  href="/dashboard/reports"
                  variant="quiet"
                  size="sm"
                >
                  Your reports
                </ButtonLink>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── Password card ── */}
      <section className="glass edge-light relative overflow-hidden rounded-2xl p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-24 top-0 size-72 rounded-full bg-iris-500/[0.07] blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[0.65fr_1.35fr] xl:items-start">
          <div>
            <div className="grid size-12 place-items-center rounded-2xl border border-rose-400/25 bg-rose-500/[0.06] text-rose-300">
              <LockKeyhole className="size-5" />
            </div>

            <p className="t-eyebrow mt-5 text-rose-300">Security</p>

            <h2 className="mt-2 text-[1.6rem] font-semibold tracking-[-0.02em] text-white">
              Password
            </h2>

            <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-cloud-400">
              Changing your password protects your account and signs out every
              other device.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-black/[0.12] p-5 sm:p-6">
            <PasswordForm />
          </div>
        </div>
      </section>

      {/* ── Data card ── */}
      <section className="glass edge-light relative overflow-hidden rounded-2xl p-6 sm:p-7">
        <div className="pointer-events-none absolute -left-16 -bottom-16 size-56 rounded-full bg-azure-500/[0.06] blur-3xl" />

        <div className="relative grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="grid size-12 place-items-center rounded-2xl border border-azure-400/30 bg-azure-500/[0.08] text-azure-300">
            <Database className="size-5" />
          </div>

          <div>
            <p className="t-eyebrow text-azure-300">Privacy</p>

            <h2 className="mt-2 text-[1.35rem] font-semibold text-white">
              Your data
            </h2>

            <div className="mt-4 max-w-3xl space-y-3">
              <p className="text-[0.9375rem] leading-relaxed text-cloud-200">
                Verdict stores your name, email, a one-way hash of your password,
                the domains you have scanned and the reports produced from them.
                Payment card and UPI details are handled by Razorpay and are never
                sent to this application.
              </p>

              <p className="text-[0.875rem] leading-relaxed text-cloud-400">
                To delete your account and everything attached to it, email the
                address on the invoice. Deleting a single report is immediate —
                the delete button on any report removes it permanently.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}