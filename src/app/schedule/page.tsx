import {
  classifyRaceStatus,
  getCurrentSeason,
  getCurrentSeasonSchedule,
  getRaceDisplayTime,
  type RaceStatus,
} from "@/lib/f1-api";
import {
  translateCircuitName,
  translateCountry,
  translateLocality,
  translateRaceName,
} from "@/lib/translations";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import Link from "next/link";

export const revalidate = 300;

export default async function SchedulePage() {
  const races = await getCurrentSeasonSchedule();
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
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6 sm:text-3xl sm:mb-8">
        {getCurrentSeason()} 赛季赛程
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="总场次" value={races.length} />
        <StatCard label="已完成" value={grouped.completed.length} />
        <StatCard label="剩余场次" value={grouped.upcoming.length} />
        <StatCard label="今日赛事" value={grouped.today.length} accent />
      </div>

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
    <div className="bg-surface rounded-xl p-3 border border-border sm:p-4">
      <p className="text-text-muted text-sm">{label}</p>
      <p className={`text-xl font-bold sm:text-2xl ${accent ? "text-f1-red" : "text-text-primary"}`}>
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
    <section className="mb-12">
      <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <span
          className={`w-1 h-6 rounded-full ${
            tone === "red" ? "bg-f1-red" : "bg-gray-500"
          }`}
        />
        {title}
      </h2>
      <div className="grid gap-4">
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
  const isActive = status === "today" || status === "upcoming";
  const statusLabel =
    status === "completed" ? "已完成" : status === "today" ? "今日赛事" : "即将进行";

  return (
    <div
      className={`bg-surface rounded-xl p-5 border ${
        isActive ? "border-f1-red/50" : "border-border"
      } hover:bg-hover-surface transition-colors`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex w-full shrink-0 items-center gap-3 sm:w-36 md:w-40">
          <span
            className={`w-8 shrink-0 text-center text-3xl font-bold ${
              isActive ? "text-f1-red" : "text-text-subtle"
            }`}
          >
            {race.round}
          </span>
          <span className="w-20 whitespace-nowrap rounded-full bg-surface-muted px-3 py-1 text-center text-xs text-text-secondary">
            {statusLabel}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-bold text-text-primary">{translateRaceName(race.raceName)}</h3>
          <p className="break-words text-text-muted text-sm">{translateCircuitName(race.Circuit.circuitName)}</p>
          <p className="text-text-subtle text-sm">
            {translateLocality(race.Circuit.Location.locality)}, {translateCountry(race.Circuit.Location.country)}
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-text-primary font-medium">
            {format(new Date(race.date), "yyyy年MM月dd日", { locale: zhCN })}
          </p>
          <p className="text-text-muted text-sm">{getRaceDisplayTime(race)}</p>
        </div>

        <Link
          href={`/race/${race.season}/${race.round}`}
          className="w-full px-4 py-2 bg-f1-red hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors text-center md:w-auto"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center text-text-muted">
      {message}
    </div>
  );
}
