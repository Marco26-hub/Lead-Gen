import { parseArgs, getNum } from '../lib/args';
import { runClassify } from '../stages/classify';

async function main() {
  const args = parseArgs();
  const result = await runClassify(getNum(args, 'limit', 500));
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
