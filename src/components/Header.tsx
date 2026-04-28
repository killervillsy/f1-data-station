"use client";

import { useTheme } from "@/components/ThemeProvider";
import { themeLabels, themeOptions, type ThemePreference } from "@/lib/theme";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/schedule", label: "赛程" },
  { href: "/standings", label: "积分榜" },
  { href: "/drivers", label: "车手" },
  { href: "/constructors", label: "车队" },
  { href: "/live", label: "实时数据" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/schedule" && pathname.startsWith("/race/")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const { themePreference, setThemePreference, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const displayPreference = mounted ? themePreference : "system";
  const themeLabel = themeLabels[displayPreference];

  function closeMenus() {
    setIsOpen(false);
    setIsThemeMenuOpen(false);
  }

  function handleThemeChange(value: ThemePreference) {
    setThemePreference(value);
    setIsThemeMenuOpen(false);
  }

  useEffect(() => {
    function closeMenusWhenOutside(target: EventTarget | null) {
      if (target instanceof Node && headerRef.current?.contains(target)) {
        return;
      }

      closeMenus();
    }

    function handlePointerDown(event: PointerEvent) {
      closeMenusWhenOutside(event.target);
    }

    function handleFocusIn(event: FocusEvent) {
      closeMenusWhenOutside(event.target);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 bg-header-bg backdrop-blur border-b border-border">
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex h-12 items-center justify-between gap-2">
          <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="返回 F1.Data 首页">
            <Image
              src="/f1-data-logo.svg"
              alt="F1.Data"
              width={48}
              height={48}
              priority
              className="h-8 w-auto sm:h-9"
            />
            <span className="truncate text-lg font-black leading-none tracking-tight text-text-primary sm:text-xl">
              F1<span className="text-f1-red">.</span>Data
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-f1-red text-white"
                      : "text-text-muted hover:text-text-primary hover:bg-hover-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsThemeMenuOpen((open) => !open);
                }}
                aria-haspopup="listbox"
                aria-expanded={isThemeMenuOpen}
                aria-label={`选择主题，当前：${themeLabel}`}
                title={`主题：${themeLabel}`}
                className="group flex h-8 cursor-pointer items-center gap-1 rounded-full border border-border bg-surface/90 px-1.5 text-xs text-text-muted shadow-sm backdrop-blur transition-all hover:border-f1-red hover:bg-hover-surface hover:text-text-primary hover:shadow-md focus:border-f1-red focus:outline-none sm:px-2"
              >
                <span className="hidden h-5 w-5 items-center justify-center rounded-full bg-surface-muted text-f1-red transition-colors group-hover:bg-selected-surface sm:flex">
                  <svg
                    aria-hidden="true"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64" />
                  </svg>
                </span>
                <span className="hidden text-[11px] font-medium sm:inline">主题</span>
                <span className="hidden h-3.5 w-px bg-border sm:block" />
                <span className="min-w-7 text-left font-semibold text-text-primary sm:min-w-14">
                  {themeLabel}
                </span>
                <svg
                  aria-hidden="true"
                  className={`h-3 w-3 text-text-subtle transition-all group-hover:text-f1-red ${
                    isThemeMenuOpen ? "rotate-180 text-f1-red" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                </svg>
              </button>

              <div
                role="listbox"
                aria-label="主题选项"
                aria-hidden={!isThemeMenuOpen}
                className={`absolute right-0 z-50 mt-2 w-36 origin-top-right overflow-hidden rounded-xl border border-border bg-surface/95 p-1.5 shadow-xl backdrop-blur transition-all duration-200 ease-out ${
                  isThemeMenuOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                }`}
              >
                {themeOptions.map((option) => {
                  const selected = option.value === displayPreference;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      tabIndex={isThemeMenuOpen ? 0 : -1}
                      onClick={() => handleThemeChange(option.value)}
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors ${
                        selected
                          ? "border-f1-red bg-menu-option-selected text-text-primary"
                          : "border-border text-text-muted hover:border-f1-red hover:bg-menu-option-hover hover:text-text-primary"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                          selected
                            ? "border-f1-red bg-f1-red text-white"
                            : "border-border text-surface"
                        }`}
                      >
                        <svg
                          aria-hidden="true"
                          className="h-2.5 w-2.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="font-semibold leading-tight text-text-primary">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="md:hidden text-text-primary p-2"
              aria-label="打开导航菜单"
              aria-controls="mobile-navigation"
              aria-expanded={isOpen}
              onClick={() => {
                setIsThemeMenuOpen(false);
                setIsOpen((open) => !open);
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        <nav
          id="mobile-navigation"
          aria-hidden={!isOpen}
          className={`absolute left-0 top-full z-40 w-full origin-top border-b border-border bg-header-bg px-4 py-4 shadow-xl backdrop-blur transition-all duration-200 ease-out md:hidden ${
            isOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-95 opacity-0"
          }`}
        >
          <div className="grid gap-2">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenus}
                  tabIndex={isOpen ? 0 : -1}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-f1-red text-white"
                      : "text-text-muted hover:bg-hover-surface hover:text-text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
