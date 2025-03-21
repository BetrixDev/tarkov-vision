"use client";

import {
  DetectionResults,
  type DetectionResultsProps,
} from "@/app/detect/components/detection-results";
import ObjectDetails from "@/app/detect/components/object-details";
import { useState } from "react";

type DetectionViewProps = {
  isPending: boolean;
  imageUrl: string;
  runData: DetectionResultsProps["runData"];
};

export function DetectionView(props: DetectionViewProps) {
  const [selectedDetectionId, setSelectedDetectionId] = useState<string>();

  return (
    <section className="container px-4 py-6 mx-auto flex-grow">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DetectionResults
            isPending={props.isPending}
            imageUrl={props.imageUrl}
            runData={props.runData}
            selectedDetectionId={selectedDetectionId}
            setSelectedDetectionId={setSelectedDetectionId}
          />
        </div>
        <div className="lg:col-span-1">
          <ObjectDetails
            selectedDetectionId={selectedDetectionId}
            runData={props.runData}
          />
        </div>
      </div>
    </section>
  );
}
