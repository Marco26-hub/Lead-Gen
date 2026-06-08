import { getServiceClient, type LeadRow, type LeadStatus } from '@maps/core';
import type { SupabaseClient } from '@supabase/supabase-js';

export function db(): SupabaseClient {
  return getServiceClient();
}

export async function selectLeadsByStatus(
  status: LeadStatus,
  limit = 500,
): Promise<LeadRow[]> {
  const { data, error } = await db()
    .from('leads')
    .select('*')
    // Only operate on scraped (Google Maps) leads. Website/inbound leads
    // (source='website') must never enter the pipeline.
    .eq('source', 'maps')
    .eq('status', status)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw new Error(`select leads(status=${status}): ${error.message}`);
  return (data ?? []) as LeadRow[];
}

export async function updateLead(id: string, patch: Record<string, unknown>): Promise<void> {
  const { error } = await db().from('leads').update(patch).eq('id', id);
  if (error) throw new Error(`update lead ${id}: ${error.message}`);
}
