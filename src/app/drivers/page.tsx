import CardArrow from "@/components/CardArrow";
import type { Metadata } from "next";
import DriverHeadshot from "@/components/DriverHeadshot";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { getDriverHeadshots, getDriverHeadshotUrl } from "@/lib/driver-headshots";
import { getCurrentDriverEntries, getLatestSeason } from "@/lib/f1-api";
import {
  translateConstructorName,
  translateDriverName,
  translateNationality,
} from "@/lib/translations";
import Link from "next/link";

export const metadata: Metadata = {
  title: "车手",
  description: "浏览当前 F1 赛季车手名单、国籍、所属车队、排名和积分。",
  alternates: { canonical: "/drivers" },
};

export const revalidate = 300;

export default async function DriversPage() {
  const [standings, headshots, latestSeason] = await Promise.all([
    getCurrentDriverEntries(),
    getDriverHeadshots(),
    getLatestSeason(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-2 py-2 sm:px-3">
      <PageHeader title={`${latestSeason} 赛季车手`} />

      {standings.length === 0 ? (
        <EmptyState message="暂无当前赛季车手" />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {standings.map((standing) => {
            const driver = standing.Driver;
            const constructor = standing.Constructors[0];
            const fallbackText = driver.code || driver.familyName.slice(0, 3).toUpperCase();
            const displayName = translateDriverName(driver.givenName, driver.familyName);

            return (
              <Link
                key={driver.driverId}
                href={`/drivers/${driver.driverId}`}
                className="group relative rounded-md border border-border bg-surface p-2 transition-all hover:border-f1-red/50 hover:bg-hover-surface"
              >
                <div className="mb-2 flex items-center gap-2">
                  <DriverHeadshot
                    src={getDriverHeadshotUrl(driver, headshots)}
                    alt={displayName}
                    fallbackText={fallbackText}
                    size={48}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-base font-bold leading-tight text-text-primary transition-colors group-hover:text-f1-red">
                      {displayName}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <InfoRow label="车号" value={driver.permanentNumber ? `#${driver.permanentNumber}` : "--"} />
                  <InfoRow label="国籍" value={translateNationality(driver.nationality)} />
                  <InfoRow label="车队" value={constructor ? translateConstructorName(constructor.name) : "暂无车队"} />
                  <InfoRow label="排名" value={standing ? `P${standing.position}` : "暂无排名"} />
                  <InfoRow label="积分" value={standing ? standing.points : "暂无积分"} />
                </div>
                <CardArrow className="absolute right-2 top-2" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="shrink-0 text-text-muted">{label}</span>
      <span className="min-w-0 break-words text-text-primary font-medium text-right">{value}</span>
    </div>
  );
}

