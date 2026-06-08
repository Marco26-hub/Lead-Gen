/* ============================================================
   i18n — full EN/IT dictionary (UI strings + localized content).
   The English object is the source of truth for the type; the
   Italian object must match its shape.
   ============================================================ */

export type Lang = "en" | "it";
export const LANGS: Lang[] = ["en", "it"];
export const LANG_LABEL: Record<Lang, string> = { en: "EN", it: "IT" };

export type Theme = "dark" | "light";

const en = {
  brand: {
    tagline: "Put AI to work across your business.",
    description:
      "Aether is an AI studio for ambitious businesses. We build automations and multi-agent systems, a 24/7 AI receptionist that answers calls and books appointments, high-converting websites and e-commerce, and growth — SEO, GEO, lead generation and social automation.",
    location: "Milan · New York · Remote",
  },
  nav: {
    items: [
      { href: "/work", label: "Work" },
      { href: "/services", label: "Services" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    cta: "Start a project",
  },
  hero: {
    badge: "AI studio · Automation · Web · Growth",
    line1: "We put AI",
    line2serif: "to work",
    line2rest: "for your business.",
    sub: "puts AI to work across your business — automations and multi-agent systems, a 24/7 AI receptionist that answers every call and books appointments, websites and e-commerce, and growth that compounds.",
    ctaPrimary: "Start a project",
    ctaSecondary: "Explore services",
    scroll: "Scroll",
  },
  clients: { label: "Trusted by teams who'd rather automate it" },
  manifesto: {
    eyebrow: "Our thesis",
    lines: [
      "Most businesses don't need more tools.",
      "They need the repetitive work to stop.",
      "So we automate it — calls answered, appointments booked, follow-ups sent —",
      "while you do the work that matters.",
    ],
  },
  chaos: {
    eyebrow: "Scroll-scrubbed sequence",
    caption:
      "You control the motion. Scroll maps directly to the frame index — chaos resolves into order, one frame at a time.",
    live: "LIVE · 15 FPS",
    frame: "FRAME",
    entropy: "[ entropy ]",
    resolved: "[ resolved ]",
    headingA: "From chaos,",
    headingB: "structure.",
    note: "Every system we ship makes the same move: noise in, intentional order out.",
  },
  pillars: {
    eyebrow: "What we do",
    titleA: "Five pillars,",
    titleB: "one growth engine.",
    core: "core",
    items: [
      {
        id: "automation",
        index: 1,
        title: "AI Automation & Agents",
        summary:
          "We hand the repetitive work to AI — agents and automations that run your operations while you sleep.",
        detail:
          "From multi-agent systems that reason, use your tools and act, to bespoke automations, we remove the manual work that slows your business down — observable, reliable and under control.",
        services: [
          {
            id: "automations",
            title: "Custom AI automations",
            outcome: "Hours back every week",
            blurb:
              "We automate the repetitive workflows draining your team — data, documents, operations, follow-ups.",
          },
          {
            id: "multiagent",
            title: "Multi-agent systems",
            outcome: "Work that runs itself",
            blurb:
              "Coordinated AI agents that reason, use your tools and complete real tasks end-to-end.",
          },
          {
            id: "apps",
            title: "Automation apps for SMBs",
            outcome: "Your own AI tool",
            blurb:
              "Lightweight internal apps that put automation in your team's hands, built for small businesses.",
          },
        ],
      },
      {
        id: "voice",
        index: 2,
        title: "AI Voice & Reception",
        summary:
          "A 24/7 AI receptionist that answers every call, qualifies the caller and books appointments — so you never miss business.",
        detail:
          "Your phone, answered around the clock in a natural voice. The agent understands the request, qualifies the caller, books appointments straight into your calendar and hands off to a human when it should — no more missed calls, no more voicemail tag.",
        services: [
          {
            id: "call-answering",
            title: "24/7 call answering",
            outcome: "Never miss a call",
            blurb:
              "A natural-voice agent answers every call, day and night, weekends included.",
          },
          {
            id: "appointment-booking",
            title: "Appointment booking",
            outcome: "Calendar, filled",
            blurb:
              "It books appointments straight into your calendar and confirms with the caller.",
          },
          {
            id: "qualification",
            title: "Qualification & hand-off",
            outcome: "Right call, right person",
            blurb:
              "It qualifies each caller and routes or escalates to a human when it matters.",
          },
        ],
      },
      {
        id: "web",
        index: 3,
        title: "Websites & E-commerce",
        summary:
          "Sites that look premium and sell — from a sharp landing page to an AI-automated store.",
        detail:
          "We design and build fast, conversion-focused websites: landing pages, full e-commerce, and AI-automated sites where content, support and merchandising run themselves.",
        services: [
          {
            id: "sites",
            title: "Websites & e-commerce",
            outcome: "From landing to store",
            blurb:
              "Landing pages, marketing sites and e-commerce — fast, premium, built to convert.",
          },
          {
            id: "ai-sites",
            title: "AI-automated sites",
            outcome: "A site that runs itself",
            blurb:
              "Content, chat, support and merchandising powered by AI — your site works while you sleep.",
          },
          {
            id: "redesign",
            title: "Redesign",
            outcome: "A second first impression",
            blurb:
              "We rebuild dated sites into fast, modern, on-brand experiences that perform.",
          },
        ],
      },
      {
        id: "social",
        index: 4,
        title: "Social, automated",
        summary:
          "Show up consistently on social — and run it all from your own site's admin.",
        detail:
          "We automate content, scheduling and replies, and give you a dashboard inside your own site to manage every channel — no scattered tools, no missed weeks.",
        services: [
          {
            id: "social-automation",
            title: "Social automation",
            outcome: "Always-on presence",
            blurb:
              "Automated content, scheduling and engagement that keep your brand consistently visible.",
          },
          {
            id: "social-admin",
            title: "Manage social from your site",
            outcome: "One admin, every channel",
            blurb:
              "A dashboard built into your own site to plan, publish and monitor all your social — in one place.",
          },
        ],
      },
      {
        id: "growth",
        index: 5,
        title: "Visibility & Growth",
        summary:
          "Get found — by Google and by AI — and turn attention into qualified leads.",
        detail:
          "SEO and GEO so you're cited by search engines and AI assistants alike, plus lead research that fills your pipeline with the right prospects.",
        services: [
          {
            id: "seo-geo",
            title: "SEO & GEO",
            outcome: "Found by Google and AI",
            blurb:
              "Classic SEO plus Generative Engine Optimization — structured so ChatGPT, Perplexity and Google cite you.",
          },
          {
            id: "leadgen",
            title: "Lead research",
            outcome: "A fuller pipeline",
            blurb:
              "We find and qualify the right prospects, so your sales starts from a warm list — not a cold one.",
          },
        ],
      },
    ],
  },
  work: {
    eyebrow: "Selected work",
    heading: "Proof, not promises.",
    note: "Illustrative examples of what we build — scroll sideways to move through them.",
    viewAll: "View all work",
    headerEyebrow: "Selected work",
    headerTitle: "What we build, in practice.",
    headerDesc:
      "Illustrative examples across automation, web, social and growth — representative of the work we do.",
    meta: ["Automation · Web · Growth", "SMB & enterprise", "2024 — present"],
    items: [
      {
        slug: "aurora-commerce",
        client: "Aurora",
        title: "An e-commerce that merchandises itself",
        category: "AI E-commerce",
        year: "2025",
        blurb:
          "An AI-automated store: product copy, recommendations and support that run without a dedicated content team.",
        metric: "+34%",
        metricLabel: "conversion rate",
        accent: "from-[#3fdcff] to-[#5b8cff]",
      },
      {
        slug: "pulse-social",
        client: "Pulse",
        title: "Social on autopilot, on brand",
        category: "Social Automation",
        year: "2025",
        blurb:
          "Automated content and scheduling across channels, managed from the client's own site admin.",
        metric: "8 hrs/wk",
        metricLabel: "saved on social",
        accent: "from-[#5b8cff] to-[#8b6cff]",
      },
      {
        slug: "meridian-leadgen",
        client: "Meridian",
        title: "A pipeline that fills itself",
        category: "Lead Generation",
        year: "2025",
        blurb:
          "A lead-research engine that finds, enriches and qualifies prospects straight into the sales team's inbox.",
        metric: "3.2×",
        metricLabel: "qualified leads",
        accent: "from-[#4fe3b0] to-[#3fdcff]",
      },
      {
        slug: "atlas-agents",
        client: "Atlas",
        title: "Multi-agent ops for a lean team",
        category: "Multi-agent Automation",
        year: "2024",
        blurb:
          "Coordinated agents handling quotes, data entry and follow-ups end-to-end for a small operations team.",
        metric: "−60%",
        metricLabel: "manual work",
        accent: "from-[#8b6cff] to-[#5b8cff]",
      },
      {
        slug: "lumen-redesign",
        client: "Lumen",
        title: "A redesign that paid for itself",
        category: "Website Redesign",
        year: "2024",
        blurb:
          "A dated site rebuilt into a fast, modern, SEO/GEO-ready experience — visibility and conversions up.",
        metric: "2.1×",
        metricLabel: "organic traffic",
        accent: "from-[#3fdcff] to-[#4fe3b0]",
      },
    ],
  },
  particle: {
    eyebrow: "Live WebGL · interactive depth",
    headingA: "Craft you can",
    headingB: "feel.",
    copy: "Thousands of points, rendered in real time. Move your cursor — the field parts around it. The same care goes into everything we ship.",
    hint: "↖ move your cursor",
  },
  process: {
    eyebrow: "How we work",
    titleA: "A method,",
    titleB: "not a gamble.",
    intro:
      "Four phases that turn an idea into a dependable system — and leave your team faster than we found it.",
    steps: [
      {
        phase: "01",
        title: "Immersion",
        body: "We map your workflows, data and goals before proposing anything. We find the work worth automating first.",
      },
      {
        phase: "02",
        title: "Prototype",
        body: "A working prototype in days — not slides. You see the automation, site or agent doing the real job early.",
      },
      {
        phase: "03",
        title: "Ship",
        body: "We productionize it: reliable, observable, on brand, and connected to the rest of your stack.",
      },
      {
        phase: "04",
        title: "Compound",
        body: "We tune and extend, so the time saved — and the growth — keeps compounding after launch.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Word of mouth",
    headingA: "The teams we build with",
    headingB: "keep us close.",
    items: [
      {
        quote:
          "Aether automated the work that used to eat our evenings. The store basically runs itself now.",
        name: "Elena Conti",
        role: "Founder, Aurora",
      },
      {
        quote:
          "Our social went from sporadic to always-on — and we manage it all from our own dashboard.",
        name: "David Hsu",
        role: "Marketing Lead, Pulse",
      },
      {
        quote:
          "The lead engine fills our pipeline with the right people. Sales finally starts warm.",
        name: "Priya Shah",
        role: "Head of Growth, Meridian",
      },
    ],
  },
  stats: [
    { value: "10+ hrs", label: "saved per week, per automated workflow" },
    { value: "+34%", label: "median conversion lift on sites we rebuild" },
    { value: "3.2×", label: "more qualified leads from automated research" },
    { value: "24/7", label: "AI reception — every call answered, every appointment booked" },
  ],
  faq: {
    eyebrow: "FAQ",
    titleA: "Questions,",
    titleB: "answered.",
    items: [
      {
        q: "What does Aether actually do?",
        a: "We build AI automations and multi-agent systems, a 24/7 AI receptionist that answers calls and books appointments, websites and e-commerce, and growth — SEO, GEO, lead generation and social automation — for small businesses and enterprise teams.",
      },
      {
        q: "Can AI really answer our phone and book appointments?",
        a: "Yes. Our 24/7 AI receptionist answers every call in a natural voice, understands the request, qualifies the caller and books the appointment directly into your calendar — handing off to a human when it should. You stop losing customers to missed calls.",
      },
      {
        q: "Do you work with small businesses?",
        a: "Yes. A lot of our work is automation apps and AI-automated sites sized for small teams, with pricing and scope to match.",
      },
      {
        q: "What is GEO (Generative Engine Optimization)?",
        a: "GEO optimizes your site so AI assistants like ChatGPT, Perplexity and Google's AI overviews cite it. We structure content, add schema.org data and publish an llms.txt so the machines can quote you accurately.",
      },
      {
        q: "Can you manage our social from our own site?",
        a: "Yes — we build a dashboard into your own site to plan, publish and monitor every channel, on top of automated content and scheduling.",
      },
      {
        q: "How fast can we start?",
        a: "A focused project typically kicks off within a week or two; smaller automations can ship in days.",
      },
      {
        q: "Do you only build with AI?",
        a: "No. We use AI where it earns its place and classic engineering everywhere else — the goal is a reliable result, not a demo.",
      },
    ],
  },
  footer: {
    eyebrow: "Let's build",
    headingA: "Ready to let AI",
    headingB: "do the work?",
    cta: "Start a project",
    sitemap: "Sitemap",
    social: "Social",
    contact: "Contact",
    rights: "AI automation, web & growth studio.",
  },
  services: {
    headerEyebrow: "Services",
    headerTitle: "Automation, web and growth — under one roof.",
    headerDesc:
      "Five pillars, one growth engine. Take a single service or run them together — for small businesses and enterprise teams alike.",
  },
  about: {
    headerEyebrow: "About",
    headerTitle: "A small studio that ships.",
    headerDesc:
      "No layers, no hand-offs to juniors. The people who scope your problem are the people who build the system.",
    principlesEyebrow: "Principles",
    principlesTitle: "What we hold to.",
    peopleEyebrow: "The people",
    peopleTitle: "Small, senior, accountable.",
    values: [
      {
        title: "Outcomes over output",
        body: "We're paid to move a metric — time saved, leads, revenue — not to ship slides.",
      },
      {
        title: "Taste is a feature",
        body: "Craft compounds. The way it feels is part of whether it works.",
      },
      {
        title: "Automate the boring",
        body: "If a human is doing it twice, it probably shouldn't be a human doing it.",
      },
      {
        title: "Build to compound",
        body: "We leave teams faster than we found them. The advantage outlives the project.",
      },
    ],
    team: [
      { name: "Sofia Lindqvist", role: "Founder · Automation", initials: "SL" },
      { name: "Marco Devlin", role: "Design Engineering", initials: "MD" },
      { name: "Aria Chen", role: "Web & E-commerce", initials: "AC" },
      { name: "Tobias Renn", role: "Growth & SEO/GEO", initials: "TR" },
    ],
  },
  contact: {
    headerEyebrow: "Contact",
    headerTitle: "Let's build something that works.",
    headerDesc:
      "Tell us about the problem. The more specific, the better — we reply to every serious note.",
    email: "Email",
    studios: "Studios",
    nextLabel: "What happens next",
    next: [
      "We read your note and reply within two working days.",
      "A 30-minute call to pressure-test the problem together.",
      "A short, fixed-scope proposal — no fluff, no retainer trap.",
    ],
    form: {
      name: "Name",
      email: "Email",
      company: "Company",
      reason: "Reason",
      budget: "Budget",
      project: "Project",
      namePh: "Ada Lovelace",
      emailPh: "you@company.com",
      companyPh: "Where you work",
      projectPh: "What are you trying to build or automate?",
      send: "Send message",
      sending: "Sending…",
      avgReply: "Avg. reply · 48h",
      successTitle: "Message received.",
      successBody: "we read every note and reply within two working days.",
      successHi: "Thanks",
      sendAnother: "Send another →",
      errRequired: "required",
      errInvalid: "invalid",
      errDetail: "add detail",
    },
    reasons: [
      "AI automation",
      "Website / e-commerce",
      "Social",
      "SEO / GEO / leads",
      "Just exploring",
    ],
    budgets: ["< $5k", "$5k–$25k", "$25k–$100k", "$100k+"],
  },
  ui: {
    themeToLight: "Switch to light",
    themeToDark: "Switch to dark",
    language: "Language",
  },
};

const it: typeof en = {
  brand: {
    tagline: "Metti l'AI al lavoro in tutta l'azienda.",
    description:
      "Aether è uno studio AI per aziende ambiziose. Costruiamo automazioni e sistemi multi-agente, una segretaria AI 24/7 che risponde alle chiamate e fissa gli appuntamenti, siti ed e-commerce ad alta conversione e crescita — SEO, GEO, lead generation e automazione social.",
    location: "Milano · New York · Da remoto",
  },
  nav: {
    items: [
      { href: "/work", label: "Lavori" },
      { href: "/services", label: "Servizi" },
      { href: "/about", label: "Studio" },
      { href: "/contact", label: "Contatti" },
    ],
    cta: "Inizia un progetto",
  },
  hero: {
    badge: "Studio AI · Automazione · Web · Crescita",
    line1: "Mettiamo l'AI",
    line2serif: "al lavoro",
    line2rest: "per la tua azienda.",
    sub: "mette l'AI al lavoro in tutta la tua azienda — automazioni e sistemi multi-agente, una segretaria AI 24/7 che risponde a ogni chiamata e fissa gli appuntamenti, siti ed e-commerce, e una crescita che si accumula.",
    ctaPrimary: "Inizia un progetto",
    ctaSecondary: "Esplora i servizi",
    scroll: "Scorri",
  },
  clients: { label: "Scelti da team che preferiscono automatizzare" },
  manifesto: {
    eyebrow: "La nostra tesi",
    lines: [
      "Alla maggior parte delle aziende non servono altri strumenti.",
      "Serve che il lavoro ripetitivo, semplicemente, smetta.",
      "Così lo automatizziamo — chiamate risposte, appuntamenti fissati, follow-up inviati —",
      "mentre tu fai il lavoro che conta.",
    ],
  },
  chaos: {
    eyebrow: "Sequenza guidata dallo scroll",
    caption:
      "Il movimento lo controlli tu. Lo scroll è mappato direttamente sull'indice del frame — il caos si risolve in ordine, un frame alla volta.",
    live: "LIVE · 15 FPS",
    frame: "FRAME",
    entropy: "[ entropia ]",
    resolved: "[ risolto ]",
    headingA: "Dal caos,",
    headingB: "struttura.",
    note: "Ogni sistema che rilasciamo fa lo stesso movimento: rumore in ingresso, ordine intenzionale in uscita.",
  },
  pillars: {
    eyebrow: "Cosa facciamo",
    titleA: "Cinque pilastri,",
    titleB: "un solo motore di crescita.",
    core: "core",
    items: [
      {
        id: "automation",
        index: 1,
        title: "Automazioni AI & Agenti",
        summary:
          "Affidiamo il lavoro ripetitivo all'AI — agenti e automazioni che mandano avanti le operazioni mentre dormi.",
        detail:
          "Dai sistemi multi-agente che ragionano, usano i tuoi strumenti e agiscono, fino alle automazioni su misura, togliamo il lavoro manuale che rallenta l'azienda — osservabile, affidabile e sotto controllo.",
        services: [
          {
            id: "automations",
            title: "Automazioni AI su misura",
            outcome: "Ore libere ogni settimana",
            blurb:
              "Automatizziamo i flussi ripetitivi che prosciugano il team — dati, documenti, operatività, follow-up.",
          },
          {
            id: "multiagent",
            title: "Sistemi multi-agente",
            outcome: "Lavoro che si fa da solo",
            blurb:
              "Agenti AI coordinati che ragionano, usano i tuoi strumenti e completano attività reali end-to-end.",
          },
          {
            id: "apps",
            title: "App di automazione per PMI",
            outcome: "Il tuo strumento AI",
            blurb:
              "App interne leggere che mettono l'automazione nelle mani del team, pensate per le piccole imprese.",
          },
        ],
      },
      {
        id: "voice",
        index: 2,
        title: "Voce & Reception AI",
        summary:
          "Una segretaria AI 24/7 che risponde a ogni chiamata, qualifica chi chiama e fissa gli appuntamenti — così non perdi più clienti.",
        detail:
          "Il tuo telefono, risposto 24 ore su 24 con voce naturale. L'agente capisce la richiesta, qualifica chi chiama, fissa gli appuntamenti direttamente in agenda e passa a una persona quando serve — niente più chiamate perse, niente rincorse in segreteria.",
        services: [
          {
            id: "call-answering",
            title: "Risposta chiamate 24/7",
            outcome: "Mai più una chiamata persa",
            blurb:
              "Un agente con voce naturale risponde a ogni chiamata, giorno e notte, weekend inclusi.",
          },
          {
            id: "appointment-booking",
            title: "Prenotazione appuntamenti",
            outcome: "Agenda piena",
            blurb:
              "Fissa gli appuntamenti direttamente in agenda e conferma a chi chiama.",
          },
          {
            id: "qualification",
            title: "Qualifica & smistamento",
            outcome: "La chiamata giusta, alla persona giusta",
            blurb:
              "Qualifica chi chiama e instrada o passa a una persona quando conta.",
          },
        ],
      },
      {
        id: "web",
        index: 3,
        title: "Siti & E-commerce",
        summary:
          "Siti che sembrano premium e vendono — dalla landing page allo store automatizzato con l'AI.",
        detail:
          "Progettiamo e costruiamo siti veloci e orientati alla conversione: landing page, e-commerce completi e siti automatizzati con AI dove contenuti, supporto e merchandising si gestiscono da soli.",
        services: [
          {
            id: "sites",
            title: "Siti & e-commerce",
            outcome: "Dalla landing allo store",
            blurb:
              "Landing page, siti vetrina ed e-commerce — veloci, premium, fatti per convertire.",
          },
          {
            id: "ai-sites",
            title: "Siti automatizzati AI",
            outcome: "Un sito che si gestisce da solo",
            blurb:
              "Contenuti, chat, supporto e merchandising guidati dall'AI — il sito lavora mentre dormi.",
          },
          {
            id: "redesign",
            title: "Redesign",
            outcome: "Una seconda prima impressione",
            blurb:
              "Trasformiamo siti datati in esperienze veloci, moderne e in linea col brand.",
          },
        ],
      },
      {
        id: "social",
        index: 4,
        title: "Social, automatizzati",
        summary:
          "Presenza costante sui social — e gestisci tutto dall'admin del tuo sito.",
        detail:
          "Automatizziamo contenuti, programmazione e risposte, e ti diamo una dashboard dentro il tuo sito per gestire ogni canale — senza strumenti sparsi, senza settimane saltate.",
        services: [
          {
            id: "social-automation",
            title: "Automazione social",
            outcome: "Presenza sempre attiva",
            blurb:
              "Contenuti, programmazione ed engagement automatizzati che tengono il brand sempre visibile.",
          },
          {
            id: "social-admin",
            title: "Social dall'admin del sito",
            outcome: "Un'unica admin, tutti i canali",
            blurb:
              "Una dashboard integrata nel tuo sito per pianificare, pubblicare e monitorare tutti i social — in un solo posto.",
          },
        ],
      },
      {
        id: "growth",
        index: 5,
        title: "Visibilità & Crescita",
        summary:
          "Farti trovare — da Google e dall'AI — e trasformare l'attenzione in lead qualificati.",
        detail:
          "SEO e GEO per essere citati da motori di ricerca e assistenti AI, più ricerca lead che riempie la pipeline con i contatti giusti.",
        services: [
          {
            id: "seo-geo",
            title: "SEO & GEO",
            outcome: "Trovato da Google e dall'AI",
            blurb:
              "SEO classica più Generative Engine Optimization — strutturati perché ChatGPT, Perplexity e Google ti citino.",
          },
          {
            id: "leadgen",
            title: "Ricerca lead",
            outcome: "Una pipeline più piena",
            blurb:
              "Troviamo e qualifichiamo i contatti giusti: le vendite partono da una lista calda, non fredda.",
          },
        ],
      },
    ],
  },
  work: {
    eyebrow: "Lavori selezionati",
    heading: "Prove, non promesse.",
    note: "Esempi illustrativi di ciò che costruiamo — scorri lateralmente per attraversarli.",
    viewAll: "Tutti i lavori",
    headerEyebrow: "Lavori selezionati",
    headerTitle: "Cosa costruiamo, in pratica.",
    headerDesc:
      "Esempi illustrativi tra automazione, web, social e crescita — rappresentativi del lavoro che facciamo.",
    meta: ["Automazione · Web · Crescita", "PMI & enterprise", "2024 — oggi"],
    items: [
      {
        slug: "aurora-commerce",
        client: "Aurora",
        title: "Un e-commerce che fa merchandising da solo",
        category: "E-commerce AI",
        year: "2025",
        blurb:
          "Uno store automatizzato con AI: schede prodotto, raccomandazioni e supporto che funzionano senza un team di contenuti dedicato.",
        metric: "+34%",
        metricLabel: "tasso di conversione",
        accent: "from-[#3fdcff] to-[#5b8cff]",
      },
      {
        slug: "pulse-social",
        client: "Pulse",
        title: "Social in autopilot, on brand",
        category: "Automazione Social",
        year: "2025",
        blurb:
          "Contenuti e programmazione automatizzati su tutti i canali, gestiti dall'admin del sito del cliente.",
        metric: "8 h/sett",
        metricLabel: "risparmiate sui social",
        accent: "from-[#5b8cff] to-[#8b6cff]",
      },
      {
        slug: "meridian-leadgen",
        client: "Meridian",
        title: "Una pipeline che si riempie da sola",
        category: "Lead Generation",
        year: "2025",
        blurb:
          "Un motore di ricerca lead che trova, arricchisce e qualifica i contatti direttamente nella inbox del team vendite.",
        metric: "3,2×",
        metricLabel: "lead qualificati",
        accent: "from-[#4fe3b0] to-[#3fdcff]",
      },
      {
        slug: "atlas-agents",
        client: "Atlas",
        title: "Operatività multi-agente per un team snello",
        category: "Automazione Multi-agente",
        year: "2024",
        blurb:
          "Agenti coordinati che gestiscono preventivi, inserimento dati e follow-up end-to-end per un piccolo team operativo.",
        metric: "−60%",
        metricLabel: "lavoro manuale",
        accent: "from-[#8b6cff] to-[#5b8cff]",
      },
      {
        slug: "lumen-redesign",
        client: "Lumen",
        title: "Un redesign che si è ripagato",
        category: "Redesign Sito",
        year: "2024",
        blurb:
          "Un sito datato ricostruito in un'esperienza veloce, moderna e pronta per SEO/GEO — visibilità e conversioni in crescita.",
        metric: "2,1×",
        metricLabel: "traffico organico",
        accent: "from-[#3fdcff] to-[#4fe3b0]",
      },
    ],
  },
  particle: {
    eyebrow: "WebGL live · profondità interattiva",
    headingA: "Cura che puoi",
    headingB: "sentire.",
    copy: "Migliaia di punti, renderizzati in tempo reale. Muovi il cursore — il campo si apre intorno ad esso. La stessa cura la mettiamo in tutto ciò che rilasciamo.",
    hint: "↖ muovi il cursore",
  },
  process: {
    eyebrow: "Come lavoriamo",
    titleA: "Un metodo,",
    titleB: "non una scommessa.",
    intro:
      "Quattro fasi che trasformano un'idea in un sistema affidabile — e lasciano il tuo team più veloce di come l'abbiamo trovato.",
    steps: [
      {
        phase: "01",
        title: "Immersione",
        body: "Mappiamo flussi, dati e obiettivi prima di proporre qualcosa. Troviamo prima il lavoro che vale la pena automatizzare.",
      },
      {
        phase: "02",
        title: "Prototipo",
        body: "Un prototipo funzionante in giorni — non slide. Vedi presto l'automazione, il sito o l'agent fare il lavoro vero.",
      },
      {
        phase: "03",
        title: "Rilascio",
        body: "Lo portiamo in produzione: affidabile, osservabile, on brand e collegato al resto del tuo stack.",
      },
      {
        phase: "04",
        title: "Compounding",
        body: "Affiniamo ed estendiamo, così il tempo risparmiato — e la crescita — continuano ad accumularsi dopo il lancio.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Passaparola",
    headingA: "I team con cui costruiamo",
    headingB: "ci tengono vicini.",
    items: [
      {
        quote:
          "Aether ha automatizzato il lavoro che ci mangiava le serate. Ora lo store va praticamente da solo.",
        name: "Elena Conti",
        role: "Founder, Aurora",
      },
      {
        quote:
          "I nostri social sono passati da sporadici a sempre attivi — e gestiamo tutto dalla nostra dashboard.",
        name: "David Hsu",
        role: "Marketing Lead, Pulse",
      },
      {
        quote:
          "Il motore lead riempie la pipeline con le persone giuste. Le vendite partono finalmente calde.",
        name: "Priya Shah",
        role: "Head of Growth, Meridian",
      },
    ],
  },
  stats: [
    { value: "10+ h", label: "risparmiate a settimana per ogni flusso automatizzato" },
    { value: "+34%", label: "aumento mediano di conversione sui siti che rifacciamo" },
    { value: "3,2×", label: "lead qualificati in più dalla ricerca automatizzata" },
    { value: "24/7", label: "reception AI — ogni chiamata risposta, ogni appuntamento fissato" },
  ],
  faq: {
    eyebrow: "FAQ",
    titleA: "Domande,",
    titleB: "risposte.",
    items: [
      {
        q: "Di cosa si occupa esattamente Aether?",
        a: "Costruiamo automazioni AI e sistemi multi-agente, una segretaria AI 24/7 che risponde alle chiamate e fissa gli appuntamenti, siti ed e-commerce e crescita — SEO, GEO, lead generation e automazione social — per piccole imprese e team enterprise.",
      },
      {
        q: "L'AI può davvero rispondere al telefono e fissare appuntamenti?",
        a: "Sì. La nostra segretaria AI 24/7 risponde a ogni chiamata con voce naturale, capisce la richiesta, qualifica chi chiama e fissa l'appuntamento direttamente in agenda — passando a una persona quando serve. Smetti di perdere clienti per le chiamate non risposte.",
      },
      {
        q: "Lavorate con le piccole imprese?",
        a: "Sì. Gran parte del nostro lavoro sono app di automazione e siti automatizzati con AI dimensionati per team piccoli, con prezzi e perimetro adeguati.",
      },
      {
        q: "Cos'è la GEO (Generative Engine Optimization)?",
        a: "La GEO ottimizza il sito perché gli assistenti AI come ChatGPT, Perplexity e le AI overview di Google lo citino. Strutturiamo i contenuti, aggiungiamo i dati schema.org e pubblichiamo un llms.txt perché le macchine possano citarti correttamente.",
      },
      {
        q: "Potete gestire i nostri social dal nostro sito?",
        a: "Sì — integriamo nel tuo sito una dashboard per pianificare, pubblicare e monitorare ogni canale, oltre a contenuti e programmazione automatizzati.",
      },
      {
        q: "Quanto velocemente possiamo partire?",
        a: "Un progetto mirato parte di solito in una o due settimane; le automazioni più piccole escono in pochi giorni.",
      },
      {
        q: "Costruite solo con l'AI?",
        a: "No. Usiamo l'AI dove serve davvero e ingegneria classica per tutto il resto — l'obiettivo è un risultato affidabile, non una demo.",
      },
    ],
  },
  footer: {
    eyebrow: "Costruiamo",
    headingA: "Pronto a far fare",
    headingB: "il lavoro all'AI?",
    cta: "Inizia un progetto",
    sitemap: "Mappa del sito",
    social: "Social",
    contact: "Contatti",
    rights: "Studio di automazione AI, web & crescita.",
  },
  services: {
    headerEyebrow: "Servizi",
    headerTitle: "Automazione, web e crescita — sotto un solo tetto.",
    headerDesc:
      "Cinque pilastri, un solo motore di crescita. Prendi un singolo servizio o falli girare insieme — per piccole imprese e team enterprise.",
  },
  about: {
    headerEyebrow: "Studio",
    headerTitle: "Uno studio piccolo che rilascia.",
    headerDesc:
      "Nessun livello intermedio, nessun passaggio ai junior. Chi inquadra il tuo problema è chi costruisce il sistema.",
    principlesEyebrow: "Principi",
    principlesTitle: "Ciò a cui teniamo.",
    peopleEyebrow: "Le persone",
    peopleTitle: "Pochi, senior, responsabili.",
    values: [
      {
        title: "Risultati, non output",
        body: "Siamo pagati per muovere una metrica — tempo risparmiato, lead, ricavi — non per fare slide.",
      },
      {
        title: "Il gusto è una feature",
        body: "L'artigianalità si accumula. Come ci si sente fa parte di se funziona.",
      },
      {
        title: "Automatizza il noioso",
        body: "Se una persona lo fa due volte, probabilmente non dovrebbe farlo una persona.",
      },
      {
        title: "Costruire per accumulare",
        body: "Lasciamo i team più veloci di come li abbiamo trovati. Il vantaggio sopravvive al progetto.",
      },
    ],
    team: [
      { name: "Sofia Lindqvist", role: "Founder · Automazione", initials: "SL" },
      { name: "Marco Devlin", role: "Design Engineering", initials: "MD" },
      { name: "Aria Chen", role: "Web & E-commerce", initials: "AC" },
      { name: "Tobias Renn", role: "Crescita & SEO/GEO", initials: "TR" },
    ],
  },
  contact: {
    headerEyebrow: "Contatti",
    headerTitle: "Costruiamo qualcosa che funziona.",
    headerDesc:
      "Raccontaci il problema. Più sei specifico, meglio è — rispondiamo a ogni messaggio serio.",
    email: "Email",
    studios: "Sedi",
    nextLabel: "Cosa succede dopo",
    next: [
      "Leggiamo il tuo messaggio e rispondiamo entro due giorni lavorativi.",
      "Una call di 30 minuti per mettere alla prova il problema insieme.",
      "Una proposta breve e a perimetro fisso — niente fronzoli, niente trappole da retainer.",
    ],
    form: {
      name: "Nome",
      email: "Email",
      company: "Azienda",
      reason: "Motivo",
      budget: "Budget",
      project: "Progetto",
      namePh: "Ada Lovelace",
      emailPh: "tu@azienda.com",
      companyPh: "Dove lavori",
      projectPh: "Cosa vuoi costruire o automatizzare?",
      send: "Invia messaggio",
      sending: "Invio…",
      avgReply: "Risposta media · 48h",
      successTitle: "Messaggio ricevuto.",
      successBody: "leggiamo ogni messaggio e rispondiamo entro due giorni lavorativi.",
      successHi: "Grazie",
      sendAnother: "Invia un altro →",
      errRequired: "obbligatorio",
      errInvalid: "non valida",
      errDetail: "aggiungi dettagli",
    },
    reasons: [
      "Automazione AI",
      "Sito / e-commerce",
      "Social",
      "SEO / GEO / lead",
      "Sto solo esplorando",
    ],
    budgets: ["< 5k €", "5k–25k €", "25k–100k €", "100k+ €"],
  },
  ui: {
    themeToLight: "Passa al chiaro",
    themeToDark: "Passa allo scuro",
    language: "Lingua",
  },
};

export type Dict = typeof en;
export const dictionaries: Record<Lang, Dict> = { en, it };

export function isLang(value: string | undefined): value is Lang {
  return value === "en" || value === "it";
}

export function isTheme(value: string | undefined): value is Theme {
  return value === "dark" || value === "light";
}
