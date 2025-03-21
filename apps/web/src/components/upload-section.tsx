"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useUploadThing } from "@/lib/uploadthing";

export function UploadSection() {
  const { startUpload } = useUploadThing("uploadDetectImage");
  const router = useRouter();

  const { data: session } = authClient.useSession();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const { mutate: handleUpload, isPending: isUploading } = useMutation({
    mutationFn: async (file: File) => {
      if (!session) {
        toast.error("Please login to upload an image");
        return;
      }

      const data = await startUpload([file]);

      if (!data) {
        toast.error("Failed to upload image");
        return;
      }

      const runId = data[0].serverData.detectionRunId;

      router.push(`/detect?run=${runId}`);
    },
  });

  return (
    <div className="w-full bg-background/75">
      <div
        className={`border-2 border-dashed p-6 text-center relative overflow-hidden transition-all duration-300 ${
          isDragging
            ? "border-zinc-500 bg-zinc-900/50"
            : isUploading
              ? "border-zinc-700 bg-zinc-900/30"
              : "border-zinc-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center py-2">
            <div className="relative">
              <Loader2 className="h-8 w-8 text-zinc-400 animate-spin mb-2" />
              <div className="absolute inset-0 bg-green-500/20 blur-md animate-pulse"></div>
            </div>
            <p className="text-zinc-400 font-mono">
              <span className="inline-block animate-pulse">
                Uploading image
              </span>
              <span className="inline-block animate-bounce">.</span>
              <span className="inline-block animate-bounce delay-100">.</span>
              <span className="inline-block animate-bounce delay-200">.</span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`relative mb-3  transition-opacity`}>
              <FileUp className="h-8 w-8 text-zinc-500" />
              <div className="absolute inset-0 bg-green-500/10 blur-sm"></div>
            </div>
            <h3 className="text-base font-medium mb-2">
              Upload your Tarkov inventory screenshot
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              Drag and drop an image of your stash, inventory, or loot screen
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors relative overflow-hidden group"
            >
              <span className="relative z-10">Select Image</span>
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-8 grid-rows-8">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-zinc-800/20"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
