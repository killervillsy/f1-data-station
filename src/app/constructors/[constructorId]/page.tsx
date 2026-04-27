import ConstructorLogo from "@/components/ConstructorLogo";
import { getConstructorLogoUrl } from "@/lib/constructor-logos";
import {
  getCurrentConstructorEntries,
  getCurrentDriverEntries,
} from "@/lib/f1-api";
import {
  translateConstructorName,
  translateDriverName,
  translateNationality,
} from "@/lib/translations";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamicParams = true;
export const revalidate = 300;

export default async function ConstructorPage({
  params,
}: {
  params: Promise<{ constructorId: string }>;
}) {
  const { constructorId } = await params;
  const [constructorStandings, driverStandings] = await Promise.all([
    getCurrentConstructorEntries(),
    getCurrentDriverEntries(),
  ]);
  const constructorStanding = constructorStandings.find(
    (standing) => standing.Constructor.constructorId === constructorId
  );
  const constructor = constructorStanding?.Constructor;

  if (!constructor) {
    notFound();
  }

  const drivers = driverStandings.filter((standing) =>
    standing.Constructors.some((item) => item.constructorId === constructorId)
  );
  const displayName = translateConstructorName(constructor.name);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/constructors" className="text-f1-red hover:text-red-400 text-sm">
          ← 返回车队列表
        </Link>
        <Link href="/standings" className="text-text-muted hover:text-text-primary text-sm">
          查看积分榜
        </Link>
      </div>

      <div className="bg-gradient-to-r from-f1-red to-red-700 rounded-2xl p-5 mb-8 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <ConstructorLogo
            src={getConstructorLogoUrl(constructor)}
            alt={displayName}
            fallbackText={constructor.name.slice(0, 3).toUpperCase()}
            size={96}
            fallbackClassName="bg-white/20"
            textClassName="text-white font-bold text-2xl"
          />
          <div className="flex-1">
            <h1 className="break-words text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              {displayName}
            </h1>
            <p className="text-white/80 mt-1">{translateNationality(constructor.nationality)}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-white/80 text-sm">车队排名</p>
            <p className="text-2xl font-bold text-white">
              {constructorStanding ? `P${constructorStanding.position}` : "暂无排名"}
            </p>
            <p className="text-white/80 text-sm mt-2">
              {constructorStanding ? `${constructorStanding.points} 积分` : "暂无积分记录"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="国籍" value={translateNationality(constructor.nationality)} />
        <StatCard label="胜场" value={constructorStanding?.wins ?? "--"} />
        <StatCard label="积分" value={constructorStanding?.points ?? "--"} />
      </div>

      <section className="bg-surface rounded-xl p-6 border border-border">
        <h2 className="text-lg font-bold text-text-primary mb-4">当前车手</h2>
        {drivers.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {drivers.map((standing) => (
              <Link
                key={standing.Driver.driverId}
                href={`/drivers/${standing.Driver.driverId}`}
                className="rounded-lg border border-border bg-surface-elevated p-4 hover:border-f1-red/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="break-words text-text-primary font-medium">
                      {translateDriverName(standing.Driver.givenName, standing.Driver.familyName)}
                    </p>
                    <p className="text-text-muted text-sm">
                      {standing.Driver.permanentNumber ? `#${standing.Driver.permanentNumber}` : "无固定车号"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-f1-red font-bold">P{standing.position}</p>
                    <p className="text-text-muted text-sm">{standing.points} 分</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-text-muted">当前赛季暂无车手信息。</p>
        )}
      </section>

      <div className="mt-6 text-center">
        <a
          href={constructor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-f1-red hover:text-red-400 text-sm"
        >
          查看维基百科 →
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-border text-center">
      <p className="text-text-muted text-sm">{label}</p>
      <p className="text-text-primary font-bold text-xl mt-1">{value}</p>
    </div>
  );
}
