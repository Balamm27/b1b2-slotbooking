import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0].trim();
  const candidateHost = forwardedHost ?? requestHeaders.get("host") ?? "localhost:3000";
  const safeHost = /^[a-z0-9.-]+(?::\d+)?$/i.test(candidateHost)
    ? candidateHost
    : "localhost:3000";
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim();
  const protocol = forwardedProto === "http" || forwardedProto === "https"
    ? forwardedProto
    : safeHost.startsWith("localhost")
      ? "http"
      : "https";
  const origin = `${protocol}://${safeHost}`;

  return {
    metadataBase: new URL(origin),
    title: "Chennai Slot Lab",
    description: "A local-first evidence dashboard for tracking Chennai VAC booking attempts.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Chennai Slot Lab",
      description: "Evidence over folklore: track every Chennai VAC booking stage.",
      type: "website",
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "Chennai Slot Lab" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Chennai Slot Lab",
      description: "Evidence over folklore: track every Chennai VAC booking stage.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
