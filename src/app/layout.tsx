import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import { themeScript } from "@/components/ThemeScript";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1.Data | 一级方程式数据中心",
  description: "F1 赛程、积分榜、车手、车队、比赛结果和实时计时数据站",
  keywords: ["F1", "Formula 1", "一级方程式", "赛程", "积分榜", "车手", "车队"],
  icons: {
    icon: "/f1-data-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <ThemeProvider>
          <Header />
          <main className="flex-1 pt-12">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
