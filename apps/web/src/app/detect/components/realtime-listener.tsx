"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RealtimeListenerProps = {
  runId: string;
  token: string;
};

export function RealtimeListener({ runId, token }: RealtimeListenerProps) {
  const router = useRouter();

  const { run } = useRealtimeRun(runId, {
    accessToken: token,
  });

  useEffect(() => {
    if (run?.status === "COMPLETED") {
      router.refresh();
    }

    if (run?.status === "FAILED" || run?.status === "CANCELED") {
      router.refresh();
    }
  }, [run]);

  return null;
}
