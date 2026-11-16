import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Caveat,
  DM_Sans,
  Doto,
  Geist,
  Geist_Mono,
  Poppins,
} from "next/font/google";
import "./globals.css";
import "./receipt.css";
import "./pass.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "700"],
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

const dmSans = DM_Sans({
  variable: "--font-pass-sans",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const doto = Doto({
  variable: "--font-pass-dot",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const poppins = Poppins({
  variable: "--font-pass-cta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${grotap.variable} ${dmSans.variable} ${doto.variable} ${poppins.variable} h-full antialiased bg-background`}
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
