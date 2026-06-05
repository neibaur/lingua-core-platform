import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

import cloudflare from "@astrojs/cloudflare";

// SSR shell for UseThai.com. On-demand rendering targets the Cloudflare
// adapter so the SSR JSON endpoint (src/pages/api/lookup.ts, prerender = false)
// builds for the production runtime. The governed core is consumed as source
// via the @core alias (Vite transpiles the unbuilt ESM TypeScript on the fly)
// — see tsconfig.json paths for the matching type-resolution alias.
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  vite: {
    resolve: {
      alias: {
        "@core": fileURLToPath(new URL("../../src/core", import.meta.url)),
      },
    },
  },
});
