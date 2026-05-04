import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "뚱땅뚱땅 밴드 공연",
  description: "5월 30일(토) 18:30, 라이브앤라우드",
  icons: {
    icon: "/logo-square.webp",
  },
  openGraph: {
    title: "뚱땅뚱땅 밴드 공연",
    description: "5월 30일(토) 18:30, 라이브앤라우드",
    type: "website",
    url: "https://ddoong-ddang.vercel.app",
    images: ["/og-v2.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content={"뚱땅뚱땅 밴드 공연"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={"https://ddoong-ddang.vercel.app"} />
        <meta property="og:image" content={"/og-v2.jpg"} />
        <meta
          property="og:description"
          content="5월 30일(토) 18:30, 라이브앤라우드"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
