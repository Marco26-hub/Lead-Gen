"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "done";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
        {label}
        <AnimatePresence>
          {error && (
            <motion.span
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[0.7rem] text-warn"
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-ink outline-none transition-colors duration-300 placeholder:text-faint focus:border-accent/60 focus:bg-surface";

export function ContactForm() {
  const { t, lang } = useI18n();
  const f = t.contact.form;
  const errSend =
    lang === "it"
      ? "Invio non riuscito. Riprova o scrivici via email."
      : "Couldn't send. Try again, or email us directly.";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [reasonIdx, setReasonIdx] = useState(0);
  const [budgetIdx, setBudgetIdx] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendError, setSendError] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = f.errRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = f.errInvalid;
    if (message.trim().length < 10) e.message = f.errDetail;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setSendError(false);
    if (!validate()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          reason: t.contact.reasons[reasonIdx],
          budget: t.contact.budgets[budgetIdx],
          message,
        }),
      });
      const json = await res.json().catch((e) => {
        if (process.env.NODE_ENV !== "production")
          console.warn("[aether] contact: invalid JSON response", e);
        return { ok: false };
      });
      if (!res.ok || !json.ok) throw new Error("send_failed");
      setStatus("done");
    } catch (err) {
      if (process.env.NODE_ENV !== "production")
        console.warn("[aether] contact submit failed", err);
      setStatus("idle");
      setSendError(true);
    }
  };

  return (
    <div className="panel relative overflow-hidden rounded-3xl p-6 md:p-8">
      <AnimatePresence mode="wait">
        {status === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[26rem] flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 16 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-7 w-7"
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </svg>
            </motion.div>
            <h3 className="mt-6 text-2xl font-semibold tracking-tight">
              {f.successTitle}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {f.successHi}, {name.split(" ")[0] || "there"} — {f.successBody}
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                setName("");
                setEmail("");
                setCompany("");
                setMessage("");
              }}
              className="mt-7 text-sm text-accent transition-opacity hover:opacity-70"
            >
              {f.sendAnother}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={f.name} error={errors.name}>
                <input
                  className={inputClass}
                  placeholder={f.namePh}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label={f.email} error={errors.email}>
                <input
                  className={inputClass}
                  placeholder={f.emailPh}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </div>

            <Field label={f.company}>
              <input
                className={inputClass}
                placeholder={f.companyPh}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </Field>

            <div>
              <span className="mb-2 block text-xs font-medium text-muted">
                {f.reason}
              </span>
              <div className="flex flex-wrap gap-2">
                {t.contact.reasons.map((r, i) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReasonIdx(i)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200",
                      reasonIdx === i
                        ? "border-accent/60 bg-accent/10 text-ink"
                        : "border-line text-muted hover:text-ink",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-medium text-muted">
                {f.budget}
              </span>
              <div className="flex flex-wrap gap-2">
                {t.contact.budgets.map((b, i) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudgetIdx(i)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200",
                      budgetIdx === i
                        ? "border-accent/60 bg-accent/10 text-ink"
                        : "border-line text-muted hover:text-ink",
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <Field label={f.project} error={errors.message}>
              <textarea
                className={cn(inputClass, "min-h-[7rem] resize-none")}
                placeholder={f.projectPh}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>

            <div className="flex items-center justify-between gap-4 pt-1">
              <p
                className={cn(
                  "font-mono text-[0.7rem]",
                  sendError ? "text-warn" : "text-faint",
                )}
              >
                {sendError ? errSend : f.avgReply}
              </p>
              <Button
                type="submit"
                size="lg"
                arrow
                disabled={status === "submitting"}
              >
                {status === "submitting" ? f.sending : f.send}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
