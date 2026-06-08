import { dictionaries } from "@/lib/i18n";
import { site } from "@/lib/content";

// GEO: a Markdown summary for AI answer engines. Generated from the primary
// (Italian) dictionary so it stays in sync. Served at /llms.txt.
export const dynamic = "force-static";

export function GET() {
  const d = dictionaries.it;
  const base = `https://${site.domain}/it`;
  const lines: string[] = [];

  lines.push(`# ${site.name}`, "");
  lines.push(`> ${d.brand.description}`, "");

  lines.push("## Servizi");
  for (const pillar of d.pillars.items) {
    for (const s of pillar.services) {
      lines.push(`- [${s.title}](${base}/services) — ${s.blurb}`);
    }
  }
  lines.push("");

  lines.push("## Case study (esempi illustrativi)");
  for (const w of d.work.items) {
    lines.push(
      `- [${w.title}](${base}/work/${w.slug}) — ${w.category}: ${w.metric} ${w.metricLabel}`,
    );
  }
  lines.push("");

  lines.push("## Studio");
  lines.push(`- [Chi siamo](${base}/about) — ${d.about.headerDesc}`);
  lines.push(`- [Contatti](${base}/contact) — ${site.email}`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
