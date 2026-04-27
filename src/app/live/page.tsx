import { getF1LiveTimingSnapshot } from "@/lib/f1-live-timing-api";
import LiveTimingClient from "./LiveTimingClient";

export const dynamic = "force-dynamic";
export const revalidate = 10;

export default async function LivePage() {
  const snapshot = await getF1LiveTimingSnapshot(null);

  return <LiveTimingClient initialSnapshot={snapshot} />;
}
