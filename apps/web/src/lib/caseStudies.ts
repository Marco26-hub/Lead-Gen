import { dictionaries, LANGS, type Lang } from "@/lib/i18n";

/* Long-form case-study content, keyed by project slug + language.
   These are illustrative examples representative of our work. */

export type CaseStudy = {
  challenge: string;
  approach: string;
  outcome: string;
  stack: string[];
};

export type CaseLabels = {
  back: string;
  overview: string;
  challenge: string;
  approach: string;
  outcome: string;
  stack: string;
  next: string;
  category: string;
  year: string;
  impact: string;
  illustrative: string;
};

export const caseLabels: Record<Lang, CaseLabels> = {
  en: {
    back: "All work",
    overview: "Overview",
    challenge: "The challenge",
    approach: "Our approach",
    outcome: "The outcome",
    stack: "Stack",
    next: "Next project",
    category: "Category",
    year: "Year",
    impact: "Impact",
    illustrative: "Illustrative example",
  },
  it: {
    back: "Tutti i lavori",
    overview: "Panoramica",
    challenge: "La sfida",
    approach: "Il nostro approccio",
    outcome: "Il risultato",
    stack: "Stack",
    next: "Prossimo progetto",
    category: "Categoria",
    year: "Anno",
    impact: "Impatto",
    illustrative: "Esempio illustrativo",
  },
};

export const caseStudies: Record<Lang, Record<string, CaseStudy>> = {
  en: {
    "aurora-commerce": {
      challenge:
        "Aurora's small team couldn't keep product pages, recommendations and support running at the pace the store needed — content and replies were always behind.",
      approach:
        "We built an AI-automated storefront: on-brand product copy generated automatically, AI recommendations, and an automated support assistant — with a human approval step where it matters.",
      outcome:
        "Conversion rose 34% and the catalogue stays fresh without a dedicated content team.",
      stack: ["AI content", "Recommendations", "Support assistant", "Next.js", "Headless commerce"],
    },
    "pulse-social": {
      challenge:
        "Pulse posted in bursts, then went quiet for weeks — and juggled five different tools to do it.",
      approach:
        "We automated content drafting and scheduling across channels and built the whole workflow into a dashboard inside their own site — one place to plan, approve and publish.",
      outcome:
        "A consistent, always-on presence, with about 8 hours a week saved and nothing managed outside their own admin.",
      stack: ["Social automation", "Scheduling", "Custom admin", "Content AI"],
    },
    "meridian-leadgen": {
      challenge:
        "Meridian's sales team spent more time hunting for prospects than talking to them — and the list was cold.",
      approach:
        "We built a lead-research engine that sources, enriches and qualifies prospects against their ideal profile, then drops a warm, prioritized list into the team's inbox daily.",
      outcome:
        "3.2× more qualified leads, and sales conversations that start warm instead of cold.",
      stack: ["Lead research", "Enrichment", "Qualification agents", "CRM sync"],
    },
    "atlas-agents": {
      challenge:
        "A lean operations team at Atlas was buried in quotes, data entry and follow-ups — the work scaled with revenue, the headcount couldn't.",
      approach:
        "We deployed coordinated AI agents that handle quoting, data entry and follow-ups end-to-end, escalating to a human only on exceptions.",
      outcome:
        "Manual work dropped about 60%, and the team took on more volume without new hires.",
      stack: ["Multi-agent system", "Tool use", "Workflow automation", "Guardrails"],
    },
    "lumen-redesign": {
      challenge:
        "Lumen's site looked dated and loaded slowly — and neither Google nor AI assistants surfaced it.",
      approach:
        "We rebuilt it on a fast, modern stack with SEO and GEO baked in: clean structure, schema.org data and an llms.txt so search engines and AI assistants both understand it.",
      outcome:
        "Organic traffic roughly doubled and the brand finally looks the part.",
      stack: ["Next.js", "Redesign", "SEO", "GEO", "Core Web Vitals"],
    },
  },
  it: {
    "aurora-commerce": {
      challenge:
        "Il piccolo team di Aurora non riusciva a tenere il passo con schede prodotto, raccomandazioni e supporto — contenuti e risposte erano sempre indietro.",
      approach:
        "Abbiamo costruito uno storefront automatizzato con AI: copy prodotto on-brand generato in automatico, raccomandazioni AI e un assistente di supporto automatico — con un passaggio di approvazione umano dove conta.",
      outcome:
        "La conversione è salita del 34% e il catalogo resta aggiornato senza un team di contenuti dedicato.",
      stack: ["Contenuti AI", "Raccomandazioni", "Assistente supporto", "Next.js", "Commerce headless"],
    },
    "pulse-social": {
      challenge:
        "Pulse pubblicava a raffiche, poi spariva per settimane — e per farlo destreggiava cinque strumenti diversi.",
      approach:
        "Abbiamo automatizzato stesura e programmazione dei contenuti su tutti i canali e costruito l'intero flusso in una dashboard dentro il loro sito — un solo posto per pianificare, approvare e pubblicare.",
      outcome:
        "Una presenza costante e sempre attiva, con circa 8 ore a settimana risparmiate e nulla gestito fuori dalla loro admin.",
      stack: ["Automazione social", "Programmazione", "Admin su misura", "Contenuti AI"],
    },
    "meridian-leadgen": {
      challenge:
        "Il team vendite di Meridian passava più tempo a cercare contatti che a parlarci — e la lista era fredda.",
      approach:
        "Abbiamo costruito un motore di ricerca lead che trova, arricchisce e qualifica i contatti rispetto al profilo ideale, e ogni giorno consegna una lista calda e prioritizzata nella inbox del team.",
      outcome:
        "3,2× lead qualificati in più, e conversazioni di vendita che partono calde invece che fredde.",
      stack: ["Ricerca lead", "Arricchimento", "Agenti di qualifica", "Sync CRM"],
    },
    "atlas-agents": {
      challenge:
        "Il team operativo snello di Atlas era sommerso da preventivi, inserimento dati e follow-up — il lavoro cresceva con i ricavi, le persone no.",
      approach:
        "Abbiamo messo in campo agenti AI coordinati che gestiscono preventivi, inserimento dati e follow-up end-to-end, passando a un umano solo sulle eccezioni.",
      outcome:
        "Il lavoro manuale è calato di circa il 60% e il team ha gestito più volume senza nuove assunzioni.",
      stack: ["Sistema multi-agente", "Tool use", "Automazione flussi", "Guardrail"],
    },
    "lumen-redesign": {
      challenge:
        "Il sito di Lumen sembrava datato e caricava lentamente — e né Google né gli assistenti AI lo facevano emergere.",
      approach:
        "Lo abbiamo ricostruito su uno stack moderno e veloce con SEO e GEO integrate: struttura pulita, dati schema.org e un llms.txt perché motori di ricerca e assistenti AI lo capiscano entrambi.",
      outcome:
        "Il traffico organico è circa raddoppiato e il brand è finalmente all'altezza.",
      stack: ["Next.js", "Redesign", "SEO", "GEO", "Core Web Vitals"],
    },
  },
};

// Dev-only integrity check: every work slug must have a case-study entry (and
// vice versa) in each language. Surfaces data desync loudly instead of a
// silently blank page.
if (process.env.NODE_ENV !== "production") {
  for (const lang of LANGS) {
    const slugs = new Set(dictionaries[lang].work.items.map((p) => p.slug));
    const keys = new Set(Object.keys(caseStudies[lang]));
    for (const s of slugs)
      if (!keys.has(s))
        console.warn(
          `[aether] caseStudies[${lang}] is missing an entry for work slug "${s}"`,
        );
    for (const k of keys)
      if (!slugs.has(k))
        console.warn(
          `[aether] caseStudies[${lang}] has an orphan entry "${k}" with no matching work item`,
        );
  }
}
