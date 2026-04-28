import Link from "next/link";
import {
  getConstructorStandings,
  getDriverStandings,
  getLastRaceResults,
  getNextRace,
  getRaceDisplayTime,
} from "@/lib/f1-api";
import {
  translateCircuitName,
  translateConstructorName,
  translateCountry,
  translateDriverName,
  translateLocality,
  translateNationality,
  translateRaceName,
  translateRaceStatus,
} from "@/lib/translations";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default async function Home() {
  const [nextRace, lastRace, driverStandings, constructorStandings] =
    await Promise.all([
      getNextRace(),
      getLastRaceResults(),
      getDriverStandings(),
      getConstructorStandings(),
    ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5">
      <section className="mb-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-f1-red to-red-700 p-4 sm:p-5 md:p-6">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              F1 数据站
            </h1>
            <p className="text-white/80 text-lg max-w-2xl">
              实时追踪 F1 赛事数据、积分榜、赛程安排，深入了解每一位车手和车队
            </p>
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="0,100 100,0 100,100" fill="white" />
            </svg>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-f1-red rounded-full" />
          下一场比赛
        </h2>
        {nextRace ? (
          <div className="bg-surface rounded-xl p-3 border border-border sm:p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-f1-red text-sm font-medium mb-1">
                  第 {nextRace.round} 站
                </p>
                <h3 className="text-2xl font-bold text-text-primary">{translateRaceName(nextRace.raceName)}</h3>
                <p className="text-text-muted mt-1">{translateCircuitName(nextRace.Circuit.circuitName)}</p>
                <p className="text-text-subtle text-sm mt-1">
                  {translateLocality(nextRace.Circuit.Location.locality)}, {translateCountry(nextRace.Circuit.Location.country)}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-text-primary text-xl font-semibold">
                  {format(new Date(nextRace.date), "MM月dd日", { locale: zhCN })}
                </p>
                <p className="text-text-muted">{getRaceDisplayTime(nextRace)}</p>
                <Link
                  href={`/race/${nextRace.season}/${nextRace.round}`}
                  className="mt-4 inline-flex rounded-lg bg-f1-red px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  查看详情
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState message="暂无下一场比赛信息" />
        )}
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-f1-red rounded-full" />
          上站成绩
          {lastRace.race && (
            <span className="text-text-muted text-lg font-normal ml-2">
              · {translateRaceName(lastRace.race.raceName)}
            </span>
          )}
        </h2>
        {lastRace.results.length > 0 ? (
          <div className="bg-surface rounded-xl overflow-hidden border border-border">
            <div className="divide-y divide-border sm:hidden">
              {lastRace.results.slice(0, 10).map((result) => (
                <RaceResultMobileCard key={`${result.position}-${result.Driver.driverId}`} result={result} />
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <TableHeader>排名</TableHeader>
                    <TableHeader>车队</TableHeader>
                    <TableHeader>车手</TableHeader>
                    <TableHeader>时间</TableHeader>
                    <TableHeader className="hidden sm:table-cell">最快圈速</TableHeader>
                    <TableHeader className="hidden sm:table-cell">进站</TableHeader>
                    <TableHeader>积分</TableHeader>
                    <TableHeader className="hidden sm:table-cell">起</TableHeader>
                    <TableHeader className="hidden sm:table-cell">停</TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lastRace.results.slice(0, 10).map((result) => (
                    <tr key={`${result.position}-${result.Driver.driverId}`} className="hover:bg-hover-surface">
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <PositionBadge position={result.position} />
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-text-secondary">
                        <Link
                          href={`/constructors/${result.Constructor.constructorId}`}
                          className="hover:text-f1-red"
                        >
                          {translateConstructorName(result.Constructor.name)}
                        </Link>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <Link href={`/drivers/${result.Driver.driverId}`} className="hover:text-f1-red">
                          <span className="text-text-primary font-medium">
                            {translateDriverName(result.Driver.givenName, result.Driver.familyName)}
                          </span>
                          <span className="text-f1-red text-xs ml-2">{result.Driver.code}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-text-muted">
                        {result.Time?.time || translateRaceStatus(result.status)}
                      </td>
                      <td className="hidden px-3 py-2 text-text-muted font-mono text-sm sm:table-cell sm:px-4 sm:py-3">
                        {result.FastestLap?.Time.time ?? "--"}
                      </td>
                      <td className="hidden px-3 py-2 text-text-secondary sm:table-cell sm:px-4 sm:py-3">
                        {formatPitStops(result.pitStops)}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-text-primary font-medium">{result.points}</td>
                      <td className="hidden px-3 py-2 text-text-secondary sm:table-cell sm:px-4 sm:py-3">{formatGridPosition(result.grid)}</td>
                      <td className="hidden px-3 py-2 sm:table-cell sm:px-4 sm:py-3">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span>{formatFinishPosition(result.position)}</span>
                          <PositionChangeLabel grid={result.grid} position={result.position} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState message="暂无上站成绩" />
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StandingsPreview title="车手积分榜" items={driverStandings.slice(0, 5)} type="driver" />
        <StandingsPreview title="车队积分榜" items={constructorStandings.slice(0, 5)} type="constructor" />
      </div>
    </div>
  );
}

function RaceResultMobileCard({
  result,
}: {
  result: Awaited<ReturnType<typeof getLastRaceResults>>["results"][number];
}) {
  const finishChange = <PositionChangeLabel grid={result.grid} position={result.position} />;

  return (
    <Link
      href={`/drivers/${result.Driver.driverId}`}
      className="group relative block p-4 transition-colors hover:bg-hover-surface"
    >
      <svg
        aria-hidden="true"
        className="absolute right-4 top-4 h-5 w-5 text-text-muted transition-colors group-hover:text-f1-red"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>

      <div className="mb-3 flex items-start gap-3 pr-7">
        <PositionBadge position={result.position} />
        <div className="min-w-0 flex-1">
          <p className="break-words text-base font-bold text-text-primary transition-colors group-hover:text-f1-red">
            {translateDriverName(result.Driver.givenName, result.Driver.familyName)}
            <span className="ml-2 text-xs text-f1-red">{result.Driver.code}</span>
          </p>
          <p className="mt-1 block break-words text-sm text-text-muted">
            {translateConstructorName(result.Constructor.name)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm text-text-subtle">积分</p>
          <p className="text-lg font-bold text-text-primary">{result.points}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <MobileResultField label="时间" value={result.Time?.time || translateRaceStatus(result.status)} />
        <MobileResultField label="最快圈速" value={result.FastestLap?.Time.time ?? "--"} />
        <MobileResultField label="进站" value={formatPitStops(result.pitStops)} />
        <MobileResultField label="起" value={formatGridPosition(result.grid)} />
        <div className="rounded-lg bg-surface-muted p-3">
          <p className="text-xs text-text-subtle">停</p>
          <div className="mt-1 flex items-center gap-2 text-text-primary">
            <span className="font-medium">{formatFinishPosition(result.position)}</span>
            {finishChange}
          </div>
        </div>
      </div>
    </Link>
  );
}

function MobileResultField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-muted p-3">
      <p className="text-xs text-text-subtle">{label}</p>
      <p className="mt-1 break-words font-medium text-text-primary">{value}</p>
    </div>
  );
}

function StandingsPreview({
  title,
  items,
  type,
}: {
  title: string;
  items: Awaited<ReturnType<typeof getDriverStandings>> | Awaited<ReturnType<typeof getConstructorStandings>>;
  type: "driver" | "constructor";
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <span className="w-1 h-6 bg-f1-red rounded-full" />
          {title}
        </h2>
        <Link href="/standings" className="text-f1-red hover:text-red-400 text-sm">
          查看全部 →
        </Link>
      </div>
      <div className="bg-surface rounded-xl overflow-hidden border border-border">
        {items.length === 0 ? (
          <div className="p-3 sm:p-4">
            <EmptyState message={`${title}尚未公布`} />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((standing, index) => {
              const isDriver = type === "driver";
              const driverStanding = isDriver ? standing as Awaited<ReturnType<typeof getDriverStandings>>[0] : null;
              const constructorStanding = !isDriver ? standing as Awaited<ReturnType<typeof getConstructorStandings>>[0] : null;
              const href = isDriver
                ? `/drivers/${driverStanding?.Driver.driverId}`
                : `/constructors/${constructorStanding?.Constructor.constructorId}`;
              const titleText = isDriver
                ? driverStanding
                  ? translateDriverName(driverStanding.Driver.givenName, driverStanding.Driver.familyName)
                  : undefined
                : constructorStanding
                  ? translateConstructorName(constructorStanding.Constructor.name)
                  : undefined;
              const subtitle = isDriver
                ? driverStanding?.Constructors[0]
                  ? translateConstructorName(driverStanding.Constructors[0].name)
                  : undefined
                : constructorStanding
                  ? translateNationality(constructorStanding.Constructor.nationality)
                  : undefined;
              const pointsGap = getPointsGapFromPrevious(
                parseStandingPoints(standing.points),
                parseStandingPoints(items[index - 1]?.points)
              );

              return (
                <Link
                  key={href}
                  href={href}
                  className="group relative flex items-center justify-between px-4 py-3 pr-10 hover:bg-hover-surface"
                >
                  <svg
                    aria-hidden="true"
                    className="absolute right-4 top-4 h-4 w-4 text-text-muted transition-colors group-hover:text-f1-red sm:hidden"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <span className="w-6 shrink-0 text-center text-text-muted font-medium">
                      {standing.position}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-text-primary font-medium transition-colors group-hover:text-f1-red">{titleText}</p>
                      <p className="break-words text-text-subtle text-sm">{subtitle}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-text-primary font-bold">{standing.points}</p>
                    <p className="text-text-subtle text-xs">积分</p>
                    <PointsGapLabel gap={pointsGap} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function parseStandingPoints(points: string | undefined): number | null {
  if (!points) return null;

  const value = Number(points);
  return Number.isFinite(value) ? value : null;
}

function parseRacePosition(value: string | undefined): number | null {
  if (!value || value === "0") return null;

  const position = Number(value);
  return Number.isFinite(position) ? position : null;
}

function formatGridPosition(grid: string): string {
  return grid === "0" ? "维修区" : `P${grid}`;
}

function formatFinishPosition(position: string): string {
  return `P${position}`;
}

function formatPitStops(pitStops: number | undefined): string {
  return typeof pitStops === "number" ? String(pitStops) : "--";
}

function PositionChangeLabel({ grid, position }: { grid: string; position: string }) {
  const start = parseRacePosition(grid);
  const finish = parseRacePosition(position);

  if (start === null || finish === null) return null;

  const change = start - finish;
  const tone = change > 0 ? "text-success" : change < 0 ? "text-f1-red" : "text-text-subtle";
  const label = change > 0 ? `+${change}` : change < 0 ? `${change}` : "0";

  return <span className={`text-xs font-semibold ${tone}`}>{label}</span>;
}

function getPointsGapFromPrevious(points: number | null, previousPoints: number | null): number | null {
  if (points === null || previousPoints === null) return null;
  return previousPoints - points;
}

function PointsGapLabel({ gap }: { gap: number | null }) {
  if (gap === null) return null;

  return (
    <p className="mt-0.5 text-xs font-medium text-text-subtle">
      {gap === 0 ? "-0" : `-${gap}`}
    </p>
  );
}

function TableHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

function PositionBadge({ position }: { position: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
        position === "1"
          ? "bg-yellow-500 text-black"
          : position === "2"
            ? "bg-gray-400 text-black"
            : position === "3"
              ? "bg-amber-700 text-white"
              : "bg-surface-muted text-text-primary"
      }`}
    >
      {position}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-text-muted">
      {message}
    </div>
  );
}
