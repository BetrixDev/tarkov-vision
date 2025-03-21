import { db } from "@/lib/server/db/db";
import { detectionRunItems, detectionRuns } from "@/lib/server/db/schema";
import {
  AbortTaskRunError,
  logger,
  metadata,
  schemaTask,
} from "@trigger.dev/sdk/v3";
import { type } from "arktype";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { UTApi } from "uploadthing/server";

const metadataSchema = type({
  userId: "string?",
  detectionRunId: "string?",
});

function getTypedMetadata(metadata: unknown) {
  const parsed = metadataSchema(metadata);

  if (parsed instanceof type.errors) {
    return {
      userId: "system",
    };
  }

  return {
    userId: parsed.userId ?? "system",
    detectionRunId: parsed.detectionRunId,
  };
}

export const detectTask = schemaTask({
  id: "detect",
  schema: type({
    imageKey: "string",
  }).or({
    imageUrl: "string",
  }),
  onFailure: async () => {
    const { detectionRunId } = getTypedMetadata(metadata.current());

    if (!detectionRunId) {
      return;
    }

    await db
      .update(detectionRuns)
      .set({ status: "failed" })
      .where(eq(detectionRuns.id, detectionRunId));
  },
  run: async (payload, { signal, ctx }) => {
    const { env } = await import("../lib/env");

    const { userId, detectionRunId } = getTypedMetadata(metadata.current());

    const utApi = new UTApi({
      token: env.UPLOADTHING_TOKEN,
    });

    let imageBuffer: Buffer;

    if ("imageUrl" in payload) {
      logger.info("Downloading image from url", {
        imageUrl: payload.imageUrl,
      });

      const response = await fetch(payload.imageUrl);

      if (!response.ok) {
        throw new AbortTaskRunError("Failed to download image");
      }

      imageBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      const { ufsUrl } = await utApi.generateSignedURL(payload.imageKey);
      const response = await fetch(ufsUrl);

      if (!response.ok) {
        throw new AbortTaskRunError("Failed to download image");
      }

      imageBuffer = Buffer.from(await response.arrayBuffer());
    }

    const detectionId = ctx.run.id.replace("run_", "");

    const formData = new FormData();
    formData.append(
      "image",
      new Blob([imageBuffer!], { type: "image/webp" }),
      "image.webp"
    );

    logger.info("Making request to eye api");
    const detectResponsePromise = fetch(`${env.EYE_BASE_URL}/detect`, {
      method: "POST",
      headers: {
        "x-api-key": env.EYE_SECRET_KEY,
        Accept: "application/json",
      },
      body: formData,
    });

    const compressedImage = await sharp(imageBuffer)
      .webp({
        quality: 25,
        effort: 6,
        lossless: false,
        nearLossless: true,
        smartSubsample: true,
      })
      .toBuffer();

    if ("imageKey" in payload) {
      await utApi.deleteFiles(payload.imageKey, { keyType: "fileKey" });
    }

    const uploadResponse = await utApi.uploadFiles(
      new File([compressedImage], detectionId, {
        type: "image/webp",
        // @ts-expect-error
        customId: detectionId,
      }),
      {
        acl: "public-read",
        signal,
      }
    );

    if (!uploadResponse.data) {
      throw new AbortTaskRunError("Failed to upload image");
    }

    metadata.set("imageUrl", uploadResponse.data.ufsUrl);

    const detectJson = await (await detectResponsePromise).json();

    let detectionRun: typeof detectionRuns.$inferInsert;

    if (!detectionRunId) {
      const [run] = await db
        .insert(detectionRuns)
        .values({
          id: detectionId,
          imageUrl: uploadResponse.data.ufsUrl,
          userId,
          status: "completed",
        })
        .returning();

      detectionRun = run;
    } else {
      const [run] = await db
        .update(detectionRuns)
        .set({
          status: "completed",
          imageUrl: uploadResponse.data.ufsUrl,
        })
        .where(eq(detectionRuns.id, detectionRunId))
        .returning();

      detectionRun = run;
    }

    await db.insert(detectionRunItems).values(
      detectJson.detections.map((detection: any) => ({
        boundingBox: detection.boundingBox,
        detectedItemId: detection.detectedItemId,
        detectionRunId: detectionRun.id,
      }))
    );
  },
});
