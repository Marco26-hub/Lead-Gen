import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Load the monorepo-root `.env` regardless of which package the process started in.
 * Walks up from cwd until it finds `pnpm-workspace.yaml`. dotenv does not override
 * already-set vars, so this is harmless under Next.js (which loads its own env).
 */
function loadRootEnv(): void {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) {
      dotenvConfig({ path: join(dir, '.env') });
      return;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  dotenvConfig();
}
loadRootEnv();

function pick(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (v) return v;
  }
  return undefined;
}

export const env = {
  SUPABASE_URL: pick('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_ANON_KEY: pick('SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  APIFY_TOKEN: process.env.APIFY_TOKEN,
  APIFY_WEBHOOK_SECRET: process.env.APIFY_WEBHOOK_SECRET ?? '',
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET ?? 'lead-photos',
  // Stripe billing — required quando si attiva il checkout in produzione.
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4.6',
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  OPENROUTER_SITE_URL: process.env.OPENROUTER_SITE_URL ?? '',
  OPENROUTER_APP_NAME: process.env.OPENROUTER_APP_NAME ?? 'Maps LeadGen',
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM ?? 'onboarding@resend.dev',
  RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
  OUTREACH_TEST_RECIPIENT: process.env.OUTREACH_TEST_RECIPIENT ?? '',
  PUBLIC_BASE_URL: (process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, ''),
  /** URL Calendly/Cal.com per prenotare call commerciale. Mostrato nel BuyerBanner sulle demo. */
  SALES_CALENDLY_URL: process.env.SALES_CALENDLY_URL ?? '',
  /** Numero WhatsApp sales (formato wa.me, es. "+393476859658"). Mostrato nel BuyerBanner. */
  SALES_WHATSAPP: process.env.SALES_WHATSAPP ?? '',
  /** Email sales per fallback in BuyerBanner. */
  SALES_EMAIL: process.env.SALES_EMAIL ?? 'info@socialwebautomation.com',
  OUTREACH_DAILY_CAP: Number(process.env.OUTREACH_DAILY_CAP ?? '20'),
  SPAM_RATE_THRESHOLD: Number(process.env.SPAM_RATE_THRESHOLD ?? '0.003'),
  SENDER_NAME: process.env.SENDER_NAME ?? '',
  SENDER_ADDRESS: process.env.SENDER_ADDRESS ?? '',
  SENDER_VAT: process.env.SENDER_VAT ?? '',
  WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  WHATSAPP_FROM: process.env.WHATSAPP_FROM ?? '',
  OUTREACH_TEST_WHATSAPP: process.env.OUTREACH_TEST_WHATSAPP ?? '',
} as const;

export type Env = typeof env;

/** Read a required env value or throw a clear error (use inside providers, not at import time). */
export function requireEnv(name: keyof Env): string {
  const v = env[name];
  if (v === undefined || v === null || v === '') {
    throw new Error(`Missing required env: ${String(name)} — set it in .env`);
  }
  return String(v);
}
