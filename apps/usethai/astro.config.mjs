import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

// SSR shell for UseThai.com. `astro dev` runs on-demand rendering without a
// production adapter; the Cloudflare adapter is deferred to the deploy step.
// The governed core is consumed as source via the @core alias (Vite transpiles
// the unbuilt ESM TypeScript on the fly) — see tsconfig.json paths for the
// matching type-resolution alias.
export default defineConfig({
  output: "server",
  vite: {
    resolve: {
      alias: {
        "@core": fileURLToPath(new URL("../../src/core", import.meta.url)),
      },
    },
  },
});
