import { auth } from "@/lib/server/auth";
import { db } from "@/lib/server/db/db";
import type { detectTask } from "@/trigger/detect";
import { tasks } from "@trigger.dev/sdk/v3";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { customAlphabet } from "nanoid";
import { detectionRuns } from "@/lib/server/db/schema";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz");

const f = createUploadthing();

export const tarkovVisionFileRouter = {
  uploadDetectImage: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      console.log("middleware");
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      console.log("session", session);

      if (!session) throw new UploadThingError("Unauthorized");

      const userId = session.user.id;

      console.log("userId", userId);
      const userData = await db.query.user.findFirst({
        where: (table, { eq }) => eq(table.id, userId),
      });

      console.log("userData", userData);

      if (!userData) throw new UploadThingError("User not found");

      // if (userData.detectionRuns.length >= 50) {
      //   throw new UploadThingError(
      //     "User has reached the maximum number of detections"
      //   );
      // }

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);

      const [detectionRun] = await db
        .insert(detectionRuns)
        .values({
          id: nanoid(20),
          userId: metadata.userId,
          imageUrl: file.ufsUrl,
          status: "pending",
        })
        .returning();

      const task = await tasks.trigger<typeof detectTask>(
        "detect",
        {
          imageKey: file.key,
        },
        {
          metadata: {
            userId: metadata.userId,
            detectionRunId: detectionRun.id,
          },
          tags: [`detect_${detectionRun.id}`],
        }
      );

      return {
        detectionRunId: detectionRun.id,
        triggerRunId: task.id,
        triggerRunToken: task.publicAccessToken,
      };
    }),
} satisfies FileRouter;

export type TarkovVisionFileRouter = typeof tarkovVisionFileRouter;
