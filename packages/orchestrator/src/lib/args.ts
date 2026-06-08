/** Minimal `--key=value` / `--flag` CLI arg parser. */
export type Args = Record<string, string | boolean>;

export function parseArgs(argv: string[] = process.argv.slice(2)): Args {
  const out: Args = {};
  for (const a of argv) {
    if (!a.startsWith('--')) continue;
    const body = a.slice(2);
    const eq = body.indexOf('=');
    if (eq === -1) out[body] = true;
    else out[body.slice(0, eq)] = body.slice(eq + 1);
  }
  return out;
}

export function getStr(args: Args, key: string, def?: string): string {
  const v = args[key];
  if (typeof v === 'string' && v.length > 0) return v;
  if (def !== undefined) return def;
  throw new Error(`Missing required --${key}=<value>`);
}

export function getNum(args: Args, key: string, def: number): number {
  const v = args[key];
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return def;
}

export function getBool(args: Args, key: string): boolean {
  return args[key] === true || args[key] === 'true' || args[key] === '1';
}
