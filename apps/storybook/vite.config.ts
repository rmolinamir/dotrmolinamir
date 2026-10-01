/// <reference types="vitest/config" />

// https://vite.dev/config/
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));
// biome-ignore lint/style/noProcessEnv: Local ARM test runs can use an existing Chromium binary.
const chromiumExecutable = process.env.STORYBOOK_CHROMIUM_EXECUTABLE;

import tailwindcss from "@tailwindcss/vite";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [
              {
                browser: "chromium",
              },
            ],
            provider: playwright({
              launchOptions: chromiumExecutable
                ? { executablePath: chromiumExecutable }
                : {},
            }),
          },
          name: "storybook",
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
