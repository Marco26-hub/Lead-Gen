import { parseArgs, getNum } from '../lib/args';
import { runEnrichInstagram } from '../stages/enrich-instagram';

async function main() {
  const args = parseArgs();
  const result = await runEnrichInstagram({
    limit: getNum(args, 'limit', 50),
    maxImages: getNum(args, 'max-images', 10),
    skipIfPhotosAtLeast: getNum(args, 'skip-if-photos-at-least', 0),
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
