"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const exampleImages = [
  {
    id: 1,
    title: "Player Stash",
    description: "Full stash with various items and equipment",
    detectionRunId: "lq88sf4mlvxcnnsz318z",
    thumbnail: "/placeholder.png",
  },
  {
    id: 2,
    title: "Scav Backpack",
    description: "Inventory screen showing scav backpack contents",
    detectionRunId: "lq88sf4mlvxcnnsz318z",
    thumbnail: "/placeholder.png",
  },
  {
    id: 3,
    title: "Weapon Crate",
    description: "Looted weapon crate with attachments and ammo",
    detectionRunId: "lq88sf4mlvxcnnsz318z",
    thumbnail: "/placeholder.png",
  },
];

export default function ExampleImages() {
  const router = useRouter();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleImageClick = (image: (typeof exampleImages)[0]) => {
    router.push(`/detect?run=${image.detectionRunId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exampleImages.map((image, index) => (
        <div
          key={image.id}
          className="group border border-zinc-800 overflow-hidden cursor-pointer transition-all hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-900/50 relative"
          onClick={() => handleImageClick(image)}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <div className="relative">
            <div className="aspect-[16/9] overflow-hidden">
              <Image
                src={image.thumbnail}
                alt={image.title}
                fill
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
              <span className="text-white text-sm font-medium relative">
                <span className="relative z-10">View detection results</span>
                <div className="absolute inset-0 bg-green-500/20 blur-sm"></div>
              </span>
            </div>
          </div>
          <div className="p-4 border-t border-zinc-800 bg-zinc-900 relative h-full">
            {hoverIndex === index && (
              <div className="absolute left-0 top-0 w-1 h-full bg-green-600"></div>
            )}
            <h3 className="font-medium mb-1">{image.title}</h3>
            <p className="text-sm text-zinc-400">{image.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
