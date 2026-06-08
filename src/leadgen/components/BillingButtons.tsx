"use client";

import { useState } from "react";

/**
 * Bottoni billing per il CRM lead detail:
 *  - "Link Checkout" → genera URL /api/billing/checkout?... e lo copia in clipboard
 *    (l'operatore lo manda al cliente in chat al closing della call).
 *  - "Portal cliente" → apre direttamente il Customer Portal Stripe del lead
 *    (per gestire la sua sub: cancel, fattura, carta).
 */
const PACKAGES = [
  { id: "ristorante-growth", label: "Ristorante Growth €399/m" },
  { id: "ristorante-starter", label: "Ristorante Starter €99/m" },
  { id: "ristorante-premium", label: "Ristorante Premium €799/m" },
  { id: "salone-growth", label: "Salone Growth €349/m" },
  { id: "salone-starter", label: "Salone Starter €89/m" },
  { id: "salone-premium", label: "Salone Premium €699/m" },
  { id: "idraulico-growth", label: "Idraulico Growth €299/m" },
  { id: "idraulico-starter", label: "Idraulico Starter €79/m" },
  { id: "idraulico-premium", label: "Idraulico Premium €549/m" },
  { id: "sito-premium", label: "Sito Premium €99/m" },
  { id: "sito-smart", label: "Sito Smart €59/m" },
  { id: "solo-sito", label: "Solo Sito €29.90/m" },
];

export function BillingButtons({
  leadId,
  defaultPackage = "ristorante-growth",
  hasCustomer,
}: {
  leadId: string;
  defaultPackage?: string;
  /** True se il lead ha già una subscriptions row con stripe_customer_id (cioè ha checkout-ato almeno una volta). */
  hasCustomer: boolean;
}) {
  const [pkg, setPkg] = useState(defaultPackage);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [copied, setCopied] = useState(false);

  const checkoutUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/billing/checkout?lead_id=${leadId}&package_id=${pkg}&billing=${billing}`
      : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: open in new tab
      window.open(checkoutUrl, "_blank");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={pkg}
        onChange={(e) => setPkg(e.target.value)}
        className="h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-sm text-zinc-100"
      >
        {PACKAGES.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
      <select
        value={billing}
        onChange={(e) => setBilling(e.target.value as "monthly" | "annual")}
        className="h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-sm text-zinc-100"
      >
        <option value="monthly">Mensile</option>
        <option value="annual">Annuale (-20%)</option>
      </select>
      <button
        onClick={copyLink}
        className="inline-flex h-10 items-center rounded-lg bg-indigo-500/15 px-4 font-medium text-indigo-200 ring-1 ring-indigo-500/30 hover:bg-indigo-500/25"
      >
        {copied ? "✓ Copiato!" : "🔗 Copia link checkout"}
      </button>
      {hasCustomer && (
        <a
          href={`/api/billing/portal?lead_id=${leadId}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center rounded-lg border border-zinc-700 px-4 text-sm text-zinc-200 hover:bg-zinc-800"
        >
          ⚙ Portal cliente
        </a>
      )}
    </div>
  );
}
