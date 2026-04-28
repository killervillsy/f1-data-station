export type CalendarChange = {
  type: "added" | "removed";
  title: string;
  detail: string;
};

const calendarChangesBySeason: Record<string, CalendarChange[]> = {
  "2026": [
    {
      type: "added",
      title: "新增：马德里大奖赛",
      detail: "马德里加入 2026 赛历，成为西班牙新增分站。",
    },
    {
      type: "removed",
      title: "取消：巴林大奖赛",
      detail: "巴林站从 2026 赛历中取消，官方未安排替代分站。",
    },
    {
      type: "removed",
      title: "取消：沙特阿拉伯大奖赛",
      detail: "沙特阿拉伯站从 2026 赛历中取消，官方未安排替代分站。",
    },
    {
      type: "removed",
      title: "取消：艾米利亚-罗马涅大奖赛",
      detail: "伊莫拉未列入 2026 原始赛历，马德里站取代其赛历席位。",
    },
  ],
};

export function getCalendarChanges(season: string): CalendarChange[] {
  return calendarChangesBySeason[season] ?? [];
}
