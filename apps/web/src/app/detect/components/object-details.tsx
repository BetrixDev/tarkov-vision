"use client";

import type { DetectionResultsProps } from "./detection-results";

type ObjectDetailsProps = {
  selectedDetectionId?: string;
  runData: DetectionResultsProps["runData"];
};

export default function ObjectDetails({
  selectedDetectionId,
  runData,
}: ObjectDetailsProps) {
  const item = runData?.detectionRunItems.find(
    (item) => item.id === selectedDetectionId
  );

  if (!selectedDetectionId) {
    return (
      <div className="h-full border border-zinc-800 p-6 flex flex-col items-center justify-center text-center sticky top-0">
        <div className="text-zinc-500 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No Object Selected</h3>
        <p className="text-zinc-500 text-sm">
          Click on a detected object in the image to view detailed information
        </p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 overflow-hidden sticky top-0 max-h-[calc(100vh-2rem)] overflow-y-auto z-10">
      <div className="bg-zinc-900 px-4 py-3 sticky top-0 z-10">
        <h3 className="font-medium">{item?.tarkovItem.name}</h3>
      </div>

      <div className="p-4">
        {/* Confidence */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-zinc-400">Confidence</span>
            <span className="text-sm font-medium">100%</span>
          </div>
        </div>

        {/* Properties */}
        {/* <div>
          <h4 className="text-sm text-zinc-400 mb-2">Properties</h4>
          <div className="space-y-2">
            {selectedObject.properties.map((prop, index) => (
              <div
                key={index}
                className="flex justify-between bg-zinc-800 p-2 text-sm"
              >
                <span className="text-zinc-400">{prop.name}</span>
                <span className="font-medium">{prop.value}</span>
              </div>
            ))}
          </div>
        </div> */}

        {/* Market Information */}
        <div className="mt-4">
          <h4 className="text-sm text-zinc-400 mb-2">Market Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between bg-zinc-800 p-2 text-sm">
              <span className="text-zinc-400">Trader Price</span>
              <span className="font-medium">
                ₽{Math.floor(Math.random() * 50000) + 5000}
              </span>
            </div>
            <div className="flex justify-between bg-zinc-800 p-2 text-sm">
              <span className="text-zinc-400">Flea Market</span>
              <span className="font-medium">
                ₽{Math.floor(Math.random() * 100000) + 10000}
              </span>
            </div>
            <div className="flex justify-between bg-zinc-800 p-2 text-sm">
              <span className="text-zinc-400">Required for</span>
              <span className="font-medium">
                {Math.random() > 0.5 ? "Hideout upgrade" : "Quest item"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
