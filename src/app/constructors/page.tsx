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
    <div className="max-w-7xl mx-auto px-2 py-2 sm:px-3">
      <h1 className="mb-2 text-xl font-bold text-text-primary">
        {latestSeason} 赛季车队
      </h1>

      {standings.length === 0 ? (
        <EmptyState message="暂无当前赛季车队" />
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {standings.map((standing) => {
            const constructor = standing.Constructor;
            const displayName = translateConstructorName(constructor.name);

            return (
              <Link
                key={constructor.constructorId}
                href={`/constructors/${constructor.constructorId}`}
                className="group rounded-md border border-border bg-surface p-2 transition-all hover:border-f1-red/50 hover:bg-hover-surface"
              >
                <div className="flex items-center gap-2">
                  <ConstructorLogo
                    src={getConstructorLogoUrl(constructor)}
                    alt={displayName}
                    fallbackText={constructor.name.slice(0, 3).toUpperCase()}
                    size={48}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-base font-bold text-text-primary transition-colors group-hover:text-f1-red">
                      {displayName}
                    </h3>
                    <p className="break-words text-xs text-text-muted">{translateNationality(constructor.nationality)}</p>
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-3">
                      <MiniStat label="排名" value={standing ? `P${standing.position}` : "--"} />
                      <MiniStat label="积分" value={standing?.points ?? "--"} />
                      <MiniStat label="胜场" value={standing?.wins ?? "--"} />
                    </div>
                  </div>
                  <svg
                    className="h-4 w-4 text-text-muted transition-colors group-hover:text-f1-red"
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
      <p className="text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-text-muted">
      {message}
    </div>
  );
}
