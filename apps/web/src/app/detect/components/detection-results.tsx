"use client";

import type { detectionRunItems, tarkovItems } from "@/lib/server/db/schema";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type DetectionResultsProps = {
  imageUrl: string;
  runData?: {
    createdAt: Date;
    detectionRunItems: (typeof detectionRunItems.$inferSelect & {
      tarkovItem: typeof tarkovItems.$inferSelect;
    })[];
  };
  selectedDetectionId?: string;
  setSelectedDetectionId: (detectionId: string) => void;
  isPending: boolean;
};

export function DetectionResults({
  imageUrl,
  runData,
  selectedDetectionId,
  setSelectedDetectionId,
  isPending,
}: DetectionResultsProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const updateImageDimensions = () => {
      if (imageRef.current && containerRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        setImageDimensions({
          width: rect.width,
          height: rect.height,
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left,
        });
      }
    };

    // Update dimensions when image loads
    if (imageRef.current) {
      imageRef.current.onload = updateImageDimensions;
    }

    // Update dimensions on window resize
    window.addEventListener("resize", updateImageDimensions);

    // Initial update
    updateImageDimensions();

    return () => {
      window.removeEventListener("resize", updateImageDimensions);
    };
  }, [imageUrl, runData]);

  if (!imageUrl) return null;

  return (
    <div className="border border-zinc-800 overflow-hidden">
      <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-zinc-400 uppercase">
          Detection Results
        </span>
        <span className="text-xs px-2 py-1 bg-zinc-800">
          {`${runData?.detectionRunItems.length || 0} objects detected`}
        </span>
      </div>

      <div className="relative">
        {/* Image with detection boxes */}
        <div
          ref={containerRef}
          className="relative w-full"
          style={{ maxHeight: "800px", overflow: "hidden" }}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{ maxHeight: "800px" }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Uploaded image with detection results"
              className="max-h-[800px] w-auto h-auto object-contain"
            />

            {isPending && (
              <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-zinc-400">
                    Detecting objects...
                  </span>
                </div>
              </div>
            )}

            {runData?.detectionRunItems && imageDimensions.width > 0 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: imageDimensions.top,
                  left: imageDimensions.left,
                  width: imageDimensions.width,
                  height: imageDimensions.height,
                }}
              >
                {/* Detection boxes */}
                {runData.detectionRunItems.map((result) => {
                  const left = result.boundingBox.x;
                  const top = result.boundingBox.y;
                  const width = result.boundingBox.width;
                  const height = result.boundingBox.height;

                  return (
                    <div
                      key={result.id}
                      className={`group absolute border-2 ${
                        selectedDetectionId === result.id
                          ? "border-blue-500 border-3"
                          : "border-green-500"
                      } cursor-pointer transition-colors pointer-events-auto`}
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                      }}
                      onClick={() => setSelectedDetectionId(result.id)}
                    >
                      <div className="group-hover:inline-block z-10 hidden absolute top-0 left-0 transform -translate-y-full bg-background text-primary px-2 py-0.5 text-xs whitespace-nowrap">
                        {result.tarkovItem.shortName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {runData?.detectionRunItems && (
        <div className="bg-zinc-900 p-4">
          <h3 className="font-medium mb-3">Detection Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {runData.detectionRunItems.map((result) => {
              const bestDisplayName =
                result.tarkovItem.name.length > 30
                  ? result.tarkovItem.shortName
                  : result.tarkovItem.name;

              return (
                <div
                  key={result.id}
                  className={`p-3 cursor-pointer ${
                    selectedDetectionId === result.id
                      ? "bg-zinc-700"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  } transition-colors`}
                  onClick={() => setSelectedDetectionId(result.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">
                        {bestDisplayName}
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
