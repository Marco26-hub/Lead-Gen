export type SiteAgeClass = 'none' | 'old' | 'modern';
export type Priority = 'high' | 'medium' | 'low';
export type Channel = 'email' | 'whatsapp';
export type LeadStatus =
  | 'inbound'
  | 'scraped'
  | 'enriched'
  | 'classified'
  | 'generated'
  | 'deployed'
  | 'approved'
  | 'trialing'
  | 'paying'
  | 'churned'
  | 'queued_outreach'
  | 'contacted'
  | 'replied'
  | 'unsubscribed'
  | 'bounced'
  | 'suppressed';

/** Stripe subscription lifecycle. Mirrors Stripe API enum exactly. */
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete';

export interface SubscriptionRow {
  id: string;
  lead_id: string;
  package_id: string;
  billing_period: 'monthly' | 'annual';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A submission from the demo BookingForm. Saved into `public.bookings`. */
export type BookingKind = 'reservation' | 'appointment' | 'booking' | 'quote' | 'contact';
export type BookingStatus = 'new' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface BookingRow {
  id: string;
  lead_id: string;
  kind: BookingKind;
  date: string | null;        // ISO date 'YYYY-MM-DD'
  time: string | null;        // 'HH:MM:SS'
  party_size: number | null;
  service: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  status: BookingStatus;
  source_ip: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface TechStack {
  ssl?: boolean;
  gtm?: boolean;
  metaPixel?: boolean;
  gtag?: boolean;
  viewport?: boolean;
  generator?: string | null;
  cms?: string | null;
  cmsVersion?: string | null;
}

export interface ReviewItem {
  text: string;
  author?: string;
  rating?: number;
}

/** One day's opening hours as returned by Apify Google Places (e.g. { day: 'Lunedì', hours: '12:00–15:00, 19:00–23:00' }). */
export interface OpeningHoursEntry {
  day: string;
  hours: string;
}

/** Subset of the Apify `compass/crawler-google-places` item we consume. */
export interface RawPlace {
  placeId: string;
  title: string;
  categoryName?: string;
  address?: string;
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  totalScore?: number;
  reviewsCount?: number;
  reviews?: Array<{ text?: string | null; name?: string; stars?: number }>;
  email?: string;
  emails?: string[];
  imageUrls?: string[];
  openingHours?: OpeningHoursEntry[];
  /** Instagram handle (no leading @) extracted from actor socials or website URL. */
  instagramHandle?: string;
}

export interface LeadRow {
  id: string;
  place_id: string;
  domain: string | null;
  business_name: string;
  category: string | null;
  /** Città normalizzata (Title Case). Da scraping (località cercata) o backfill da address. */
  city: string | null;
  address: string | null;
  phone_e164: string | null;
  phone_type: 'mobile' | 'fixed' | 'other' | null;
  email: string | null;
  website_url: string | null;
  rating: number | null;
  review_count: number | null;
  reachable: boolean | null;
  http_status: number | null;
  tech_stack: TechStack;
  site_age_class: SiteAgeClass | null;
  priority: Priority | null;
  reviews: ReviewItem[];
  photos: string[];
  opening_hours: OpeningHoursEntry[] | null;
  instagram_handle: string | null;
  page_model: unknown | null;
  template: string | null;
  demo_url: string | null;
  slug: string | null;
  status: LeadStatus;
  /** Provenienza del lead: 'maps' (scraping) | 'website' (form del sito). */
  source: string;
  email_eligible: boolean;
  consent_basis: string | null;
  notes: string | null;
  unsubscribe_token: string;
  outreach_channel: Channel | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StageResult {
  stage: string;
  processed: number;
  advanced: number;
  errors: Array<{ placeId?: string; msg: string }>;
}

export function emptyResult(stage: string): StageResult {
  return { stage, processed: 0, advanced: 0, errors: [] };
}

export type ScrapeJobStatus = 'pending' | 'running' | 'done' | 'error';

export interface ScrapeJob {
  id: string;
  city: string | null;
  category: string | null;
  params: Record<string, unknown>;
  apify_run_id: string | null;
  dataset_id: string | null;
  status: ScrapeJobStatus;
  lead_count: number;
  error: string | null;
  created_at: string;
  updated_at: string;
}
