import DriverHeadshot from "@/components/DriverHeadshot";
import { getDriverHeadshots, getDriverHeadshotUrl } from "@/lib/driver-headshots";
import { getCurrentDriverEntries, getLatestSeason } from "@/lib/f1-api";
import {
  translateConstructorName,
  translateDriverName,
  translateNationality,
} from "@/lib/translations";
import Link from "next/link";

export const revalidate = 300;

export default async function DriversPage() {
  const [standings, headshots, latestSeason] = await Promise.all([
    getCurrentDriverEntries(),
    getDriverHeadshots(),
    getLatestSeason(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
      <h1 className="text-2xl font-bold text-text-primary mb-4 sm:text-3xl">
        {latestSeason} 赛季车手
      </h1>

      {standings.length === 0 ? (
        <EmptyState message="暂无当前赛季车手" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {standings.map((standing) => {
            const driver = standing.Driver;
            const constructor = standing.Constructors[0];
            const fallbackText = driver.code || driver.familyName.slice(0, 3).toUpperCase();
            const displayName = translateDriverName(driver.givenName, driver.familyName);

            return (
              <Link
                key={driver.driverId}
                href={`/drivers/${driver.driverId}`}
                className="group relative bg-surface rounded-xl p-4 border border-border hover:border-f1-red/50 hover:bg-hover-surface transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <DriverHeadshot
                    src={getDriverHeadshotUrl(driver, headshots)}
                    alt={displayName}
                    fallbackText={fallbackText}
                    size={64}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-text-primary font-bold text-lg leading-tight group-hover:text-f1-red transition-colors sm:text-xl">
                      {displayName}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <InfoRow label="车号" value={driver.permanentNumber ? `#${driver.permanentNumber}` : "--"} />
                  <InfoRow label="国籍" value={translateNationality(driver.nationality)} />
                  <InfoRow label="车队" value={constructor ? translateConstructorName(constructor.name) : "暂无车队"} />
                  <InfoRow label="排名" value={standing ? `P${standing.position}` : "暂无排名"} />
                  <InfoRow label="积分" value={standing ? standing.points : "暂无积分"} />
                </div>
                <ClickHint />
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
    <div className="flex justify-between gap-3">
      <span className="shrink-0 text-text-muted">{label}</span>
      <span className="min-w-0 break-words text-text-primary font-medium text-right">{value}</span>
    </div>
  );
}

function ClickHint() {
  return (
    <svg
      aria-hidden="true"
      className="absolute right-4 top-4 h-6 w-6 text-text-muted transition-colors group-hover:text-f1-red sm:hidden"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center sm:p-8 text-text-muted">
      {message}
    </div>
  );
}
