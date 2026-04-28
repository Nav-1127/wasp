import type { Metadata } from "next";
import { Syne, Space_Grotesk, Playfair_Display, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

// Variable Inter with opsz axis — lets us use display-cut proportions
// (opsz: 32) on the wordmark while body text uses default optical size.
const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
  display: "swap",
});

// Geist Mono — experimental wordmark font on Nav + Footer only (v3).
// May or may not stick. If kept, propagate to auth/layout, auth/confirm,
// signed-out, not-found and remove Inter Display wordmark.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WASP — AI Instagram Engagement Agent",
  description:
    "Put your Instagram's Engagement on Auto-Pilot with Wasp's AI Agent. Learn your brand voice, reply like you, never sleep.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://joinwasp.com"
  ),
  openGraph: {
    title: "WASP — AI Instagram Engagement Agent",
    description:
      "Not a chatbot. Not a flow builder. An AI agent that learns your voice, replies like you, and never sleeps.",
    siteName: "WASP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WASP — AI Instagram Engagement Agent",
    description:
      "Not a chatbot. Not a flow builder. An AI agent that learns your voice, replies like you, and never sleeps.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${spaceGrotesk.variable} ${playfair.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
