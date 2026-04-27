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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        {getCurrentSeason()} 积分榜
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-f1-red rounded-full" />
            车手积分榜
          </h2>
          {driverStandings.length === 0 ? (
            <EmptyState message="当前赛季车手积分榜尚未公布" />
          ) : (
            <div className="bg-surface rounded-xl overflow-hidden border border-border">
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
                          <td className="px-3 py-2 sm:px-4 sm:py-3">
                            <PositionBadge position={standing.position} />
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3">
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
                          <td className="px-3 py-2 sm:px-4 sm:py-3 text-text-secondary text-sm">
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
                          <td className="hidden px-3 py-2 text-center text-text-primary sm:table-cell sm:px-4 sm:py-3">{standing.wins}</td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 text-right">
                            <span className="text-text-primary font-bold text-lg">{standing.points}</span>
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
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-f1-red rounded-full" />
            车队积分榜
          </h2>
          {constructorStandings.length === 0 ? (
            <EmptyState message="当前赛季车队积分榜尚未公布" />
          ) : (
            <div className="bg-surface rounded-xl overflow-hidden border border-border">
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
                          <td className="px-3 py-2 sm:px-4 sm:py-3">
                            <PositionBadge position={standing.position} />
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3">
                            <Link
                              href={`/constructors/${standing.Constructor.constructorId}`}
                              className="text-text-primary font-medium hover:text-f1-red"
                            >
                              {translateConstructorName(standing.Constructor.name)}
                            </Link>
                          </td>
                          <td className="hidden px-3 py-2 text-text-secondary text-sm sm:table-cell sm:px-4 sm:py-3">
                            {translateNationality(standing.Constructor.nationality)}
                          </td>
                          <td className="hidden px-3 py-2 text-center text-text-primary sm:table-cell sm:px-4 sm:py-3">{standing.wins}</td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 text-right">
                            <span className="text-text-primary font-bold text-lg">{standing.points}</span>
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
        <PositionBadge position={standing.position} />
        <div className="min-w-0 flex-1">
          <p className="break-words text-base font-bold text-text-primary transition-colors group-hover:text-f1-red">
            {translateDriverName(standing.Driver.givenName, standing.Driver.familyName)}
          </p>
          <p className="mt-1 text-xs text-f1-red">
            {standing.Driver.code} {standing.Driver.permanentNumber ? `#${standing.Driver.permanentNumber}` : ""}
          </p>
          <p className="mt-2 break-words text-sm text-text-muted">
            {constructor ? translateConstructorName(constructor.name) : "--"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm text-text-subtle">积分</p>
          <p className="text-lg font-bold text-text-primary">{standing.points}</p>
          <PointsGapLabel gap={pointsGap} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
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
        <PositionBadge position={standing.position} />
        <div className="min-w-0 flex-1">
          <p className="break-words text-base font-bold text-text-primary transition-colors group-hover:text-f1-red">
            {translateConstructorName(standing.Constructor.name)}
          </p>
          <p className="mt-1 break-words text-sm text-text-muted">
            {translateNationality(standing.Constructor.nationality)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm text-text-subtle">积分</p>
          <p className="text-lg font-bold text-text-primary">{standing.points}</p>
          <PointsGapLabel gap={pointsGap} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <StandingMobileField label="胜场" value={standing.wins} />
        <StandingMobileField label="排名" value={`P${standing.position}`} />
      </div>
    </Link>
  );
}

function StandingMobileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-muted p-3">
      <p className="text-xs text-text-subtle">{label}</p>
      <p className="mt-1 break-words font-medium text-text-primary">{value}</p>
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
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-2 text-xl font-bold text-text-primary">{value}</p>
      {subValue ? <p className="mt-1 text-sm text-text-subtle">{subValue}</p> : null}
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
    <th className={`px-3 py-2 text-xs font-medium text-text-muted uppercase sm:px-4 sm:py-3 ${alignClass} ${className}`}>
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
