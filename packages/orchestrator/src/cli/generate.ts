import { parseArgs, getNum, getStr } from '../lib/args';
import { runGenerate } from '../stages/generate';
import type { Priority } from '@maps/core';

async function main() {
  const args = parseArgs();
  const p = getStr(args, 'priority', 'high'); // 'high' | 'medium' | 'low' | 'all'
  const priority = p === 'all' ? undefined : (p as Priority);
  const model = typeof args.model === 'string' ? args.model : undefined;
  const result = await runGenerate({ priority, limit: getNum(args, 'limit', 50), model });
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
