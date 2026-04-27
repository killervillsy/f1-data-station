"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type {
  LiveLeaderboardItem,
  LiveSessionSnapshot,
  LiveTelemetrySnapshot,
  LiveTimingSnapshot,
} from "@/types/openf1";

type LiveTimingClientProps = {
  initialSnapshot: LiveTimingSnapshot;
};

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "--";

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function formatTelemetryDate(value: string | null | undefined): string {
  if (!value) return "暂无遥测时间";
  return `遥测时间 ${formatDateTime(value)}`;
}

function MetricCard({
  label,
  value,
  unit,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "default" | "red" | "green";
}) {
  const toneClass =
    tone === "red"
      ? "text-f1-red"
      : tone === "green"
        ? "text-success"
        : "text-text-primary";

  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-4">
      <p className="text-xs uppercase tracking-wide text-text-subtle">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>
        {value}
        {unit ? <span className="ml-1 text-sm text-text-muted">{unit}</span> : null}
      </p>
    </div>
  );
}

export default function LiveTimingClient({ initialSnapshot }: LiveTimingClientProps) {
  const [session, setSession] = useState<LiveSessionSnapshot | null>(
    initialSnapshot.session
  );
  const [leaderboard, setLeaderboard] = useState<LiveLeaderboardItem[]>(
    initialSnapshot.leaderboard
  );
  const [selectedDriverNumber, setSelectedDriverNumber] = useState<number | null>(
    initialSnapshot.leaderboard[0]?.driverNumber ?? null
  );
  const [telemetry, setTelemetry] = useState<LiveTelemetrySnapshot | null>(
    initialSnapshot.telemetry
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialSnapshot.updatedAt);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialSnapshot.error ?? null);
  const telemetrySectionRef = useRef<HTMLElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRefreshingRef = useRef(false);

  const selectedDriver = useMemo(
    () =>
      leaderboard.find(
        (driver) => driver.driverNumber === selectedDriverNumber
      ) ?? null,
    [leaderboard, selectedDriverNumber]
  );

  const refreshLiveData = useCallback(async (mode: "auto" | "manual" = "manual") => {
    if (mode === "auto") {
      if (document.visibilityState === "hidden" || isRefreshingRef.current) {
        return;
      }
    } else {
      abortControllerRef.current?.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    isRefreshingRef.current = true;

    const query = selectedDriverNumber
      ? `?driverNumber=${selectedDriverNumber}`
      : "";

    setIsLoading(true);

    try {
      const response = await fetch(`/api/live${query}`, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("实时数据请求失败");
      }

      const snapshot = (await response.json()) as LiveTimingSnapshot;

      setSession(snapshot.session);
      setLeaderboard(snapshot.leaderboard);
      setTelemetry(snapshot.telemetry);
      setUpdatedAt(snapshot.updatedAt);
      setError(snapshot.error ?? null);

      if (
        snapshot.leaderboard.length > 0 &&
        !snapshot.leaderboard.some(
          (driver) => driver.driverNumber === selectedDriverNumber
        )
      ) {
        setSelectedDriverNumber(snapshot.leaderboard[0].driverNumber);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      setError(err instanceof Error ? err.message : "实时数据请求失败");
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        isRefreshingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [selectedDriverNumber]);

  function handleLeaderboardSelect(driverNumber: number) {
    setSelectedDriverNumber(driverNumber);
    window.setTimeout(() => {
      telemetrySectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function handleLeaderboardKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    driverNumber: number
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLeaderboardSelect(driverNumber);
    }
  }

  useEffect(() => {
    const refreshAutomatically = () => {
      void refreshLiveData("auto");
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshAutomatically();
      }
    };

    const timeoutId = window.setTimeout(refreshAutomatically, 0);
    const intervalId = window.setInterval(refreshAutomatically, 10_000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      abortControllerRef.current?.abort();
    };
  }, [refreshLiveData]);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-f1-red">
              实时计时
            </p>
            <h1 className="mt-2 text-4xl font-bold">实时数据</h1>
            <p className="mt-3 max-w-2xl text-text-muted">
              数据来自 F1 官方实时计时静态源，页面会每 10 秒自动刷新一次；非比赛周可能展示最近一节赛事。
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshLiveData("manual")}
            disabled={isLoading}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:border-f1-red hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "正在刷新..." : "手动刷新"}
          </button>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-5 md:col-span-2">
            <p className="text-sm text-text-muted">当前 / 最近场次</p>
            <h2 className="mt-2 text-2xl font-bold">
              {session?.name ?? "暂无实时赛事数据"}
            </h2>
            <p className="mt-2 text-text-muted">
              {session
                ? `${session.circuitShortName} · ${session.location}, ${session.countryName}`
                : "F1 官方实时计时暂未返回可用赛事。"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-text-muted">赛事类型</p>
            <p className="mt-2 text-2xl font-bold">
              {session?.type ?? "--"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-text-muted">最后更新</p>
            <p className="mt-2 text-2xl font-bold">
              {formatDateTime(updatedAt)}
            </p>
          </div>
        </section>

        {error ? (
          <div className="mb-6 rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger">
            {error}，保留上一次成功获取的数据。
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">实时排名</h2>
              <span className="text-sm text-text-muted">
                {leaderboard.length} 位车手
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-text-muted">
                暂无排名数据
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="hidden gap-3 bg-table-header px-4 py-3 text-xs uppercase tracking-wide text-text-subtle sm:grid sm:grid-cols-[72px_1fr_1fr_88px]">
                  <span>名次</span>
                  <span>车手</span>
                  <span>车队 / 间隔</span>
                  <span className="text-right">圈数</span>
                </div>

                <div className="divide-y divide-border">
                  {leaderboard.map((driver) => {
                    const isSelected =
                      driver.driverNumber === selectedDriverNumber;

                    return (
                      <div
                        key={driver.driverNumber}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleLeaderboardSelect(driver.driverNumber)}
                        onKeyDown={(event) => handleLeaderboardKeyDown(event, driver.driverNumber)}
                        className={`w-full cursor-pointer px-4 py-4 text-left transition-colors hover:bg-hover-surface focus:outline-none sm:grid sm:grid-cols-[72px_1fr_1fr_88px] sm:items-center sm:gap-3 ${
                          isSelected ? "bg-selected-surface" : "bg-surface-subtle"
                        }`}
                      >
                        <div className="sm:hidden">
                          <div className="mb-3 flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-lg font-black text-text-primary">
                              {driver.position}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="break-words font-bold text-text-primary">
                                {driver.driverCode}
                              </p>
                              <p className="break-words text-sm text-text-muted">
                                {driver.driverName}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-xs text-text-subtle">圈数</p>
                              <p className="font-mono text-text-primary">{driver.laps ?? "--"}</p>
                            </div>
                          </div>

                          <div className="rounded-lg bg-surface-muted p-3 text-sm">
                            <div className="flex items-start gap-3">
                              <span
                                className="mt-0.5 h-8 w-1 shrink-0 rounded-full"
                                style={{ backgroundColor: driver.teamColor }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="break-words font-medium text-text-primary">{driver.team}</p>
                                <p className="mt-1 break-words text-xs text-text-subtle">
                                  间隔：{driver.interval || driver.gapToLeader || "--"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <span className="hidden text-2xl font-black text-text-primary sm:block">
                          {driver.position}
                        </span>
                        <span className="hidden sm:block">
                          <span className="block font-bold text-text-primary">
                            {driver.driverCode}
                          </span>
                          <span className="block text-sm text-text-muted">
                            {driver.driverName}
                          </span>
                        </span>
                        <span className="hidden items-center gap-3 text-sm text-text-secondary sm:flex">
                          <span
                            className="h-8 w-1 rounded-full"
                            style={{ backgroundColor: driver.teamColor }}
                          />
                          <span>
                            <span className="block">{driver.team}</span>
                            <span className="block text-xs text-text-subtle">
                              {driver.interval || driver.gapToLeader || "--"}
                            </span>
                          </span>
                        </span>
                        <span className="hidden text-right font-mono text-text-muted sm:block">
                          {driver.laps ?? "--"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <aside ref={telemetrySectionRef} className="scroll-mt-20 rounded-2xl border border-border bg-surface p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold">计时数据</h2>
              <p className="mt-1 text-sm text-text-muted">
                {selectedDriver
                  ? `${selectedDriver.driverCode} · ${selectedDriver.driverName}`
                  : "请选择一位车手"}
              </p>
            </div>

            {!selectedDriver ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-text-muted">
                选择排名中的车手以查看遥测。
              </div>
            ) : telemetry ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="I1 测速点" value={telemetry.i1Speed ?? "--"} unit="km/h" />
                  <MetricCard label="I2 测速点" value={telemetry.i2Speed ?? "--"} unit="km/h" />
                  <MetricCard label="终点线" value={telemetry.finishLineSpeed ?? "--"} unit="km/h" />
                  <MetricCard label="直道测速" value={telemetry.stSpeed ?? "--"} unit="km/h" />
                  <MetricCard label="车号" value={`#${telemetry.driverNumber}`} />
                  <MetricCard label="数据源" value="官方计时" />
                </div>

                <div className="rounded-xl border border-border bg-surface-elevated p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm text-text-secondary">
                    <span>最佳圈速</span>
                    <span className="text-right font-mono">
                      {selectedDriver?.bestLapTime ?? "--"}
                    </span>
                    <span>上一圈</span>
                    <span className="text-right font-mono">
                      {selectedDriver?.lastLapTime ?? "--"}
                    </span>
                    <span>进站次数</span>
                    <span className="text-right font-mono">
                      {selectedDriver?.pitStops ?? "--"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-text-subtle">
                  {formatTelemetryDate(telemetry.date)}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-text-muted">
                暂无该车手遥测数据
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
