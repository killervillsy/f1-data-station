import {
  getConstructorStandings,
  getCurrentSeason,
  getDriverStandings,
} from "@/lib/f1-api";
import {
  translateConstructorName,
  translateDriverName,
  translateNationality,
} from "@/lib/translations";
import Link from "next/link";

export const revalidate = 300;

export default async function StandingsPage() {
  const [driverStandings, constructorStandings] = await Promise.all([
    getDriverStandings(),
    getConstructorStandings(),
  ]);
  const leadingDriver = driverStandings[0];
  const leadingConstructor = constructorStandings[0];

  return (
    <div className="max-w-7xl mx-auto px-2 py-2 sm:px-3">
      <h1 className="mb-2 text-xl font-bold text-text-primary">
        {getCurrentSeason()} 积分榜
      </h1>

      <div className="mb-2 grid grid-cols-1 gap-1.5 md:grid-cols-3">
        <SummaryCard
          label="领先车手"
          value={
            leadingDriver
              ? translateDriverName(leadingDriver.Driver.givenName, leadingDriver.Driver.familyName)
              : "尚未公布"
          }
          subValue={leadingDriver ? `${leadingDriver.points} 积分` : undefined}
        />
        <SummaryCard
          label="领先车队"
          value={leadingConstructor ? translateConstructorName(leadingConstructor.Constructor.name) : "尚未公布"}
          subValue={leadingConstructor ? `${leadingConstructor.points} 积分` : undefined}
        />
        <SummaryCard
          label="榜单规模"
          value={`${driverStandings.length} 位车手`}
          subValue={`${constructorStandings.length} 支车队`}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-text-primary">
            <span className="h-4 w-1 rounded-full bg-f1-red" />
            车手积分榜
          </h2>
          {driverStandings.length === 0 ? (
            <EmptyState message="当前赛季车手积分榜尚未公布" />
          ) : (
            <div className="overflow-hidden rounded-md border border-border bg-surface">
              <div className="divide-y divide-border sm:hidden">
                {driverStandings.map((standing, index) => (
                  <DriverStandingMobileCard
                    key={standing.Driver.driverId}
                    standing={standing}
                    previousPoints={driverStandings[index - 1]?.points}
                  />
                ))}
              </div>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <TableHeader>#</TableHeader>
                      <TableHeader>车手</TableHeader>
                      <TableHeader>车队</TableHeader>
                      <TableHeader align="center" className="hidden sm:table-cell">胜场</TableHeader>
                      <TableHeader align="right">积分</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {driverStandings.map((standing, index) => {
                      const constructor = standing.Constructors[0];
                      const pointsGap = getPointsGapFromPrevious(
                        parseStandingPoints(standing.points),
                        parseStandingPoints(driverStandings[index - 1]?.points)
                      );

                      return (
                        <tr key={standing.Driver.driverId} className="hover:bg-hover-surface">
                          <td className="px-2 py-1.5">
                            <PositionBadge position={standing.position} />
                          </td>
                          <td className="px-2 py-1.5">
                            <Link
                              href={`/drivers/${standing.Driver.driverId}`}
                              className="hover:text-f1-red"
                            >
                              <p className="break-words text-text-primary font-medium">
                                {translateDriverName(standing.Driver.givenName, standing.Driver.familyName)}
                              </p>
                              <p className="text-f1-red text-xs">
                                {standing.Driver.code} {standing.Driver.permanentNumber ? `#${standing.Driver.permanentNumber}` : ""}
                              </p>
                            </Link>
                          </td>
                          <td className="px-2 py-1.5 text-xs text-text-secondary">
                            {constructor ? (
                              <Link
                                href={`/constructors/${constructor.constructorId}`}
                                className="hover:text-f1-red"
                              >
                                {translateConstructorName(constructor.name)}
                              </Link>
                            ) : (
                              "--"
                            )}
                          </td>
                          <td className="hidden px-2 py-1.5 text-center text-xs text-text-primary sm:table-cell">{standing.wins}</td>
                          <td className="px-2 py-1.5 text-right">
                            <span className="text-sm font-bold text-text-primary">{standing.points}</span>
                            <PointsGapLabel gap={pointsGap} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-text-primary">
            <span className="h-4 w-1 rounded-full bg-f1-red" />
            车队积分榜
          </h2>
          {constructorStandings.length === 0 ? (
            <EmptyState message="当前赛季车队积分榜尚未公布" />
          ) : (
            <div className="overflow-hidden rounded-md border border-border bg-surface">
              <div className="divide-y divide-border sm:hidden">
                {constructorStandings.map((standing, index) => (
                  <ConstructorStandingMobileCard
                    key={standing.Constructor.constructorId}
                    standing={standing}
                    previousPoints={constructorStandings[index - 1]?.points}
                  />
                ))}
              </div>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <TableHeader>#</TableHeader>
                      <TableHeader>车队</TableHeader>
                      <TableHeader className="hidden sm:table-cell">国籍</TableHeader>
                      <TableHeader align="center" className="hidden sm:table-cell">胜场</TableHeader>
                      <TableHeader align="right">积分</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {constructorStandings.map((standing, index) => {
                      const pointsGap = getPointsGapFromPrevious(
                        parseStandingPoints(standing.points),
                        parseStandingPoints(constructorStandings[index - 1]?.points)
                      );

                      return (
                        <tr key={standing.Constructor.constructorId} className="hover:bg-hover-surface">
                          <td className="px-2 py-1.5">
                            <PositionBadge position={standing.position} />
                          </td>
                          <td className="px-2 py-1.5">
                            <Link
                              href={`/constructors/${standing.Constructor.constructorId}`}
                              className="text-text-primary font-medium hover:text-f1-red"
                            >
                              {translateConstructorName(standing.Constructor.name)}
                            </Link>
                          </td>
                          <td className="hidden px-2 py-1.5 text-xs text-text-secondary sm:table-cell">
                            {translateNationality(standing.Constructor.nationality)}
                          </td>
                          <td className="hidden px-2 py-1.5 text-center text-xs text-text-primary sm:table-cell">{standing.wins}</td>
                          <td className="px-2 py-1.5 text-right">
                            <span className="text-sm font-bold text-text-primary">{standing.points}</span>
                            <PointsGapLabel gap={pointsGap} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DriverStandingMobileCard({
  standing,
  previousPoints,
}: {
  standing: Awaited<ReturnType<typeof getDriverStandings>>[number];
  previousPoints?: string;
}) {
  const constructor = standing.Constructors[0];
  const pointsGap = getPointsGapFromPrevious(
    parseStandingPoints(standing.points),
    parseStandingPoints(previousPoints)
  );

  return (
    <Link
      href={`/drivers/${standing.Driver.driverId}`}
      className="group relative block p-2 transition-colors hover:bg-hover-surface"
    >
      <svg
        aria-hidden="true"
        className="absolute right-2 top-2 h-4 w-4 text-text-muted transition-colors group-hover:text-f1-red"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>

      <div className="mb-2 flex items-start gap-2 pr-6">
        <PositionBadge position={standing.position} />
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-bold text-text-primary transition-colors group-hover:text-f1-red">
            {translateDriverName(standing.Driver.givenName, standing.Driver.familyName)}
          </p>
          <p className="mt-1 text-xs text-f1-red">
            {standing.Driver.code} {standing.Driver.permanentNumber ? `#${standing.Driver.permanentNumber}` : ""}
          </p>
          <p className="mt-1 break-words text-xs text-text-muted">
            {constructor ? translateConstructorName(constructor.name) : "--"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-text-subtle">积分</p>
          <p className="text-base font-bold text-text-primary">{standing.points}</p>
          <PointsGapLabel gap={pointsGap} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <StandingMobileField label="胜场" value={standing.wins} />
        <StandingMobileField label="排名" value={`P${standing.position}`} />
      </div>
    </Link>
  );
}

function ConstructorStandingMobileCard({
  standing,
  previousPoints,
}: {
  standing: Awaited<ReturnType<typeof getConstructorStandings>>[number];
  previousPoints?: string;
}) {
  const pointsGap = getPointsGapFromPrevious(
    parseStandingPoints(standing.points),
    parseStandingPoints(previousPoints)
  );

  return (
    <Link
      href={`/constructors/${standing.Constructor.constructorId}`}
      className="group relative block p-2 transition-colors hover:bg-hover-surface"
    >
      <svg
        aria-hidden="true"
        className="absolute right-2 top-2 h-4 w-4 text-text-muted transition-colors group-hover:text-f1-red"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>

      <div className="mb-2 flex items-start gap-2 pr-6">
        <PositionBadge position={standing.position} />
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-bold text-text-primary transition-colors group-hover:text-f1-red">
            {translateConstructorName(standing.Constructor.name)}
          </p>
          <p className="mt-1 break-words text-sm text-text-muted">
            {translateNationality(standing.Constructor.nationality)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-text-subtle">积分</p>
          <p className="text-base font-bold text-text-primary">{standing.points}</p>
          <PointsGapLabel gap={pointsGap} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <StandingMobileField label="胜场" value={standing.wins} />
        <StandingMobileField label="排名" value={`P${standing.position}`} />
      </div>
    </Link>
  );
}

function StandingMobileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-surface-muted p-1.5">
      <p className="text-xs text-text-subtle">{label}</p>
      <p className="mt-0.5 break-words font-medium text-text-primary">{value}</p>
    </div>
  );
}

function parseStandingPoints(points: string | undefined): number | null {
  if (!points) return null;

  const value = Number(points);
  return Number.isFinite(value) ? value : null;
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

function SummaryCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-2">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-base font-bold text-text-primary">{value}</p>
      {subValue ? <p className="mt-0.5 text-xs text-text-subtle">{subValue}</p> : null}
    </div>
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
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <th className={`px-2 py-1.5 text-[10px] font-medium uppercase text-text-muted ${alignClass} ${className}`}>
      {children}
    </th>
  );
}

function PositionBadge({ position }: { position: string }) {
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
      {position}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-text-muted">
      {message}
    </div>
  );
}
