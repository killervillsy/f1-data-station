import { getLatestSession, getSessionDrivers } from "@/lib/openf1-api";
import type { Driver } from "@/types/f1";
import type { OpenF1Driver } from "@/types/openf1";

export type DriverHeadshotMap = Map<string, string>;

type CurrentDriverHeadshot = {
  teamPath: string;
  imageCode: string;
  fileName: string;
};

const currentDriverHeadshotsById: Record<string, CurrentDriverHeadshot> = {
  albon: { teamPath: "williams", imageCode: "alealb01", fileName: "2026williamsalealb01right" },
  alonso: { teamPath: "astonmartin", imageCode: "feralo01", fileName: "2026astonmartinferalo01right" },
  antonelli: { teamPath: "mercedes", imageCode: "andant01", fileName: "2026mercedesandant01right" },
  arvid_lindblad: { teamPath: "racingbulls", imageCode: "arvlin01", fileName: "2026racingbullsarvlin01right" },
  bearman: { teamPath: "haasf1team", imageCode: "olibea01", fileName: "2026haasf1teamolibea01right" },
  bortoleto: { teamPath: "audi", imageCode: "gabbor01", fileName: "2026audigabbor01right" },
  bottas: { teamPath: "cadillac", imageCode: "valbot01", fileName: "2026cadillacvalbot01right" },
  colapinto: { teamPath: "alpine", imageCode: "fracol01", fileName: "2026alpinefracol01right" },
  gasly: { teamPath: "alpine", imageCode: "piegas01", fileName: "2026alpinepiegas01right" },
  hadjar: { teamPath: "redbullracing", imageCode: "isahad01", fileName: "2026redbullracingisahad01right" },
  hamilton: { teamPath: "ferrari", imageCode: "lewham01", fileName: "2026ferrarilewham01right" },
  hulkenberg: { teamPath: "audi", imageCode: "nichul01", fileName: "2026audinichul01right" },
  lawson: { teamPath: "racingbulls", imageCode: "lialaw01", fileName: "2026racingbullslialaw01right" },
  leclerc: { teamPath: "ferrari", imageCode: "chalec01", fileName: "2026ferrarichalec01right" },
  max_verstappen: { teamPath: "redbullracing", imageCode: "maxver01", fileName: "2026redbullracingmaxver01right" },
  norris: { teamPath: "mclaren", imageCode: "lannor01", fileName: "2026mclarenlannor01right" },
  ocon: { teamPath: "haasf1team", imageCode: "estoco01", fileName: "2026haasf1teamestoco01right" },
  perez: { teamPath: "cadillac", imageCode: "serper01", fileName: "2026cadillacserper01right" },
  piastri: { teamPath: "mclaren", imageCode: "oscpia01", fileName: "2026mclarenoscpia01right" },
  russell: { teamPath: "mercedes", imageCode: "georus01", fileName: "2026mercedesgeorus01right" },
  sainz: { teamPath: "williams", imageCode: "carsai01", fileName: "2026williamscarsai01right" },
  stroll: { teamPath: "astonmartin", imageCode: "lanstr01", fileName: "2026astonmartinlanstr01right" },
};

export async function getDriverHeadshots(): Promise<DriverHeadshotMap> {
  const session = await getLatestSession();

  if (!session) return new Map();

  const drivers = await getSessionDrivers(session.session_key);
  const headshots = new Map<string, string>();

  for (const driver of drivers) {
    if (!driver.headshot_url) continue;

    const headshotUrl = getHighestQualityF1MediaUrl(driver.headshot_url);

    for (const key of getOpenF1DriverKeys(driver)) {
      headshots.set(key, headshotUrl);
    }
  }

  return headshots;
}

export function getDriverHeadshotUrl(
  driver: Driver,
  headshots: DriverHeadshotMap
): string | undefined {
  const currentHeadshot = currentDriverHeadshotsById[driver.driverId];

  if (currentHeadshot) {
    return getCurrentDriverHeadshotUrl(currentHeadshot);
  }

  for (const key of getF1DriverKeys(driver)) {
    const headshotUrl = headshots.get(key);

    if (headshotUrl) return headshotUrl;
  }

  return undefined;
}

function getOpenF1DriverKeys(driver: OpenF1Driver): string[] {
  return [
    String(driver.driver_number),
    driver.name_acronym,
    driver.full_name,
    driver.broadcast_name,
    [driver.first_name, driver.last_name].filter(Boolean).join(" "),
  ].flatMap(normalizeDriverKey);
}

function getF1DriverKeys(driver: Driver): string[] {
  return [
    driver.permanentNumber,
    driver.code,
    `${driver.givenName} ${driver.familyName}`,
    `${driver.familyName}, ${driver.givenName}`,
  ].flatMap(normalizeDriverKey);
}

function getCurrentDriverHeadshotUrl(headshot: CurrentDriverHeadshot): string {
  return `https://media.formula1.com/image/upload/c_fit,w_1600/q_100/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/${headshot.teamPath}/${headshot.imageCode}/${headshot.fileName}.webp`;
}

function getHighestQualityF1MediaUrl(url: string): string {
  return url
    .replace(/c_[^,/]+/g, "c_fit")
    .replace(/w_\d+/g, "w_1600")
    .replace(/q_[^,/]+/g, "q_100");
}

function normalizeDriverKey(value: string | undefined): string[] {
  if (!value) return [];

  const normalized = value.trim().toLowerCase();
  return normalized ? [normalized] : [];
}
