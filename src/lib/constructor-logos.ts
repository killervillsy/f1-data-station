import type { Constructor } from "@/types/f1";

const racingBullsLogoUrl =
  "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogo.webp";

const constructorLogoById: Record<string, string> = {
  mercedes:
    "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogo.webp",
  ferrari:
    "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogo.webp",
  mclaren:
    "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogo.webp",
  red_bull:
    "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogo.webp",
  williams:
    "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/williams/2026williamslogo.webp",
  aston_martin:
    "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogo.webp",
  alpine:
    "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogo.webp",
  haas:
    "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogo.webp",
  rb: racingBullsLogoUrl,
  racing_bulls: racingBullsLogoUrl,
  audi:
    "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/audi/2026audilogo.webp",
  cadillac:
    "https://media.formula1.com/image/upload/c_fit,w_384/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogo.webp",
};

const constructorLogoByName: Record<string, string> = {
  "red bull": constructorLogoById.red_bull,
  "red bull racing": constructorLogoById.red_bull,
  mercedes: constructorLogoById.mercedes,
  ferrari: constructorLogoById.ferrari,
  mclaren: constructorLogoById.mclaren,
  williams: constructorLogoById.williams,
  "aston martin": constructorLogoById.aston_martin,
  alpine: constructorLogoById.alpine,
  "alpine f1 team": constructorLogoById.alpine,
  haas: constructorLogoById.haas,
  "haas f1 team": constructorLogoById.haas,
  rb: constructorLogoById.rb,
  "rb f1 team": constructorLogoById.rb,
  "racing bulls": constructorLogoById.racing_bulls,
  audi: constructorLogoById.audi,
  cadillac: constructorLogoById.cadillac,
  "cadillac f1 team": constructorLogoById.cadillac,
};

export function getConstructorLogoUrl(constructor: Constructor): string | undefined {
  return (
    constructorLogoById[constructor.constructorId] ??
    constructorLogoByName[constructor.name.trim().toLowerCase()]
  );
}
