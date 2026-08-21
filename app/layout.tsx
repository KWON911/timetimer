import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "타이머",
  description: "원형 다이얼 타이머",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "256x256", type: "image/png" },
    ],
    // Setting metadata.icons explicitly (for the favicon above) makes
    // Next.js skip auto-discovery of app/apple-icon.* entirely, so the
    // apple-touch-icon must be listed here by hand or it silently
    // disappears from <head>.
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "타이머",
    statusBarStyle: "black-translucent",
  },
  other: {
    // Next.js only emits the unprefixed "mobile-web-app-capable" tag for
    // appleWebApp.capable; iOS Safari's home-screen standalone mode still
    // keys off the legacy "apple-" prefixed tag, so add it explicitly.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#D2203D",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col overscroll-none"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
