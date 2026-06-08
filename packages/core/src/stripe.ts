import Stripe from 'stripe';
import { requireEnv } from './config';

/**
 * Stripe client singleton — usato dagli endpoint `/api/billing/*` in apps/web.
 * Lazy: chiama `getStripe()` solo quando si accede al billing (così l'app
 * gira in dev senza chiavi Stripe).
 *
 * Mapping pacchetto → price ID via env: ogni pacchetto/billing-period
 * (es. `ristorante-growth/monthly`) ha la sua env var
 * `STRIPE_PRICE_<PKG>_<PERIOD>`. Quando l'utente crea i Products/Prices
 * nella dashboard Stripe, copia gli ID `price_xxx` nelle env Vercel.
 */

let _client: Stripe | null = null;

export function getStripe(): Stripe {
  if (_client) return _client;
  _client = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
    // Versione fissata: aggiorna quando bumpi stripe SDK + ritesti webhook payload.
    apiVersion: '2025-02-24.acacia',
    typescript: true,
  });
  return _client;
}

/**
 * Risolve un `package_id` + billing period a un Stripe price ID via env.
 *
 *   ristorante-growth + monthly →  env.STRIPE_PRICE_RISTORANTE_GROWTH_MONTHLY
 *   sito-smart       + annual  →  env.STRIPE_PRICE_SITO_SMART_ANNUAL
 *
 * Restituisce null se il price ID non è configurato (es. annuale non ancora
 * pubblicato): il caller mostra errore "pacchetto non configurato".
 */
export function lookupStripePrice(packageId: string, period: 'monthly' | 'annual'): string | null {
  const envKey = `STRIPE_PRICE_${packageId.toUpperCase().replace(/-/g, '_')}_${period.toUpperCase()}`;
  const v = process.env[envKey];
  return v && v.startsWith('price_') ? v : null;
}
