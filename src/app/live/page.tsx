import type { Metadata } from "next";
import { getF1LiveTimingSnapshot } from "@/lib/f1-live-timing-api";
import { localizeLiveTimingSnapshot } from "@/lib/live-snapshot-localization";
import LiveTimingClient from "./LiveTimingClient";

export const metadata: Metadata = {
  title: "实时数据",
  description: "查看 F1 官方实时计时和 OpenF1 数据源提供的赛事排名、圈速与车手遥测。",
  alternates: { canonical: "/live" },
};

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const snapshot = await getF1LiveTimingSnapshot(null);

  return <LiveTimingClient initialSnapshot={localizeLiveTimingSnapshot(snapshot)} />;
}
