export const themeScript = `
try {
  const theme = localStorage.getItem("theme");
  const root = document.documentElement;

  if (theme === "light" || theme === "dark") {
    root.dataset.theme = theme;
  } else {
    root.removeAttribute("data-theme");
  }
} catch {}
`;
