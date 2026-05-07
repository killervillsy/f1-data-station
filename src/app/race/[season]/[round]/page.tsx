import CardArrow from "@/components/CardArrow";
import DriverHeadshot from "@/components/DriverHeadshot";
import EmptyState from "@/components/EmptyState";
import MobileInfoField from "@/components/MobileInfoField";
import PositionBadge from "@/components/PositionBadge";
import StatCard from "@/components/StatCard";
import TableHeader from "@/components/TableHeader";
import { getDriverHeadshots, getDriverHeadshotUrl } from "@/lib/driver-headshots";
import {
  getCurrentSeasonSchedule,
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
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const schedule = await getCurrentSeasonSchedule();

    return schedule.map((race) => ({
      season: race.season,
      round: race.round,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ season: string; round: string }>;
}): Promise<Metadata> {
  const { season, round } = await params;
  const schedule = await getSeasonSchedule(season);
  const race = schedule.find((item) => item.round === round);

  if (!race) {
    return {
      title: `${season} 赛季第 ${round} 站`,
      description: "查看 F1 分站比赛信息、赛程安排、排位赛、冲刺赛和正赛结果。",
    };
  }

  const raceName = translateRaceName(race.raceName);
  const circuitName = translateCircuitName(race.Circuit.circuitName);
  const location = `${translateLocality(race.Circuit.Location.locality)}, ${translateCountry(race.Circuit.Location.country)}`;

  return {
    title: `${season} ${raceName}`,
    description: `查看 ${season} 赛季第 ${round} 站 ${raceName} 的赛程、${circuitName} 赛道信息、排位赛、冲刺赛和正赛结果。比赛地点：${location}。`,
    alternates: { canonical: `/race/${season}/${round}` },
  };
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
  const resultSessions = getResultSessions(weekendSessions);

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
        <StatCard align="center" label="回合" value={race.round} />
        <StatCard align="center" label="赛季" value={race.season} />
        <StatCard align="center" label="参赛" value={results.length || "待公布"} />
        <StatCard align="center" label="圈数" value={results[0]?.laps || "待公布"} />
      </div>

      <section className="mb-2 rounded-md border border-border bg-surface p-2">
        <h2 className="mb-2 text-base font-bold text-text-primary">周末赛程</h2>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
          {weekendSessions.map((session) => {
            const hasResults = resultSessions.some((item) => item.type === session.type);

            return (
              <Link
                key={session.label}
                href={hasResults ? `#${session.type}` : `/race/${season}/${round}`}
                className={`rounded border p-1.5 transition-colors ${
                  hasResults
                    ? "border-f1-red/40 bg-f1-red/10 hover:border-f1-red"
                    : "border-transparent bg-surface-muted"
                }`}
              >
                <p className={hasResults ? "text-xs text-f1-red" : "text-xs text-text-subtle"}>{session.label}</p>
                <p className="mt-0.5 text-xs font-medium text-text-primary">{session.value}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="space-y-2">
        {resultSessions.map((session) => (
          <SessionResultsSection
            key={session.type}
            session={session}
            raceResults={results}
            qualifyingResults={qualifyingResults}
            sprintResults={sprintResults}
          />
        ))}
      </div>

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

function getResultSessions(sessions: RaceWeekendSession[]): RaceWeekendSession[] {
  const supportedSessions = sessions.filter((session) => session.supportsResults);
  const raceSession = sessions.find((session) => session.type === "race");

  if (supportedSessions.length > 0) return supportedSessions.reverse();
  return raceSession ? [raceSession] : sessions.slice(0, 1);
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
  const sectionId = session.type;

  switch (session.type) {
    case "race":
      return raceResults.length > 0 ? (
        <RaceResultsTable id={sectionId} results={raceResults} />
      ) : (
        <EmptyState title="正赛成绩尚未公布" message="比赛存在于赛程中，但当前还没有可用的正赛结果。" />
      );
    case "qualifying":
      return qualifyingResults.length > 0 ? (
        <QualifyingTable id={sectionId} results={qualifyingResults} />
      ) : (
        <EmptyState title="排位赛成绩尚未公布" message="该场比赛暂未返回排位赛结果。" />
      );
    case "sprint":
      return sprintResults.length > 0 ? (
        <RaceResultsTable id={sectionId} title="冲刺赛成绩" results={sprintResults} />
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
  id,
  results,
  title = "正赛成绩",
}: {
  id?: string;
  results: Awaited<ReturnType<typeof getRaceResults>>;
  title?: string;
}) {
  return (
    <div id={id} className="scroll-mt-12 overflow-hidden rounded-md border border-border bg-surface">
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
      <CardArrow className="absolute right-2 top-2" />
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
        <MobileInfoField label="发车" value={result.grid} />
        <MobileInfoField label="车号" value={result.number} />
        <MobileInfoField label="圈数" value={result.laps} />
        <MobileInfoField label="时间/状态" value={result.Time?.time || translateRaceStatus(result.status)} />
      </div>
    </Link>
  );
}

function QualifyingTable({
  id,
  results,
  title = "排位赛成绩",
}: {
  id?: string;
  results: Awaited<ReturnType<typeof getQualifyingResults>>;
  title?: string;
}) {
  return (
    <div id={id} className="scroll-mt-12 overflow-hidden rounded-md border border-border bg-surface">
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
      <CardArrow className="absolute right-2 top-2" />
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
        <MobileInfoField label="Q1" value={result.Q1 || "--"} />
        <MobileInfoField label="Q2" value={result.Q2 || "--"} />
        <MobileInfoField label="Q3" value={result.Q3 || "--"} />
      </div>
    </Link>
  );
}

