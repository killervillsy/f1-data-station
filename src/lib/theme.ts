export type ThemePreference = "system" | "light" | "dark";

export const themeLabels: Record<ThemePreference, string> = {
  system: "系统",
  light: "浅色",
  dark: "深色",
};

export const themeOptions: Array<{
  value: ThemePreference;
  label: string;
}> = [
  { value: "system", label: "跟随系统" },
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
];

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function applyThemePreference(theme: ThemePreference) {
  const root = document.documentElement;

  root.classList.add("theme-transitioning");
  window.setTimeout(() => {
    root.classList.remove("theme-transitioning");
  }, 300);

  if (theme === "system") {
    root.removeAttribute("data-theme");
    localStorage.removeItem("theme");
    return;
  }

  root.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}
