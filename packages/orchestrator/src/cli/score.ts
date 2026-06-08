import { parseArgs, getNum } from '../lib/args';
import { runScore } from '../stages/score';

async function main() {
  const args = parseArgs();
  const result = await runScore(getNum(args, 'limit', 1000));
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
