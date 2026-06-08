import { phoneType } from '@maps/core';
import { db } from '../lib/db';

/** One-off: recompute phone_type (mobile/fixed/other) for all existing leads from phone_e164. */
async function main() {
  const sb = db();
  const { data, error } = await sb.from('leads').select('id, phone_e164');
  if (error) throw new Error(error.message);

  let updated = 0;
  let mobile = 0;
  for (const l of (data ?? []) as { id: string; phone_e164: string | null }[]) {
    const t = phoneType(l.phone_e164);
    if (t === 'mobile') mobile++;
    const { error: e } = await sb.from('leads').update({ phone_type: t }).eq('id', l.id);
    if (e) throw new Error(e.message);
    updated++;
  }
  console.log(JSON.stringify({ updated, mobile }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
