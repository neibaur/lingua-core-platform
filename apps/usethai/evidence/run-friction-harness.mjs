// Runner for the barrel-reach friction harness.
//
// The harness and the governed core are unbuilt ESM TypeScript consumed via the
// `@core` alias. This runner loads the harness through Vite's SSR module loader —
// the same Vite that `astro dev` uses — so the `@core` alias resolves and the core
// TypeScript is transpiled on the fly, with no separate build step or added
// dependency. It then writes the rendered report next to this file.
//
// Run with: pnpm --filter usethai evidence:friction
//        or: node evidence/run-friction-harness.mjs   (from apps/usethai)

import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

// Vite ships transitively (via astro) in pnpm's non-flat layout, so it is not a
// resolvable bare specifier from this file. Resolve it through astro's scope.
const require = createRequire(import.meta.url);
function resolveVite() {
  const bases = [import.meta.url, require.resolve("astro/package.json")];
  for (const base of bases) {
    try {
      return pathToFileURL(createRequire(base).resolve("vite")).href;
    } catch {
      // try next base
    }
  }
  throw new Error("Could not resolve 'vite' (expected transitively via astro).");
}
const { createServer } = await import(resolveVite());

const appRoot = fileURLToPath(new URL("..", import.meta.url));
const coreAlias = fileURLToPath(new URL("../../../src/core", import.meta.url));
const reportPath = fileURLToPath(
  new URL("./barrel-reach-friction-report.md", import.meta.url),
);

const server = await createServer({
  root: appRoot,
  configFile: false,
  logLevel: "warn",
  appType: "custom",
  server: { middlewareMode: true },
  resolve: { alias: { "@core": coreAlias } },
  optimizeDeps: { noDiscovery: true },
});

try {
  const harness = await server.ssrLoadModule("./src/evidence/harness.ts");
  const records = await harness.runHarness();
  const report = harness.renderReport(records);
  await writeFile(reportPath, report, "utf8");
  console.log(`barrel-reach friction harness: wrote ${records.length} records.`);
} finally {
  await server.close();
}
