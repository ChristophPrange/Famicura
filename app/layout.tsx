import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOVALIS – Pflege gemeinsam gestalten",
  description: "Gemeinsam planen, Wichtiges festhalten und mehr Zeit füreinander finden.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/brand/novalis-symbol.svg",
    shortcut: "/brand/novalis-symbol.svg",
    apple: "/brand/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
