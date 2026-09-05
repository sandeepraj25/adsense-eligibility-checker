"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Field, FormAlert } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { validateName } from "@/lib/validate";

/** Name change. The email is shown but not editable — see the note below. */
export function ProfileForm({
  name: initialName,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const { success, error: errorToast } = useToast();

  const [name, setName] = useState(initialName);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const dirty = name.trim() !== initialName.trim();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    const problem = validateName(name);
    if (problem) {
      setFieldError(problem);
      return;
    }

    setBusy(true);
    setFieldError(undefined);
    setFormError(undefined);

    try {
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const failure = data as
          | { message?: string; fields?: Record<string, string> }
          | null;
        if (failure?.fields?.name) setFieldError(failure.fields.name);
        else setFormError(failure?.message ?? "That change did not save.");
        setBusy(false);
        return;
      }

      success("Name updated");
      setBusy(false);
      router.refresh();
    } catch {
      setFormError("We could not reach the server. Nothing was changed.");
      errorToast("Network error");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <Field
        label="Full name"
        name="name"
        autoComplete="name"
        value={name}
        error={fieldError}
        onChange={(event) => {
          setName(event.target.value);
          if (fieldError) setFieldError(undefined);
        }}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        mono
        value={email}
        readOnly
        disabled
        hint="Your email is your login and is used on invoices. It cannot be changed here."
      />

      <div>
        <Button type="submit" size="md" disabled={busy || !dirty} aria-busy={busy}>
          {busy ? (
            <>
              <Spinner />
              Saving
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}
