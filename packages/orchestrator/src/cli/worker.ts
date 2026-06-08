import { enforceSpamGuard } from '../outreach/spam-monitor';
import { runOutreachEmail } from '../stages/outreach';

/**
 * Guarded outreach pass: check the spam-rate guard first, then send to approved leads.
 * Designed to be run on a schedule (cron / Task Scheduler).
 */
async function main() {
  const guard = await enforceSpamGuard();
  console.log(`spam guard: rate=${(guard.rate * 100).toFixed(2)}% sends=${guard.sends} paused=${guard.paused}`);
  if (guard.paused) {
    console.log('Outreach in pausa — invii sospesi.');
    return;
  }
  const result = await runOutreachEmail();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
