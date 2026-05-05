// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const cloudflareDevStub = {
  name: "cloudflare-workers-dev-stub",
  apply: "serve" as const,
  enforce: "pre" as const,
  resolveId(id: string) {
    if (id === "cloudflare:workers") return "\0cloudflare-workers-stub";
  },
  load(id: string) {
    if (id !== "\0cloudflare-workers-stub") return;
    return `
      const mockStatement = {
        bind: () => mockStatement,
        all: async () => ({ results: [] }),
        first: async () => null,
        run: async () => ({}),
      };
      const mockDb = { prepare: () => mockStatement };

      export const env = {
        AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN ?? "",
        AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID ?? "",
        AUTH0_CLIENT_SECRET: import.meta.env.VITE_AUTH0_CLIENT_SECRET ?? "",
        SESSION_SECRET: import.meta.env.VITE_SESSION_SECRET ?? "dev-secret",
        DB: mockDb,
      };
    `;
  },
};

export default defineConfig({
  vite: {
    plugins: [cloudflareDevStub],
    build: {
      rollupOptions: {
        external: ["cloudflare:workers"],
      },
    },
  },
});
