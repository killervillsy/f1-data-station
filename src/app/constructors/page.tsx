import ConstructorLogo from "@/components/ConstructorLogo";
import { getConstructorLogoUrl } from "@/lib/constructor-logos";
import {
  getCurrentConstructorEntries,
  getLatestSeason,
} from "@/lib/f1-api";
import {
  translateConstructorName,
  translateNationality,
} from "@/lib/translations";
import Link from "next/link";

export const revalidate = 300;

export default async function ConstructorsPage() {
  const [standings, latestSeason] = await Promise.all([
    getCurrentConstructorEntries(),
    getLatestSeason(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
      <h1 className="text-2xl font-bold text-text-primary mb-4 sm:text-3xl">
        {latestSeason} 赛季车队
      </h1>

      {standings.length === 0 ? (
        <EmptyState message="暂无当前赛季车队" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {standings.map((standing) => {
            const constructor = standing.Constructor;
            const displayName = translateConstructorName(constructor.name);

            return (
              <Link
                key={constructor.constructorId}
                href={`/constructors/${constructor.constructorId}`}
                className="bg-surface rounded-xl p-3 border border-border hover:border-f1-red/50 hover:bg-hover-surface transition-all group sm:p-4"
              >
                <div className="flex items-center gap-4">
                  <ConstructorLogo
                    src={getConstructorLogoUrl(constructor)}
                    alt={displayName}
                    fallbackText={constructor.name.slice(0, 3).toUpperCase()}
                    size={64}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-bold text-text-primary group-hover:text-f1-red transition-colors sm:text-xl">
                      {displayName}
                    </h3>
                    <p className="break-words text-text-muted">{translateNationality(constructor.nationality)}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                      <MiniStat label="排名" value={standing ? `P${standing.position}` : "--"} />
                      <MiniStat label="积分" value={standing?.points ?? "--"} />
                      <MiniStat label="胜场" value={standing?.wins ?? "--"} />
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-text-muted group-hover:text-f1-red transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-text-subtle">{label}</p>
      <p className="font-bold text-text-primary">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center sm:p-8 text-text-muted">
      {message}
    </div>
  );
}
