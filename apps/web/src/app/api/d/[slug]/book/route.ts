import { isIP } from "node:net";
import { getServiceClient, type LeadRow } from "@maps/core";
import { sendEmail } from "@maps/core/email";
import {
  emailBookingNotification,
  emailBookingClientReceipt,
  type BookingNotificationInput,
} from "@maps/core/email-booking";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Submission del BookingForm sulla demo pubblica `/d/[slug]`.
 *
 * Salva la richiesta in `public.bookings`, manda email al titolare (lead.email)
 * e — se l'utente ha lasciato la sua — al cliente finale come ricevuta.
 *
 * Anti-spam stratificato:
 *  - Honeypot field `website` (bot lo compila, umani no → silent 200).
 *  - Rate limit per (slug + IP): max 5 / 10 min.
 *  - Rate limit per slug globale: max 30 / ora (anche con IP rotation).
 *  - Anti email-amplification: per ogni indirizzo email di destinazione (titolare
 *    o cliente) max 3 invii / ora (defense vs spam vector).
 *  - Length cap su TUTTI i campi user-supplied (anti-DOS: DB bloat, email bloat).
 *  - Date `YYYY-MM-DD` + Time `HH:MM` validati con regex (Postgres date/time
 *    accetterebbe altro e crasherebbe l'INSERT).
 *  - Source IP parsata con `node:net.isIP` per non far crashare la colonna inet.
 *
 * NB: il form era demo-only fino a Sprint 1. Ora chi visita la demo di un
 * cliente paying invia richieste reali; il lifecycle `paying` è quello che
 * giustifica il tier Smart/Pro.
 */

const KIND_LABELS: Record<string, string> = {
  reservation: "Prenotazione",
  appointment: "Appuntamento",
  booking: "Prenotazione",
  quote: "Richiesta preventivo",
  contact: "Richiesta di contatto",
};
const ALLOWED_KINDS = new Set(Object.keys(KIND_LABELS));

// Length cap per ogni campo user-supplied
const MAX_NAME = 80;
const MAX_PHONE = 32;
const MAX_EMAIL = 254;
const MAX_SERVICE = 80;
const MAX_MESSAGE = 2000;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BookingPayload {
  kind?: string;
  date?: string;
  time?: string;
  partySize?: number;
  service?: string;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  /** Honeypot — deve restare vuoto (popolato solo da bot). */
  website?: string;
}

// In-memory rate limit. Multi-tier: per-(slug,IP), per-slug, per-email-target.
// Bounded: ogni Map prunata ogni 5 min via touch-cleanup + cap hard 50k chiavi.
const HOUR_MS = 60 * 60_000;
const RL_WINDOW_MS = 10 * 60_000;
const RL_PER_SLUG_IP_MAX = 5;        // per (slug, ip) / 10 min
const RL_PER_SLUG_MAX = 30;          // per slug / 1 ora (IP rotation comunque limitata)
const RL_PER_EMAIL_MAX = 3;          // per indirizzo email destinazione / 1 ora (anti amplification)
const RL_MAP_CAP = 50_000;           // memoria: cap per Map (~2-4MB worst case)

const _rlSlugIp = new Map<string, number[]>();
const _rlSlug = new Map<string, number[]>();
const _rlEmail = new Map<string, number[]>();
let _lastSweep = Date.now();

function sweep(now: number) {
  if (now - _lastSweep < 5 * 60_000) return;
  _lastSweep = now;
  for (const m of [_rlSlugIp, _rlSlug, _rlEmail]) {
    for (const [k, list] of m) {
      const kept = list.filter((t) => now - t < HOUR_MS);
      if (kept.length === 0) m.delete(k);
      else m.set(k, kept);
    }
    // Hard cap: se ancora oversize, drop arbitrario (i.e. il rate-limit non sarà
    // perfettamente accurato sotto attacco massivo, ma il processo non OOM).
    if (m.size > RL_MAP_CAP) {
      let toDrop = m.size - RL_MAP_CAP;
      for (const k of m.keys()) {
        if (toDrop-- <= 0) break;
        m.delete(k);
      }
    }
  }
}

function bumpAndCheck(map: Map<string, number[]>, key: string, windowMs: number, max: number, now: number): boolean {
  const list = (map.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    map.set(key, list);
    return true; // limited
  }
  list.push(now);
  map.set(key, list);
  return false;
}

/** Leggi un IP cliente affidabile su Vercel. */
function clientIp(req: Request): string | null {
  // Vercel-only header: viene impostato dall'edge e NON è preservato dal client.
  const vfwd = req.headers.get("x-vercel-forwarded-for");
  if (vfwd) {
    const first = vfwd.split(",")[0]?.trim();
    if (first && isIP(first)) return first;
  }
  // Generico XFF: solo se isIP() valida (evita crash su colonna inet).
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first && isIP(first)) return first;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real && isIP(real)) return real;
  return null;
}

function formatWhen(date: string | null, time: string | null, party: number | null): string {
  const parts: string[] = [];
  if (date) {
    const d = new Date(`${date}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      parts.push(d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }));
    } else {
      parts.push(date);
    }
  }
  if (time) parts.push(time);
  if (party && party > 0) parts.push(`${party} coperti`);
  return parts.join(" · ");
}

function cap(s: string | undefined, max: number): string | undefined {
  if (s === undefined) return undefined;
  const t = s.trim();
  if (t.length === 0) return undefined;
  return t.length > max ? t.slice(0, max) : t;
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const now = Date.now();
  sweep(now);

  let body: BookingPayload;
  try {
    body = (await req.json()) as BookingPayload;
  } catch {
    return Response.json({ ok: false, error: "JSON non valido" }, { status: 400 });
  }

  // Honeypot — risposta 200 fake per non aiutare i bot a calibrare il payload.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return Response.json({ ok: true });
  }

  // Kind
  const kind = String(body.kind ?? "contact");
  if (!ALLOWED_KINDS.has(kind)) {
    return Response.json({ ok: false, error: "Tipo richiesta non valido" }, { status: 400 });
  }

  // Length-capped strings
  const name = cap(body.name, MAX_NAME);
  const phone = cap(body.phone, MAX_PHONE);
  if (!name || name.length < 2 || !phone || phone.length < 4) {
    return Response.json({ ok: false, error: "Nome e telefono obbligatori" }, { status: 400 });
  }
  const message = cap(body.message, MAX_MESSAGE);
  const service = cap(body.service, MAX_SERVICE);
  const emailRaw = cap(body.email, MAX_EMAIL);
  if (emailRaw && !EMAIL_RE.test(emailRaw)) {
    return Response.json({ ok: false, error: "Email non valida" }, { status: 400 });
  }
  const email = emailRaw;

  // Date/time strict (Postgres date/time accetterebbe altro e crasherebbe l'INSERT)
  const date = body.date && DATE_RE.test(body.date) ? body.date : null;
  if (body.date && !date) {
    return Response.json({ ok: false, error: "Data non valida (formato YYYY-MM-DD)" }, { status: 400 });
  }
  const time = body.time && TIME_RE.test(body.time) ? body.time : null;
  if (body.time && !time) {
    return Response.json({ ok: false, error: "Orario non valido (formato HH:MM)" }, { status: 400 });
  }
  const partySize =
    typeof body.partySize === "number" && body.partySize > 0 && body.partySize <= 100
      ? Math.floor(body.partySize)
      : null;

  // Rate limit a 3 livelli (early — saltiamo lookup DB se già limited)
  const ip = clientIp(req); // può essere null (nessun proxy header valido)
  const ipKey = ip ?? "unknown";
  if (bumpAndCheck(_rlSlugIp, `${slug}:${ipKey}`, RL_WINDOW_MS, RL_PER_SLUG_IP_MAX, now)) {
    return Response.json({ ok: false, error: "Troppe richieste, riprova fra qualche minuto" }, { status: 429 });
  }
  if (bumpAndCheck(_rlSlug, slug, HOUR_MS, RL_PER_SLUG_MAX, now)) {
    return Response.json({ ok: false, error: "Modulo temporaneamente non disponibile, riprova più tardi" }, { status: 429 });
  }

  // Lookup lead
  const sb = getServiceClient();
  const { data: leadRow } = await sb
    .from("leads")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!leadRow) {
    return Response.json({ ok: false, error: "Demo non trovata" }, { status: 404 });
  }
  const lead = leadRow as LeadRow;

  // Insert booking. `source_ip` è inet — passiamo null se l'IP non è valido
  // per evitare crash dell'INSERT (review finding #4).
  const insertPayload = {
    lead_id: lead.id,
    kind,
    date,
    time,
    party_size: partySize,
    service: service ?? null,
    name,
    phone,
    email: email ?? null,
    message: message ?? null,
    status: "new" as const,
    source_ip: ip, // node:net.isIP-validated, safe per colonna inet
    user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
  };
  const { data: inserted, error: insertErr } = await sb
    .from("bookings")
    .insert(insertPayload)
    .select("id")
    .maybeSingle();
  if (insertErr) {
    console.error("[booking] insert failed", insertErr);
    return Response.json({ ok: false, error: "Errore salvataggio" }, { status: 500 });
  }

  // Email titolare + cliente. NON usiamo `void` perché su Vercel l'execution
  // del runtime termina alla return della Response — un promise non-awaited
  // viene cancellato e l'email non parte mai (review finding #5).
  const kindLabel = KIND_LABELS[kind] ?? "Richiesta";
  const whenLine = formatWhen(date, time, partySize);
  const notif: BookingNotificationInput = {
    businessName: lead.business_name,
    kindLabel,
    whenLine,
    service: service ?? undefined,
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    customerMessage: message ?? undefined,
  };
  await notifySync(lead, notif, kindLabel, whenLine, service ?? null, email, now);

  return Response.json({ ok: true, id: inserted?.id ?? null });
}

async function notifySync(
  lead: LeadRow,
  notif: BookingNotificationInput,
  kindLabel: string,
  whenLine: string,
  service: string | null,
  customerEmail: string | undefined,
  now: number,
) {
  // 1) Email titolare. Sempre rate-limited per evitare flood inbox titolare.
  if (lead.email) {
    if (bumpAndCheck(_rlEmail, lead.email.toLowerCase(), HOUR_MS, RL_PER_EMAIL_MAX, now)) {
      console.warn("[booking] titolare email rate-limited", lead.email);
    } else {
      try {
        const { subject, html } = emailBookingNotification(notif);
        // NON impostiamo Reply-To al customerEmail: il customerEmail è
        // attaccante-controllabile. Il titolare risponderà manualmente.
        const r = await sendEmail({ to: lead.email, subject, html });
        if (r.error) console.error("[booking] notify titolare failed", r.error);
      } catch (e) {
        console.error("[booking] notify titolare threw", (e as Error).message);
      }
    }
  }
  // 2) Ricevuta cliente. Rate-limited per indirizzo per non diventare
  // un email-amplifier verso target arbitrari (review finding #7).
  if (customerEmail) {
    if (bumpAndCheck(_rlEmail, customerEmail.toLowerCase(), HOUR_MS, RL_PER_EMAIL_MAX, now)) {
      console.warn("[booking] cliente email rate-limited", customerEmail);
    } else {
      try {
        const { subject, html } = emailBookingClientReceipt({
          businessName: lead.business_name,
          customerName: notif.customerName,
          kindLabel,
          whenLine,
          service: service ?? undefined,
          businessPhone: lead.phone_e164 ?? undefined,
        });
        const r = await sendEmail({ to: customerEmail, subject, html });
        if (r.error) console.error("[booking] receipt cliente failed", r.error);
      } catch (e) {
        console.error("[booking] receipt cliente threw", (e as Error).message);
      }
    }
  }
}
