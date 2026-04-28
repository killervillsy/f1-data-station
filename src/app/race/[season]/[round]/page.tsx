import DriverHeadshot from "@/components/DriverHeadshot";
import { getDriverHeadshots, getDriverHeadshotUrl } from "@/lib/driver-headshots";
import {
  getQualifyingResults,
  getRaceDisplayTime,
  getRaceResults,
  getSeasonSchedule,
} from "@/lib/f1-api";
import { getRaceWeekendSessions } from "@/lib/race-schedule";
import {
  translateCircuitName,
  translateConstructorName,
  translateCountry,
  translateDriverName,
  translateLocality,
  translateRaceName,
  translateRaceStatus,
} from "@/lib/translations";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import Link from "next/link";

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

export default async function RacePage({
  params,
}: {
  params: Promise<{ season: string; round: string }>;
}) {
  const { season, round } = await params;
  const schedule = await getSeasonSchedule(season);
  const raceIndex = schedule.findIndex((item) => item.round === round);
  const race = schedule[raceIndex];

  if (!race) {
    notFound();
  }

  const [results, qualifyingResults, headshots] = await Promise.all([
    getRaceResults(season, round),
    getQualifyingResults(season, round).catch(() => []),
    getDriverHeadshots(),
  ]);
  const previousRace = schedule[raceIndex - 1];
  const nextRace = schedule[raceIndex + 1];
  const fastest = results.find((result) => result.FastestLap?.rank === "1");
  const fastestDriverName = fastest
    ? translateDriverName(fastest.Driver.givenName, fastest.Driver.familyName)
    : "";
  const weekendSessions = getRaceWeekendSessions(race);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5">
      <div className="mb-4">
        <Link
          href="/schedule"
          className="text-f1-red hover:text-red-400 text-sm mb-3 inline-block"
        >
          ← 返回赛程
        </Link>
        <h1 className="break-words text-2xl font-bold text-text-primary mt-2 sm:text-3xl">{translateRaceName(race.raceName)}</h1>
        <p className="text-text-muted mt-1">{translateCircuitName(race.Circuit.circuitName)}</p>
        <p className="text-text-subtle text-sm">
          {translateLocality(race.Circuit.Location.locality)}, {translateCountry(race.Circuit.Location.country)}
        </p>
        <p className="text-text-subtle text-sm mt-1">
          {format(new Date(race.date), "yyyy年MM月dd日", { locale: zhCN })} · {getRaceDisplayTime(race)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-4 sm:gap-4">
        <StatCard label="回合" value={race.round} />
        <StatCard label="赛季" value={race.season} />
        <StatCard label="参赛" value={results.length || "待公布"} />
        <StatCard label="圈数" value={results[0]?.laps || "待公布"} />
      </div>

      <section className="mb-4 rounded-xl border border-border bg-surface p-3 sm:p-4">
        <h2 className="text-lg font-bold text-text-primary mb-4">周末赛程</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {weekendSessions.map((session) => (
            <div key={session.label} className="rounded-lg bg-surface-muted p-3">
              <p className="text-xs text-text-subtle">{session.label}</p>
              <p className="mt-1 text-sm font-medium text-text-primary">{session.value}</p>
            </div>
          ))}
        </div>
      </section>

      {results.length > 0 ? (
        <RaceResultsTable results={results} />
      ) : (
        <EmptyState title="正赛成绩尚未公布" message="比赛存在于赛程中，但当前还没有可用的正赛结果。" />
      )}

      {qualifyingResults.length > 0 ? (
        <QualifyingTable results={qualifyingResults} />
      ) : (
        <div className="mt-4">
          <EmptyState title="排位赛成绩尚未公布" message="该场比赛暂未返回排位赛结果。" />
        </div>
      )}

      {fastest?.FastestLap && (
        <div className="mt-4 bg-surface rounded-xl p-3 border border-border sm:p-4">
          <h2 className="text-lg font-bold text-text-primary mb-4">最快圈速</h2>
          <div className="flex items-center gap-4">
            <DriverHeadshot
              src={getDriverHeadshotUrl(fastest.Driver, headshots)}
              alt={fastestDriverName}
              fallbackText="FL"
              size={48}
              fallbackClassName="bg-purple-600"
              textClassName="text-white font-bold text-sm"
            />
            <div className="flex-1">
              <p className="text-text-primary font-medium">
                {fastestDriverName}
              </p>
              <p className="text-text-muted text-sm">
                第 {fastest.FastestLap.lap} 圈 · {fastest.FastestLap.Time.time}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
        {previousRace ? (
          <Link
            href={`/race/${previousRace.season}/${previousRace.round}`}
            className="rounded-lg border border-border px-4 py-3 text-center text-text-secondary hover:border-f1-red hover:text-text-primary sm:text-left"
          >
            ← 上一站：{translateRaceName(previousRace.raceName)}
          </Link>
        ) : (
          <span />
        )}
        {nextRace ? (
          <Link
            href={`/race/${nextRace.season}/${nextRace.round}`}
            className="rounded-lg border border-border px-4 py-3 text-center text-text-secondary hover:border-f1-red hover:text-text-primary sm:text-right"
          >
            下一站：{translateRaceName(nextRace.raceName)} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-border text-center">
      <p className="text-text-muted text-sm">{label}</p>
      <p className="text-text-primary font-bold text-2xl">{value}</p>
    </div>
  );
}

function RaceResultsTable({
  results,
}: {
  results: Awaited<ReturnType<typeof getRaceResults>>;
}) {
  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-border">
      <h2 className="text-lg font-bold text-text-primary px-4 py-3 border-b border-border">
        正赛成绩
      </h2>
      <div className="divide-y divide-border sm:hidden">
        {results.map((result) => (
          <RaceResultMobileCard
            key={`${result.position}-${result.Driver.driverId}`}
            result={result}
          />
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <TableHeader>名次</TableHeader>
              <TableHeader className="hidden sm:table-cell">发车</TableHeader>
              <TableHeader className="hidden sm:table-cell">车号</TableHeader>
              <TableHeader>车手</TableHeader>
              <TableHeader className="hidden sm:table-cell">车队</TableHeader>
              <TableHeader align="center" className="hidden sm:table-cell">圈数</TableHeader>
              <TableHeader align="right">时间/状态</TableHeader>
              <TableHeader align="right">积分</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {results.map((result) => (
              <tr key={`${result.position}-${result.Driver.driverId}`} className="hover:bg-hover-surface">
                <td className="px-3 py-2 sm:px-4 sm:py-3">
                  <PositionBadge value={result.positionText || result.position} position={result.position} />
                </td>
                <td className="hidden px-3 py-2 text-text-secondary sm:table-cell sm:px-4 sm:py-3">{result.grid}</td>
                <td className="hidden px-3 py-2 text-text-secondary sm:table-cell sm:px-4 sm:py-3">{result.number}</td>
                <td className="px-3 py-2 sm:px-4 sm:py-3">
                  <Link href={`/drivers/${result.Driver.driverId}`} className="hover:text-f1-red">
                    <p className="text-text-primary font-medium">
                      {translateDriverName(result.Driver.givenName, result.Driver.familyName)}
                    </p>
                    <p className="text-f1-red text-xs">{result.Driver.code}</p>
                  </Link>
                </td>
                <td className="hidden px-3 py-2 sm:table-cell sm:px-4 sm:py-3">
                  <Link
                    href={`/constructors/${result.Constructor.constructorId}`}
                    className="text-text-secondary hover:text-f1-red text-sm"
                  >
                    {translateConstructorName(result.Constructor.name)}
                  </Link>
                </td>
                <td className="hidden px-3 py-2 text-center text-text-secondary sm:table-cell sm:px-4 sm:py-3">{result.laps}</td>
                <td className="px-3 py-2 sm:px-4 sm:py-3 text-right text-text-muted text-sm">
                  {result.Time?.time || <span className="text-red-400">{translateRaceStatus(result.status)}</span>}
                </td>
                <td className="px-3 py-2 sm:px-4 sm:py-3 text-right">
                  <span className="text-text-primary font-bold">{result.points}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RaceResultMobileCard({
  result,
}: {
  result: Awaited<ReturnType<typeof getRaceResults>>[number];
}) {
  return (
    <Link
      href={`/drivers/${result.Driver.driverId}`}
      className="group relative block p-4 transition-colors hover:bg-hover-surface"
    >
      <CardArrow />
      <div className="mb-3 flex items-start gap-3 pr-7">
        <PositionBadge value={result.positionText || result.position} position={result.position} />
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
        <MobileResultField label="发车" value={result.grid} />
        <MobileResultField label="车号" value={result.number} />
        <MobileResultField label="圈数" value={result.laps} />
        <MobileResultField label="时间/状态" value={result.Time?.time || translateRaceStatus(result.status)} />
      </div>
    </Link>
  );
}

function QualifyingTable({
  results,
}: {
  results: Awaited<ReturnType<typeof getQualifyingResults>>;
}) {
  return (
    <div className="mt-4 bg-surface rounded-xl overflow-hidden border border-border">
      <h2 className="text-lg font-bold text-text-primary px-4 py-3 border-b border-border">
        排位赛成绩
      </h2>
      <div className="divide-y divide-border sm:hidden">
        {results.map((result) => (
          <QualifyingMobileCard
            key={`${result.position}-${result.Driver.driverId}`}
            result={result}
          />
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <TableHeader>名次</TableHeader>
              <TableHeader className="hidden sm:table-cell">车号</TableHeader>
              <TableHeader>车手</TableHeader>
              <TableHeader className="hidden sm:table-cell">车队</TableHeader>
              <TableHeader align="right">Q1</TableHeader>
              <TableHeader align="right">Q2</TableHeader>
              <TableHeader align="right">Q3</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {results.map((result) => (
              <tr key={`${result.position}-${result.Driver.driverId}`} className="hover:bg-hover-surface">
                <td className="px-3 py-2 sm:px-4 sm:py-3">
                  <PositionBadge value={result.position} position={result.position} />
                </td>
                <td className="hidden px-3 py-2 text-text-secondary sm:table-cell sm:px-4 sm:py-3">{result.number}</td>
                <td className="px-3 py-2 sm:px-4 sm:py-3">
                  <Link href={`/drivers/${result.Driver.driverId}`} className="hover:text-f1-red">
                    <p className="text-text-primary font-medium">
                      {translateDriverName(result.Driver.givenName, result.Driver.familyName)}
                    </p>
                    <p className="text-f1-red text-xs">{result.Driver.code}</p>
                  </Link>
                </td>
                <td className="hidden px-3 py-2 sm:table-cell sm:px-4 sm:py-3">
                  <Link
                    href={`/constructors/${result.Constructor.constructorId}`}
                    className="text-text-secondary hover:text-f1-red text-sm"
                  >
                    {translateConstructorName(result.Constructor.name)}
                  </Link>
                </td>
                <td className="px-3 py-2 sm:px-4 sm:py-3 text-right text-text-secondary">{result.Q1 || "--"}</td>
                <td className="px-3 py-2 sm:px-4 sm:py-3 text-right text-text-secondary">{result.Q2 || "--"}</td>
                <td className="px-3 py-2 sm:px-4 sm:py-3 text-right text-text-secondary">{result.Q3 || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QualifyingMobileCard({
  result,
}: {
  result: Awaited<ReturnType<typeof getQualifyingResults>>[number];
}) {
  return (
    <Link
      href={`/drivers/${result.Driver.driverId}`}
      className="group relative block p-4 transition-colors hover:bg-hover-surface"
    >
      <CardArrow />
      <div className="mb-3 flex items-start gap-3 pr-7">
        <PositionBadge value={result.position} position={result.position} />
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
          <p className="text-sm text-text-subtle">车号</p>
          <p className="text-lg font-bold text-text-primary">{result.number}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <MobileResultField label="Q1" value={result.Q1 || "--"} />
        <MobileResultField label="Q2" value={result.Q2 || "--"} />
        <MobileResultField label="Q3" value={result.Q3 || "--"} />
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

function CardArrow() {
  return (
    <svg
      aria-hidden="true"
      className="absolute right-4 top-4 h-5 w-5 text-text-muted transition-colors group-hover:text-f1-red"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function TableHeader({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  const alignClass =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <th className={`px-3 py-2 text-xs font-medium text-text-muted uppercase sm:px-4 sm:py-3 ${alignClass} ${className}`}>
      {children}
    </th>
  );
}

function PositionBadge({ value, position }: { value: string; position: string }) {
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
      {value}
    </span>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-text-muted">{message}</p>
    </div>
  );
}
