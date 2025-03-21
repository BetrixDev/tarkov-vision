import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadSearchParams } from "./search-params";
import type { SearchParams } from "nuqs/server";
import { TopNav } from "@/components/top-nav";
import { db } from "@/lib/server/db/db";
import { Footer } from "@/components/footer";
import { DetectionView } from "./components/detection-view";
import { auth as triggerAuth, runs } from "@trigger.dev/sdk/v3";
import { RealtimeListener } from "./components/realtime-listener";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const { run } = await loadSearchParams(searchParams);

  if (!run) {
    return redirect("/");
  }

  const runData = await db.query.detectionRuns.findFirst({
    where: (table, { eq }) => eq(table.id, run),
    with: {
      detectionRunItems: {
        with: {
          tarkovItem: true,
        },
      },
    },
  });

  if (!runData) {
    return redirect("/");
  }

  if (runData.status === "failed") {
    return <div>Detection has failed for this image</div>;
  }

  let triggerRunToken: string | undefined;
  let triggerRunId: string | undefined;

  if (runData.status === "pending") {
    triggerRunToken = await triggerAuth.createPublicToken({
      expirationTime: "1h",
      scopes: {
        read: {
          tags: [`detect_${runData.id}`],
        },
      },
    });

    const associatedRuns = await runs.list({ tag: `detect_${runData.id}` });

    if (associatedRuns.data.length > 0) {
      triggerRunId = associatedRuns.data[0].id;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNav />
      <div className="container px-4 pt-4 mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-primary/75 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </div>
      {triggerRunId !== undefined && triggerRunToken !== undefined && (
        <RealtimeListener runId={triggerRunId} token={triggerRunToken} />
      )}
      <DetectionView
        isPending={runData.status === "pending"}
        imageUrl={runData.imageUrl}
        runData={runData}
      />
      <Footer />
    </div>
  );
}
