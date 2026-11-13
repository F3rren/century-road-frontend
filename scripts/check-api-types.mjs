// Fails when src/api/schema.d.ts is not what `npm run api:types` would produce from the committed
// OpenAPI document: somebody updated one and not the other. Part of CI, so a stale file cannot be merged.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const spec = 'src/api/openapi/history-service.json';
const committed = 'src/api/schema.d.ts';
const dir = mkdtempSync(join(tmpdir(), 'api-types-'));
const fresh = join(dir, 'schema.d.ts');

try {
  execFileSync('npx', ['openapi-typescript', spec, '-o', fresh], { stdio: 'ignore' });
  if (readFileSync(fresh, 'utf8') !== readFileSync(committed, 'utf8')) {
    console.error(`${committed} is out of date with ${spec}. Run: npm run api:types`);
    process.exit(1);
  }
  console.log(`${committed} matches ${spec}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
