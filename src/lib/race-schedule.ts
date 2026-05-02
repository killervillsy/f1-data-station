import type { Race, RaceSession } from "@/types/f1";

export type RaceWeekendSessionType =
  | "practice1"
  | "practice2"
  | "practice3"
  | "sprintQualifying"
  | "sprint"
  | "qualifying"
  | "race";

export type RaceWeekendSession = {
  label: string;
  value: string;
  type: RaceWeekendSessionType;
  supportsResults: boolean;
};

export function getRaceWeekendSessions(race: Race): RaceWeekendSession[] {
  const sessions: {
    label: string;
    type: RaceWeekendSessionType;
    session?: RaceSession;
  }[] = [
    { label: "一练", type: "practice1", session: race.FirstPractice },
    { label: "二练", type: "practice2", session: race.SecondPractice },
    { label: "三练", type: "practice3", session: race.ThirdPractice },
    {
      label: "冲刺排位",
      type: "sprintQualifying",
      session: race.SprintQualifying ?? race.SprintShootout,
    },
    { label: "冲刺赛", type: "sprint", session: race.Sprint },
    { label: "排位赛", type: "qualifying", session: race.Qualifying },
    { label: "正赛", type: "race", session: race },
  ];

  return sessions
    .filter((item) => item.session)
    .map((item) => ({
      label: item.label,
      value: formatSessionDateTime(item.session),
      type: item.type,
      supportsResults: ["sprint", "qualifying", "race"].includes(item.type),
    }));
}

function formatSessionDateTime(session: RaceSession | undefined): string {
  if (!session) return "时间待定";

  if (!session.time) return `${formatApiSessionDate(session.date)} 时间待定`;

  const dateTime = new Date(`${session.date}T${session.time}`);
  const date = new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  })
    .format(dateTime)
    .replace(/^(\d{2})\/(\d{2})$/, "$1月$2日");

  const time = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(dateTime);

  return `${date} ${time}`;
}

function formatApiSessionDate(date: string): string {
  const [, month, day] = date.split("-");

  return `${month}月${day}日`;
}
