import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_shdduopkzohvyoaqkmui",
  maxDuration: 1000 * 60 * 5,
  dirs: ["./src/trigger"],
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
});
