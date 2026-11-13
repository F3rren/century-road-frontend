// Brings in the OpenAPI document history-service publishes, as the backend repository commits it
// (docs/openapi/history-service.json there, checked by its OpenApiSnapshotTest). Then regenerate the
// types: `npm run api:sync && npm run api:types`.
//
//   npm run api:sync                              # from the backend's develop branch
//   OPENAPI_REF=feature/x npm run api:sync        # from another branch, tag or commit
//   OPENAPI_FILE=../century-road-backend/docs/openapi/history-service.json npm run api:sync
//                                                 # from a local checkout, to try a backend change
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const target = resolve(dirname(fileURLToPath(import.meta.url)), '../src/api/openapi/history-service.json');
await mkdir(dirname(target), { recursive: true });

if (process.env.OPENAPI_FILE) {
  await copyFile(resolve(process.env.OPENAPI_FILE), target);
  console.log(`copied ${process.env.OPENAPI_FILE}`);
} else {
  const ref = process.env.OPENAPI_REF ?? 'develop';
  const url = `https://raw.githubusercontent.com/F3rren/century-road-backend/${ref}/docs/openapi/history-service.json`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`${url}: HTTP ${response.status}`);
    process.exit(1);
  }
  const text = await response.text();
  JSON.parse(text); // not a half-written or HTML answer
  await writeFile(target, text);
  console.log(`fetched ${url}`);
}
