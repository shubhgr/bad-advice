import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import "./receipt.css";
import "./pass.css";

const caveat = localFont({
  src: [
    { path: "../fonts/caveat/500.ttf", weight: "500", style: "normal" },
    { path: "../fonts/caveat/700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-hand",
  display: "swap",
});

const grotap = localFont({
  src: [
    {
      path: "../../public/fonts/pass/grotap/Grotap-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pass-display",
  display: "swap",
});

const dmSans = localFont({
  src: [
    { path: "../fonts/dm-sans/500.ttf", weight: "500", style: "normal" },
    { path: "../fonts/dm-sans/600.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-pass-sans",
  display: "swap",
});

const doto = localFont({
  src: [
    { path: "../fonts/doto/400.ttf", weight: "400", style: "normal" },
    { path: "../fonts/doto/500.ttf", weight: "500", style: "normal" },
    { path: "../fonts/doto/600.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-pass-dot",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "../fonts/poppins/500.ttf", weight: "500", style: "normal" },
    { path: "../fonts/poppins/600.ttf", weight: "600", style: "normal" },
    { path: "../fonts/poppins/700.ttf", weight: "700", style: "normal" },
    { path: "../fonts/poppins/800.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-pass-cta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bad Advice",
  description:
    "Get hilariously bad AI advice, then discover real course recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${caveat.variable} ${grotap.variable} ${dmSans.variable} ${doto.variable} ${poppins.variable} h-full antialiased bg-background`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
        />
      </head>
      <body className="min-h-full bg-background">{children}</body>
    </html>
  );
}
