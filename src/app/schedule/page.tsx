import { getCalendarChanges } from "@/lib/calendar-changes";
import {
  classifyRaceStatus,
  getCurrentSeason,
  getCurrentSeasonSchedule,
  getRaceDisplayDate,
  getRaceDisplayTime,
  isRaceInProgress,
  type RaceStatus,
} from "@/lib/f1-api";
import { getRaceWeekendSessions } from "@/lib/race-schedule";
import type { Race } from "@/types/f1";
import {
  translateCircuitName,
  translateCountry,
  translateLocality,
  translateRaceName,
} from "@/lib/translations";
import Link from "next/link";

export const revalidate = 300;

export default async function SchedulePage() {
  const season = getCurrentSeason();
  const races = await getCurrentSeasonSchedule();
  const calendarChanges = getCalendarChanges(season);
  const grouped = races.reduce(
    (acc, race) => {
      acc[classifyRaceStatus(race)].push(race);
      return acc;
    },
    { completed: [], today: [], upcoming: [] } as Record<
      RaceStatus,
      Awaited<ReturnType<typeof getCurrentSeasonSchedule>>
    >
  );

  return (
    <div className="max-w-7xl mx-auto px-2 py-2 sm:px-3">
      <h1 className="mb-2 text-xl font-bold text-text-primary">
        {season} 赛季赛程
      </h1>

      <div className="mb-2 grid grid-cols-2 gap-1.5 md:grid-cols-4">
        <StatCard label="总场次" value={races.length} />
        <StatCard label="已完成" value={grouped.completed.length} />
        <StatCard label="剩余场次" value={grouped.upcoming.length} />
        <StatCard label="今日赛事" value={grouped.today.length} accent />
      </div>

      {calendarChanges.length > 0 ? <CalendarChanges changes={calendarChanges} /> : null}

      {races.length === 0 ? (
        <EmptyState message="暂无当前赛季赛程" />
      ) : (
        <>
          {grouped.today.length > 0 && (
            <RaceSection title="今日 / 进行中" tone="red" races={grouped.today} />
          )}

          {grouped.upcoming.length > 0 && (
            <RaceSection title="即将进行" tone="red" races={grouped.upcoming} />
          )}

          {grouped.completed.length > 0 && (
            <RaceSection
              title="已完成"
              tone="gray"
              races={[...grouped.completed].reverse()}
            />
          )}
        </>
      )}
    </div>
  );
}

function CalendarChanges({
  changes,
}: {
  changes: ReturnType<typeof getCalendarChanges>;
}) {
  return (
    <section className="mb-2 rounded-md border border-border bg-surface p-2">
      <h2 className="mb-2 text-base font-bold text-text-primary">赛历变动</h2>
      <div className="grid gap-1.5 md:grid-cols-2">
        {changes.map((change) => (
          <div key={change.title} className="rounded bg-surface-muted p-2">
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                change.type === "added"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {change.type === "added" ? "新增" : "取消"}
            </span>
            <h3 className="mt-2 text-sm font-bold text-text-primary">{change.title}</h3>
            <p className="mt-0.5 text-xs leading-5 text-text-muted">{change.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-2">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`text-lg font-bold ${accent ? "text-f1-red" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

function RaceSection({
  title,
  tone,
  races,
}: {
  title: string;
  tone: "red" | "gray";
  races: Awaited<ReturnType<typeof getCurrentSeasonSchedule>>;
}) {
  return (
    <section className="mb-3">
      <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-text-primary">
        <span
          className={`h-4 w-1 rounded-full ${
            tone === "red" ? "bg-f1-red" : "bg-gray-500"
          }`}
        />
        {title}
      </h2>
      <div className="grid gap-1.5">
        {races.map((race) => (
          <RaceCard key={race.round} race={race} status={classifyRaceStatus(race)} />
        ))}
      </div>
    </section>
  );
}

function RaceCard({
  race,
  status,
}: {
  race: Awaited<ReturnType<typeof getCurrentSeasonSchedule>>[0];
  status: RaceStatus;
}) {
  const isInProgress = isRaceInProgress(race);
  const isActive = status === "today" || status === "upcoming";
  const statusLabel = isInProgress
    ? "正在进行"
    : status === "completed"
      ? "已完成"
      : status === "today"
        ? "今日赛事"
        : "即将进行";
  const statusClassName = isInProgress
    ? "bg-f1-red text-white"
    : "bg-surface-muted text-text-secondary";

  return (
    <div
      className={`rounded-md border bg-surface p-2 ${
        isActive ? "border-f1-red/50" : "border-border"
      } transition-colors hover:bg-hover-surface`}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-32 md:w-36">
          <span
            className={`w-7 shrink-0 text-center text-2xl font-bold ${
              isActive ? "text-f1-red" : "text-text-subtle"
            }`}
          >
            {race.round}
          </span>
          <span className={`w-18 whitespace-nowrap rounded-full px-2 py-1 text-center text-[11px] ${statusClassName}`}>
            {statusLabel}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-bold text-text-primary">{translateRaceName(race.raceName)}</h3>
          <p className="break-words text-xs text-text-muted">{translateCircuitName(race.Circuit.circuitName)}</p>
          <p className="text-xs text-text-subtle">
            {translateLocality(race.Circuit.Location.locality)}, {translateCountry(race.Circuit.Location.country)}
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-sm font-medium text-text-primary">
            {getRaceDisplayDate(race)}
          </p>
          <p className="text-xs text-text-muted">正赛 {getRaceDisplayTime(race)}</p>
        </div>

        <Link
          href={`/race/${race.season}/${race.round}`}
          className="w-full rounded-md bg-f1-red px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-red-700 md:w-auto"
        >
          查看详情
        </Link>
      </div>

      <RaceWeekendSchedule race={race} />
    </div>
  );
}

function RaceWeekendSchedule({ race }: { race: Race }) {
  const sessions = getRaceWeekendSessions(race);

  return (
    <div className="mt-2 grid gap-1.5 border-t border-border/60 pt-2 sm:grid-cols-2 lg:grid-cols-4">
      {sessions.map((session) => (
        <div key={session.label} className="rounded bg-surface-muted p-1.5">
          <p className="text-[11px] text-text-subtle">{session.label}</p>
          <p className="mt-0.5 text-xs font-medium text-text-primary">{session.value}</p>
        </div>
      ))}
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
