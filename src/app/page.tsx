import CardArrow from "@/components/CardArrow";
import EmptyState from "@/components/EmptyState";
import MobileInfoField from "@/components/MobileInfoField";
import PositionBadge from "@/components/PositionBadge";
import TableHeader from "@/components/TableHeader";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getConstructorStandings,
  getDriverStandings,
  getLastRaceResults,
  getNextRace,
  getRaceDisplayDate,
  getRaceDisplayTime,
  isRaceInProgress,
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

export const metadata: Metadata = {
  title: "首页",
  description: "查看 F1 下一场比赛、上站成绩、车手积分榜和车队积分榜摘要。",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [nextRace, lastRace, driverStandings, constructorStandings] =
    await Promise.all([
      getNextRace(),
      getLastRaceResults(),
      getDriverStandings(),
      getConstructorStandings(),
    ]);
  const isNextRaceInProgress = nextRace ? isRaceInProgress(nextRace) : false;

  return (
    <div className="max-w-7xl mx-auto px-2 py-2 sm:px-3">
      <section className="mb-2">
        <div className="relative overflow-hidden rounded-md bg-gradient-to-r from-f1-red to-red-700 p-3 sm:p-4">
          <div className="relative z-10">
            <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
              F1 数据站
            </h1>
            <p className="max-w-2xl text-sm text-white/80">
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

      <section className="mb-2">
        <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-text-primary">
          <span className="h-4 w-1 rounded-full bg-f1-red" />
          {isNextRaceInProgress ? "本场比赛" : "下一场比赛"}
        </h2>
        {nextRace ? (
          <div className="rounded-md border border-border bg-surface p-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-1 text-xs font-medium text-f1-red">
                  第 {nextRace.round} 站
                </p>
                <h3 className="text-base font-bold text-text-primary">{translateRaceName(nextRace.raceName)}</h3>
                <p className="mt-0.5 text-xs text-text-muted">{translateCircuitName(nextRace.Circuit.circuitName)}</p>
                <p className="mt-0.5 text-xs text-text-subtle">
                  {translateLocality(nextRace.Circuit.Location.locality)}, {translateCountry(nextRace.Circuit.Location.country)}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-base font-semibold text-text-primary">
                  {getRaceDisplayDate(nextRace, "short")}
                </p>
                <p className="text-xs text-text-muted">{getRaceDisplayTime(nextRace)}</p>
                <Link
                  href={`/race/${nextRace.season}/${nextRace.round}`}
                  className="mt-2 inline-flex rounded-md bg-f1-red px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
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

      <section className="mb-2">
        <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-text-primary">
          <span className="h-4 w-1 rounded-full bg-f1-red" />
          上站成绩
          {lastRace.race && (
            <span className="ml-1.5 text-xs font-normal text-text-muted">
              · {translateRaceName(lastRace.race.raceName)}
            </span>
          )}
        </h2>
        {lastRace.results.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-border bg-surface">
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
                      <td className="px-2 py-1.5">
                        <PositionBadge position={result.position} />
                      </td>
                      <td className="px-2 py-1.5 text-xs text-text-secondary">
                        <Link
                          href={`/constructors/${result.Constructor.constructorId}`}
                          className="hover:text-f1-red"
                        >
                          {translateConstructorName(result.Constructor.name)}
                        </Link>
                      </td>
                      <td className="px-2 py-1.5">
                        <Link href={`/drivers/${result.Driver.driverId}`} className="hover:text-f1-red">
                          <span className="text-text-primary font-medium">
                            {translateDriverName(result.Driver.givenName, result.Driver.familyName)}
                          </span>
                          <span className="text-f1-red text-xs ml-2">{result.Driver.code}</span>
                        </Link>
                      </td>
                      <td className="px-2 py-1.5 text-xs text-text-muted">
                        {result.Time?.time || translateRaceStatus(result.status)}
                      </td>
                      <td className="hidden px-2 py-1.5 font-mono text-xs text-text-muted sm:table-cell">
                        {result.FastestLap?.Time.time ?? "--"}
                      </td>
                      <td className="hidden px-2 py-1.5 text-xs text-text-secondary sm:table-cell">
                        {formatPitStops(result.pitStops)}
                      </td>
                      <td className="px-2 py-1.5 text-xs font-medium text-text-primary">{result.points}</td>
                      <td className="hidden px-2 py-1.5 text-xs text-text-secondary sm:table-cell">{formatGridPosition(result.grid)}</td>
                      <td className="hidden px-2 py-1.5 text-xs sm:table-cell">
                        <div className="flex items-center gap-1.5 text-text-secondary">
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

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
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
      className="group relative block p-2 transition-colors hover:bg-hover-surface"
    >
      <CardArrow className="absolute right-2 top-2" />

      <div className="mb-2 flex items-start gap-2 pr-6">
        <PositionBadge position={result.position} />
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-bold text-text-primary transition-colors group-hover:text-f1-red">
            {translateDriverName(result.Driver.givenName, result.Driver.familyName)}
            <span className="ml-2 text-xs text-f1-red">{result.Driver.code}</span>
          </p>
          <p className="mt-0.5 block break-words text-xs text-text-muted">
            {translateConstructorName(result.Constructor.name)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-text-subtle">积分</p>
          <p className="text-base font-bold text-text-primary">{result.points}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <MobileInfoField label="时间" value={result.Time?.time || translateRaceStatus(result.status)} />
        <MobileInfoField label="最快圈速" value={result.FastestLap?.Time.time ?? "--"} />
        <MobileInfoField label="进站" value={formatPitStops(result.pitStops)} />
        <MobileInfoField label="起" value={formatGridPosition(result.grid)} />
        <MobileInfoField
          label="停"
          value={
            <span className="flex items-center gap-2">
              <span>{formatFinishPosition(result.position)}</span>
              {finishChange}
            </span>
          }
        />
      </div>
    </Link>
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
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-base font-bold text-text-primary">
          <span className="h-4 w-1 rounded-full bg-f1-red" />
          {title}
        </h2>
        <Link href="/standings" className="text-xs text-f1-red hover:text-red-400">
          查看全部 →
        </Link>
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-surface">
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
                  className="group relative flex items-center justify-between px-2 py-1.5 pr-7 hover:bg-hover-surface"
                >
                  <CardArrow className="absolute right-2 top-2 sm:hidden" />
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="w-6 shrink-0 text-center text-text-muted font-medium">
                      {standing.position}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-text-primary font-medium transition-colors group-hover:text-f1-red">{titleText}</p>
                      <p className="break-words text-xs text-text-subtle">{subtitle}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-text-primary">{standing.points}</p>
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

