import { createRouteHandler } from "uploadthing/next";

import { tarkovVisionFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: tarkovVisionFileRouter,
});
