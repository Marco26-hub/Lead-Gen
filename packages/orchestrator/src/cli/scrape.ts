import { parseArgs, getStr, getNum, getBool } from '../lib/args';
import { runScrape } from '../stages/scrape';

async function main() {
  const args = parseArgs();
  const inputFile = typeof args.input === 'string' ? args.input : undefined;
  const result = await runScrape({
    city: inputFile ? getStr(args, 'city', '') : getStr(args, 'city'),
    category: inputFile ? getStr(args, 'category', 'attività locale') : getStr(args, 'category'),
    limit: getNum(args, 'limit', 20),
    enrichContacts: getBool(args, 'enrich'),
    inputFile,
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
