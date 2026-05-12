import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";

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
        SQUARE_ACCESS_TOKEN: import.meta.env.VITE_SQUARE_ACCESS_TOKEN ?? "",
        DB: mockDb,
      };
    `;
  },
};

export default defineConfig(({ command, mode }) => {
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define: envDefine,
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      ...(command === "build"
        ? [cloudflare({ viteEnvironment: { name: "ssr" } })]
        : [cloudflareDevStub]),
      tanstackStart({
        importProtection: {
          behavior: "error",
          client: {
            files: ["**/server/**"],
            specifiers: ["server-only"],
          },
        },
      }),
      react(),
    ],
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    server: { host: "::", port: 8080 },
  };
});
