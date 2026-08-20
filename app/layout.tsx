import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Chennai Slot Lab",
  description: "A Git-backed evidence dashboard for tracking Chennai VAC booking attempts.",
  icons: {
    icon: `${siteUrl}/favicon.svg`,
    shortcut: `${siteUrl}/favicon.svg`,
  },
  openGraph: {
    title: "Chennai Slot Lab",
    description: "Evidence over folklore: track every Chennai VAC booking stage.",
    type: "website",
    url: siteUrl,
    images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Chennai Slot Lab" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chennai Slot Lab",
    description: "Evidence over folklore: track every Chennai VAC booking stage.",
    images: [`${siteUrl}/og.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
