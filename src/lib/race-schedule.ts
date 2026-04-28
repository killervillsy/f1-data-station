import type { Race, RaceSession } from "@/types/f1";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export type RaceWeekendSession = {
  label: string;
  value: string;
};

export function getRaceWeekendSessions(race: Race): RaceWeekendSession[] {
  const sessions: { label: string; session?: RaceSession }[] = [
    { label: "一练", session: race.FirstPractice },
    { label: "二练", session: race.SecondPractice },
    { label: "三练", session: race.ThirdPractice },
    { label: "冲刺排位", session: race.SprintQualifying ?? race.SprintShootout },
    { label: "冲刺赛", session: race.Sprint },
    { label: "排位赛", session: race.Qualifying },
    { label: "正赛", session: race },
  ];

  return sessions
    .filter((item) => item.session)
    .map((item) => ({
      label: item.label,
      value: formatSessionDateTime(item.session),
    }));
}

function formatSessionDateTime(session: RaceSession | undefined): string {
  if (!session) return "时间待定";

  const date = format(new Date(session.date), "MM月dd日", { locale: zhCN });

  if (!session.time) return `${date} 时间待定`;

  const time = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(new Date(`${session.date}T${session.time}`));

  return `${date} ${time}`;
}
