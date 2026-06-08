import { getServiceClient } from './supabase';

/** Runtime settings stored in the app_flags table (key -> jsonb value). */

export async function getFlag<T = unknown>(key: string): Promise<T | null> {
  const { data } = await getServiceClient().from('app_flags').select('value').eq('key', key).maybeSingle();
  return (data?.value ?? null) as T | null;
}

export async function setFlag(key: string, value: unknown): Promise<void> {
  const { error } = await getServiceClient()
    .from('app_flags')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw new Error(`setFlag(${key}): ${error.message}`);
}

export const LLM_MODEL_KEY = 'llm_model';

/** The OpenRouter model id chosen in the dashboard, or null if unset. */
export async function getLlmModel(): Promise<string | null> {
  const v = await getFlag<{ model?: string }>(LLM_MODEL_KEY);
  return v?.model ?? null;
}
