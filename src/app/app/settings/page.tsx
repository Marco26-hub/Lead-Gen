import Link from "next/link";
import { getLlmModel, env } from "@maps/core";
import { fetchToolModels } from "@/leadgen/lib/models";
import { ModelSelector } from "@/leadgen/components/ModelSelector";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [models, saved] = await Promise.all([fetchToolModels(), getLlmModel().catch(() => null)]);
  const current = saved ?? env.OPENROUTER_MODEL;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link href="/app" className="text-sm text-zinc-500 hover:text-zinc-300">← Dashboard</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Impostazioni</h1>
      <p className="mt-1 text-zinc-400">Scegli il modello LLM usato per generare i siti demo.</p>

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <ModelSelector models={models} current={current} />
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        Ordine di priorità: <span className="font-mono">--model</span> (CLI) → impostazione qui → variabile{" "}
        <span className="font-mono">OPENROUTER_MODEL</span> → default Sonnet.
      </p>
    </main>
  );
}
