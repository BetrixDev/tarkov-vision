import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_AUTH_TOKEN: z.string(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    EYE_BASE_URL: z.string(),
    EYE_SECRET_KEY: z.string(),
    UPLOADTHING_TOKEN: z.string(),
  },
  client: {},
  experimental__runtimeEnv: {},
});
