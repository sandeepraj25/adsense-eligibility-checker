"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Field, FormAlert } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import type { ApiErrorCode } from "@/lib/http";
import { validateEmail } from "@/lib/validate";

type Failure = {
  ok: false;
  code: ApiErrorCode;
  message: string;
  fields?: Record<string, string>;
};

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    // Client-side checks are a convenience only — the route re-validates.
    const emailError = validateEmail(email);
    const errors: Record<string, string> = {};
    if (emailError) errors.email = emailError;
    if (!password) errors.password = "Enter your password";

    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) return;

    setBusy(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { ok: true } | Failure;

      if (!data.ok) {
        if (data.fields) setFieldErrors(data.fields);
        setFormError(data.message);
        setBusy(false);
        return;
      }

      // Leave `busy` on: the session cookie is set, so navigate rather
      // than returning the form to an editable state.
      router.replace(next);
      router.refresh();
    } catch {
      setFormError(
        "We could not reach the server. Check your connection and try again.",
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        spellCheck={false}
        value={email}
        error={fieldErrors.email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldErrors.email) {
            setFieldErrors((f) => ({ ...f, email: "" }));
          }
        }}
        placeholder="you@yourdomain.com"
        required
      />

      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        revealable
        value={password}
        error={fieldErrors.password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (fieldErrors.password) {
            setFieldErrors((f) => ({ ...f, password: "" }));
          }
        }}
        placeholder="Your password"
        required
      />

      <Button
        type="submit"
        size="lg"
        disabled={busy}
        aria-busy={busy}
        className="mt-2"
      >
        {busy ? (
          <>
            <Spinner />
            Signing in
          </>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  );
}