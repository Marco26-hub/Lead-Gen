import { parseArgs, getStr } from '../lib/args';
import { getServiceClient, type LeadRow } from '@maps/core';
import { sendWhatsApp, buildDemoMessage } from '@maps/core/whatsapp';

/** One-off: send a generated demo to a WhatsApp number. Usage: --to=+39... --slug=<demo-slug> */
async function main() {
  const args = parseArgs();
  const to = getStr(args, 'to');
  const slug = getStr(args, 'slug');

  const { data } = await getServiceClient().from('leads').select('*').eq('slug', slug).maybeSingle();
  if (!data) throw new Error(`Lead con slug "${slug}" non trovato`);
  const lead = data as LeadRow;
  if (!lead.demo_url) throw new Error('Il lead non ha una demo (genera prima il sito)');

  const msg = buildDemoMessage(lead);
  const r = await sendWhatsApp(to, msg.body, { mediaUrl: msg.mediaUrl });
  console.log(JSON.stringify({ to, business: lead.business_name, demo: lead.demo_url, mediaUrl: msg.mediaUrl, ...r }, null, 2));
  if (r.error) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
