import { parseArgs, getNum } from '../lib/args';
import { runOutreachWhatsApp } from '../stages/outreach-whatsapp';

async function main() {
  const args = parseArgs();
  const result = await runOutreachWhatsApp(getNum(args, 'limit', 100));
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
