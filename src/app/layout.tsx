import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { LocaleProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Tenant Trust — Trust, verified",
  description:
    "A bilateral rental trust platform. Landlords and tenants build a verifiable reputation based on facts — not opinions.",
  applicationName: "Tenant Trust",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Tenant Trust" },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#080c13" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>{children}</AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
