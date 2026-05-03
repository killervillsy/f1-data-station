import DriverHeadshot from "@/components/DriverHeadshot";
import { getDriverHeadshots, getDriverHeadshotUrl } from "@/lib/driver-headshots";
import {
  getQualifyingResults,
  getRaceDisplayDate,
  getRaceDisplayTime,
  getRaceResults,
  getSeasonSchedule,
  getSprintResults,
} from "@/lib/f1-api";
import { getRaceWeekendSessions, type RaceWeekendSession } from "@/lib/race-schedule";
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
import Link from "next/link";

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

export default async function RacePage({
  params,
  searchParams,
}: {
  params: Promise<{ season: string; round: string }>;
  searchParams: Promise<{ session?: string | string[] }>;
}) {
  const { season, round } = await params;
  const selectedSessionParam = (await searchParams).session;
  const selectedSessionType = Array.isArray(selectedSessionParam)
    ? selectedSessionParam[0]
    : selectedSessionParam;
  const schedule = await getSeasonSchedule(season);
  const raceIndex = schedule.findIndex((item) => item.round === round);
  const race = schedule[raceIndex];

  if (!race) {
    notFound();
  }

  const [results, qualifyingResults, sprintResults, headshots] = await Promise.all([
    getRaceResults(season, round).catch(() => []),
    getQualifyingResults(season, round).catch(() => []),
    getSprintResults(season, round).catch(() => []),
    getDriverHeadshots(),
  ]);
  const previousRace = schedule[raceIndex - 1];
  const nextRace = schedule[raceIndex + 1];
  const fastest = results.find((result) => result.FastestLap?.rank === "1");
  const fastestDriverName = fastest
    ? translateDriverName(fastest.Driver.givenName, fastest.Driver.familyName)
    : "";
  const weekendSessions = getRaceWeekendSessions(race);
  const selectedSession = getSelectedSession(
    weekendSessions,
    selectedSessionType,
    results,
    qualifyingResults,
    sprintResults
  );

  return (
    <div className="max-w-6xl mx-auto px-2 py-2 sm:px-3">
      <div className="mb-2">
        <Link
          href="/schedule"
          className="mb-1.5 inline-block text-xs text-f1-red hover:text-red-400"
        >
          ← 返回赛程
        </Link>
        <h1 className="mt-1 break-words text-xl font-bold text-text-primary">{translateRaceName(race.raceName)}</h1>
        <p className="mt-0.5 text-xs text-text-muted">{translateCircuitName(race.Circuit.circuitName)}</p>
        <p className="text-xs text-text-subtle">
          {translateLocality(race.Circuit.Location.locality)}, {translateCountry(race.Circuit.Location.country)}
        </p>
        <p className="mt-0.5 text-xs text-text-subtle">
          {getRaceDisplayDate(race)} · {getRaceDisplayTime(race)}
        </p>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-1.5 md:grid-cols-4">
        <StatCard label="回合" value={race.round} />
        <StatCard label="赛季" value={race.season} />
        <StatCard label="参赛" value={results.length || "待公布"} />
        <StatCard label="圈数" value={results[0]?.laps || "待公布"} />
      </div>

      <section className="mb-2 rounded-md border border-border bg-surface p-2">
        <h2 className="mb-2 text-base font-bold text-text-primary">周末赛程</h2>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
          {weekendSessions.map((session) => {
            const isSelected = session.type === selectedSession.type;

            return (
              <Link
                key={session.label}
                href={`/race/${season}/${round}?session=${session.type}`}
                className={`rounded border p-1.5 transition-colors ${
                  isSelected
                    ? "border-f1-red bg-f1-red/10"
                    : "border-transparent bg-surface-muted hover:border-f1-red/60"
                }`}
              >
                <p className={isSelected ? "text-xs text-f1-red" : "text-xs text-text-subtle"}>{session.label}</p>
                <p className="mt-0.5 text-xs font-medium text-text-primary">{session.value}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <SessionResultsSection
        session={selectedSession}
        raceResults={results}
        qualifyingResults={qualifyingResults}
        sprintResults={sprintResults}
      />

      {fastest?.FastestLap && (
        <div className="mt-2 rounded-md border border-border bg-surface p-2">
          <h2 className="mb-2 text-base font-bold text-text-primary">最快圈速</h2>
          <div className="flex items-center gap-2">
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
            className="rounded-md border border-border px-3 py-1.5 text-center text-xs text-text-secondary hover:border-f1-red hover:text-text-primary sm:text-left"
          >
            ← 上一站：{translateRaceName(previousRace.raceName)}
          </Link>
        ) : (
          <span />
        )}
        {nextRace ? (
          <Link
            href={`/race/${nextRace.season}/${nextRace.round}`}
            className="rounded-md border border-border px-3 py-1.5 text-center text-xs text-text-secondary hover:border-f1-red hover:text-text-primary sm:text-right"
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
    <div className="rounded-md border border-border bg-surface p-2 text-center">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-lg font-bold text-text-primary">{value}</p>
    </div>
  );
}

function getSelectedSession(
  sessions: RaceWeekendSession[],
  selectedType: string | undefined,
  raceResults: Awaited<ReturnType<typeof getRaceResults>>,
  qualifyingResults: Awaited<ReturnType<typeof getQualifyingResults>>,
  sprintResults: Awaited<ReturnType<typeof getSprintResults>>
): RaceWeekendSession {
  if (selectedType) {
    const selected = sessions.find((session) => session.type === selectedType);
    if (selected) return selected;
  }

  const hasResults = (type: string) => {
    switch (type) {
      case "race":
        return raceResults.length > 0;
      case "qualifying":
        return qualifyingResults.length > 0;
      case "sprint":
        return sprintResults.length > 0;
      default:
        return false;
    }
  };

  const sessionsWithResults = sessions
    .filter((session) => session.supportsResults && hasResults(session.type))
    .reverse();

  return (
    sessionsWithResults[0] ??
    sessions.find((session) => session.type === "race") ??
    sessions[0]
  );
}

function SessionResultsSection({
  session,
  raceResults,
  qualifyingResults,
  sprintResults,
}: {
  session: RaceWeekendSession;
  raceResults: Awaited<ReturnType<typeof getRaceResults>>;
  qualifyingResults: Awaited<ReturnType<typeof getQualifyingResults>>;
  sprintResults: Awaited<ReturnType<typeof getSprintResults>>;
}) {
  switch (session.type) {
    case "race":
      return raceResults.length > 0 ? (
        <RaceResultsTable results={raceResults} />
      ) : (
        <EmptyState title="正赛成绩尚未公布" message="比赛存在于赛程中，但当前还没有可用的正赛结果。" />
      );
    case "qualifying":
      return qualifyingResults.length > 0 ? (
        <QualifyingTable results={qualifyingResults} />
      ) : (
        <EmptyState title="排位赛成绩尚未公布" message="该场比赛暂未返回排位赛结果。" />
      );
    case "sprint":
      return sprintResults.length > 0 ? (
        <RaceResultsTable title="冲刺赛成绩" results={sprintResults} />
      ) : (
        <EmptyState title="冲刺赛成绩尚未公布" message="该场比赛暂未返回冲刺赛结果。" />
      );
    case "sprintQualifying":
      return <EmptyState title="冲刺排位成绩暂不可用" message="当前数据源暂未提供冲刺排位成绩。" />;
    case "practice1":
    case "practice2":
    case "practice3":
      return <EmptyState title={`${session.label}成绩暂不可用`} message="当前数据源暂未提供练习赛成绩。" />;
  }
}

function RaceResultsTable({
  results,
  title = "正赛成绩",
}: {
  results: Awaited<ReturnType<typeof getRaceResults>>;
  title?: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <h2 className="border-b border-border px-2 py-1.5 text-base font-bold text-text-primary">
        {title}
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
                <td className="px-2 py-1.5">
                  <PositionBadge value={result.positionText || result.position} position={result.position} />
                </td>
                <td className="hidden px-2 py-1.5 text-xs text-text-secondary sm:table-cell">{result.grid}</td>
                <td className="hidden px-2 py-1.5 text-xs text-text-secondary sm:table-cell">{result.number}</td>
                <td className="px-2 py-1.5">
                  <Link href={`/drivers/${result.Driver.driverId}`} className="hover:text-f1-red">
                    <p className="text-text-primary font-medium">
                      {translateDriverName(result.Driver.givenName, result.Driver.familyName)}
                    </p>
                    <p className="text-f1-red text-xs">{result.Driver.code}</p>
                  </Link>
                </td>
                <td className="hidden px-2 py-1.5 sm:table-cell">
                  <Link
                    href={`/constructors/${result.Constructor.constructorId}`}
                    className="text-xs text-text-secondary hover:text-f1-red"
                  >
                    {translateConstructorName(result.Constructor.name)}
                  </Link>
                </td>
                <td className="hidden px-2 py-1.5 text-center text-xs text-text-secondary sm:table-cell">{result.laps}</td>
                <td className="px-2 py-1.5 text-right text-xs text-text-muted">
                  {result.Time?.time || <span className="text-red-400">{translateRaceStatus(result.status)}</span>}
                </td>
                <td className="px-2 py-1.5 text-right">
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
      className="group relative block p-2 transition-colors hover:bg-hover-surface"
    >
      <CardArrow />
      <div className="mb-2 flex items-start gap-2 pr-6">
        <PositionBadge value={result.positionText || result.position} position={result.position} />
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
  title = "排位赛成绩",
}: {
  results: Awaited<ReturnType<typeof getQualifyingResults>>;
  title?: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <h2 className="border-b border-border px-2 py-1.5 text-base font-bold text-text-primary">
        {title}
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
                <td className="px-2 py-1.5">
                  <PositionBadge value={result.position} position={result.position} />
                </td>
                <td className="hidden px-2 py-1.5 text-xs text-text-secondary sm:table-cell">{result.number}</td>
                <td className="px-2 py-1.5">
                  <Link href={`/drivers/${result.Driver.driverId}`} className="hover:text-f1-red">
                    <p className="text-text-primary font-medium">
                      {translateDriverName(result.Driver.givenName, result.Driver.familyName)}
                    </p>
                    <p className="text-f1-red text-xs">{result.Driver.code}</p>
                  </Link>
                </td>
                <td className="hidden px-2 py-1.5 sm:table-cell">
                  <Link
                    href={`/constructors/${result.Constructor.constructorId}`}
                    className="text-xs text-text-secondary hover:text-f1-red"
                  >
                    {translateConstructorName(result.Constructor.name)}
                  </Link>
                </td>
                <td className="px-2 py-1.5 text-right text-xs text-text-secondary">{result.Q1 || "--"}</td>
                <td className="px-2 py-1.5 text-right text-xs text-text-secondary">{result.Q2 || "--"}</td>
                <td className="px-2 py-1.5 text-right text-xs text-text-secondary">{result.Q3 || "--"}</td>
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
      className="group relative block p-2 transition-colors hover:bg-hover-surface"
    >
      <CardArrow />
      <div className="mb-2 flex items-start gap-2 pr-6">
        <PositionBadge value={result.position} position={result.position} />
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
          <p className="text-xs text-text-subtle">车号</p>
          <p className="text-base font-bold text-text-primary">{result.number}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-xs">
        <MobileResultField label="Q1" value={result.Q1 || "--"} />
        <MobileResultField label="Q2" value={result.Q2 || "--"} />
        <MobileResultField label="Q3" value={result.Q3 || "--"} />
      </div>
    </Link>
  );
}

function MobileResultField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-surface-muted p-1.5">
      <p className="text-xs text-text-subtle">{label}</p>
      <p className="mt-0.5 break-words font-medium text-text-primary">{value}</p>
    </div>
  );
}

function CardArrow() {
  return (
    <svg
      aria-hidden="true"
      className="absolute right-2 top-2 h-4 w-4 text-text-muted transition-colors group-hover:text-f1-red"
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
    <th className={`px-2 py-1.5 text-[10px] font-medium uppercase text-text-muted ${alignClass} ${className}`}>
      {children}
    </th>
  );
}

function PositionBadge({ value, position }: { value: string; position: string }) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
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
    <div className="rounded-md border border-dashed border-border bg-surface p-4 text-center">
      <h2 className="text-base font-bold text-text-primary">{title}</h2>
      <p className="mt-1 text-xs text-text-muted">{message}</p>
    </div>
  );
}
