import { parseArgs, getNum } from '../lib/args';
import { runOutreachEmail } from '../stages/outreach';

async function main() {
  const args = parseArgs();
  const result = await runOutreachEmail(getNum(args, 'limit', 200));
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
