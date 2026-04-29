import ConstructorLogo from "@/components/ConstructorLogo";
import DriverHeadshot from "@/components/DriverHeadshot";
import { getConstructorLogoUrl } from "@/lib/constructor-logos";
import { getDriverHeadshots, getDriverHeadshotUrl } from "@/lib/driver-headshots";
import { getDriverProfile, getZodiacSign } from "@/lib/driver-profiles";
import { getCurrentDriverEntries, getLatestSeason } from "@/lib/f1-api";
import {
  translateConstructorName,
  translateDriverName,
  translateNationality,
} from "@/lib/translations";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

export default async function DriverPage({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = await params;
  const [standings, headshots, latestSeason] = await Promise.all([
    getCurrentDriverEntries(),
    getDriverHeadshots(),
    getLatestSeason(),
  ]);
  const driverStanding = standings.find((standing) => standing.Driver.driverId === driverId);
  const driver = driverStanding?.Driver;

  if (!driver) {
    notFound();
  }

  const currentConstructor = driverStanding?.Constructors[0];
  const profile = getDriverProfile(driver.driverId);
  const fallbackText = driver.code || driver.familyName.slice(0, 3).toUpperCase();
  const displayName = translateDriverName(driver.givenName, driver.familyName);
  const birthDate = new Date(`${driver.dateOfBirth}T00:00:00Z`);
  const latestSeasonYear = Number(latestSeason);
  const age = Number.isNaN(birthDate.getTime()) || !Number.isFinite(latestSeasonYear)
    ? null
    : latestSeasonYear - birthDate.getUTCFullYear();
  const seasonPosition = driverStanding ? `P${driverStanding.position}` : "暂无排名";
  const superLicencePenaltyPoints = Number(profile.superLicencePenaltyPoints);
  const superLicenceRemainingPoints = Number.isFinite(superLicencePenaltyPoints)
    ? `${Math.max(0, 12 - superLicencePenaltyPoints)} 分`
    : undefined;
  const superLicencePenaltyPointsLabel = Number.isFinite(superLicencePenaltyPoints)
    ? `${superLicencePenaltyPoints} 分`
    : profile.superLicencePenaltyPoints;
  const zodiacSign = profile.zodiacSign ?? getZodiacSign(driver.dateOfBirth);
  const teammates = currentConstructor
    ? standings.filter(
        (standing) =>
          standing.Driver.driverId !== driverId &&
          standing.Constructors.some(
            (constructor) => constructor.constructorId === currentConstructor.constructorId
          )
      )
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5">
      <div className="mb-3 flex flex-wrap gap-3">
        <Link href="/drivers" className="text-f1-red hover:text-red-400 text-sm">
          ← 返回车手列表
        </Link>
        <Link href="/standings" className="text-text-muted hover:text-text-primary text-sm">
          查看积分榜
        </Link>
      </div>

      <div className="bg-gradient-to-r from-f1-red to-red-700 rounded-2xl p-4 mb-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-5">
          <DriverHeadshot
            src={getDriverHeadshotUrl(driver, headshots)}
            alt={displayName}
            fallbackText={fallbackText}
            size={96}
            fallbackClassName="bg-white/20"
            textClassName="text-white font-bold text-3xl"
          />
          <div className="flex-1">
            <p className="text-white/80 text-sm mb-1">
              {driver.permanentNumber ? `#${driver.permanentNumber}` : "暂无固定车号"}
            </p>
            <h1 className="break-words text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              {displayName}
            </h1>
            <p className="text-white/80 mt-1">{translateNationality(driver.nationality)}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-white/80 text-sm">{latestSeason} 赛季排名</p>
            <p className="text-2xl font-bold text-white">
              {seasonPosition}
            </p>
            <p className="text-white/80 text-sm mt-2">
              {driverStanding ? `${driverStanding.points} 积分` : "暂无积分记录"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-4">
        <StatCard label="车号" value={driver.permanentNumber ? `#${driver.permanentNumber}` : "--"} />
        <StatCard label="简称" value={driver.code ?? "--"} />
        <StatCard label="胜场" value={driverStanding?.wins ?? "--"} />
        <StatCard label="积分" value={driverStanding?.points ?? "--"} />
      </div>

      <div className="grid gap-3 mb-3 sm:mb-4 md:grid-cols-2">
        <section className="bg-surface rounded-xl p-3 border border-border sm:p-4">
          <h2 className="text-lg font-bold text-text-primary mb-3">个人资料</h2>
          <div className="space-y-3">
            <DetailRow label="英文名" value={`${driver.givenName} ${driver.familyName}`} />
            <DetailRow label="出生日期" value={driver.dateOfBirth} />
            <DetailRow label="出生地" value={profile.birthPlace} />
            <DetailRow label="居住地" value={profile.residence} />
            <DetailRow label="年龄" value={age === null ? undefined : `${age} 岁`} />
            <DetailRow label="星座" value={zodiacSign} />
            <DetailRow label="国籍" value={translateNationality(driver.nationality)} />
            <DetailRow label="车手 ID" value={driver.driverId} />
          </div>
        </section>

        <section className="bg-surface rounded-xl p-3 border border-border sm:p-4">
          <h2 className="text-lg font-bold text-text-primary mb-3">{latestSeason} 赛季表现</h2>
          <div className="space-y-3">
            <DetailRow label="排名" value={seasonPosition} />
            <DetailRow label="积分" value={driverStanding ? `${driverStanding.points} 分` : "暂无积分记录"} />
            <DetailRow label="胜场" value={driverStanding ? `${driverStanding.wins} 场` : "--"} />
            <DetailRow label="当前车队" value={currentConstructor ? translateConstructorName(currentConstructor.name) : "暂无车队"} />
            <DetailRow label="薪水" value={profile.salary} />
          </div>
        </section>
      </div>

      <div className="grid gap-3 mb-3 sm:mb-4 md:grid-cols-2">
        <section className="bg-surface rounded-xl p-3 border border-border sm:p-4">
          <h2 className="text-lg font-bold text-text-primary mb-3">职业资料</h2>
          <div className="space-y-3">
            <DetailRow label="参赛首战" value={profile.debutRace} />
            <DetailRow label="合同情况" value={profile.contractStatus} />
            <DetailRow label="T 架颜色" value={profile.tCamColor} />
            <DetailRow label="超级驾照分" value={superLicenceRemainingPoints} />
            <DetailRow label="超级驾照罚分" value={superLicencePenaltyPointsLabel} />
            <SignatureRow src={profile.signatureImageUrl} alt={`${displayName} 手写签名`} />
          </div>
        </section>

        <section className="bg-surface rounded-xl p-3 border border-border sm:p-4">
          <h2 className="text-lg font-bold text-text-primary mb-3">身体与个人信息</h2>
          <div className="space-y-3">
            <DetailRow label="身高" value={profile.height} />
            <DetailRow label="体重" value={profile.weight} />
            <DetailRow label="昵称" value={profile.nickname} />
            <DetailRow label="婚姻状况" value={profile.maritalStatus} />
            <DetailRow label="伴侣" value={profile.partner} />
            <DetailRow label="亲友/朋友/教父" value={profile.familyAndFriends} />
          </div>
        </section>
      </div>

      <div className="grid gap-3 mb-3 sm:mb-4 md:grid-cols-2">
        <section className="bg-surface rounded-xl p-3 border border-border sm:p-4">
          <h2 className="text-lg font-bold text-text-primary mb-3">官方职业统计</h2>
          <div className="space-y-3">
            <DetailRow label="大奖赛出场" value={profile.grandPrixEntered} />
            <DetailRow label="生涯积分" value={profile.careerPoints} />
            <DetailRow label="最高完赛" value={profile.highestRaceFinish} />
            <DetailRow label="领奖台" value={profile.podiums} />
            <DetailRow label="最高发车" value={profile.highestGridPosition} />
            <DetailRow label="杆位" value={profile.polePositions} />
            <DetailRow label="世界冠军" value={profile.worldChampionships} />
            <DetailRow label="DNF" value={profile.dnfs} />
          </div>
        </section>

        <section className="bg-surface rounded-xl p-3 border border-border sm:p-4">
          <h2 className="text-lg font-bold text-text-primary mb-3">公开形象</h2>
          <div className="space-y-3">
            <DetailRow label="车迷印象" value={profile.fanImpression} />
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="bg-surface rounded-xl p-3 border border-border sm:p-4">
          <h2 className="text-lg font-bold text-text-primary mb-3">{latestSeason} 当前车队</h2>
          {currentConstructor ? (
            <Link
              href={`/constructors/${currentConstructor.constructorId}`}
              className="flex items-center gap-4 rounded-lg p-3 hover:bg-hover-surface"
            >
              <ConstructorLogo
                src={getConstructorLogoUrl(currentConstructor)}
                alt={translateConstructorName(currentConstructor.name)}
                fallbackText={currentConstructor.name.slice(0, 2)}
                size={48}
                className="rounded-full"
                textClassName="text-white font-bold"
              />
              <div className="min-w-0">
                <p className="break-words text-text-primary font-medium">{translateConstructorName(currentConstructor.name)}</p>
                <p className="break-words text-text-muted text-sm">{translateNationality(currentConstructor.nationality)}</p>
              </div>
            </Link>
          ) : (
            <p className="text-text-muted">当前赛季暂无车队信息。</p>
          )}
        </section>

        <section className="bg-surface rounded-xl p-3 border border-border sm:p-4">
          <h2 className="text-lg font-bold text-text-primary mb-3">队友</h2>
          {teammates.length > 0 ? (
            <div className="space-y-3">
              {teammates.map((teammate) => (
                <Link
                  key={teammate.Driver.driverId}
                  href={`/drivers/${teammate.Driver.driverId}`}
                  className="flex items-start justify-between gap-3 rounded-lg p-3 hover:bg-hover-surface"
                >
                  <span className="min-w-0 break-words text-text-primary font-medium">
                    {translateDriverName(teammate.Driver.givenName, teammate.Driver.familyName)}
                  </span>
                  <span className="shrink-0 text-text-muted text-sm">
                    P{teammate.position} · {teammate.points} 分
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-text-muted">暂无队友信息。</p>
          )}
        </section>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <a
          href={driver.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-f1-red hover:text-red-400 text-sm"
        >
          查看维基百科 →
        </a>
        {currentConstructor ? (
          <Link
            href={`/constructors/${currentConstructor.constructorId}`}
            className="text-f1-red hover:text-red-400 text-sm"
          >
            查看车队详情 →
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-sm text-text-muted">{label}</span>
      <span className="min-w-0 break-words text-right text-sm font-medium text-text-primary">
        {value ?? "暂无可靠资料"}
      </span>
    </div>
  );
}

function SignatureRow({ src, alt }: { src: string | undefined; alt: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-sm text-text-muted">签名</span>
      {src ? (
        <div className="relative h-12 w-36 overflow-hidden rounded-md bg-white p-2">
          <Image src={src} alt={alt} fill sizes="144px" unoptimized className="object-contain" />
        </div>
      ) : (
        <span className="min-w-0 break-words text-right text-sm font-medium text-text-primary">
          暂无签名图片
        </span>
      )}
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
