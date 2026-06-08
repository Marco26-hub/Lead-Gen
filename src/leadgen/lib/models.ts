export interface ModelOption {
  id: string;
  label: string;
}

/**
 * OpenRouter models that support function/tool calling (required for our structured
 * PageModel generation). Fetched from the public models endpoint, cached 1h.
 */
export async function fetchToolModels(): Promise<ModelOption[]> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Array<{ id: string; name?: string; supported_parameters?: string[] }> };
    return (json.data ?? [])
      .filter((m) => Array.isArray(m.supported_parameters) && m.supported_parameters.includes("tools"))
      .map((m) => ({ id: m.id, label: m.name ?? m.id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch {
    return [];
  }
}
