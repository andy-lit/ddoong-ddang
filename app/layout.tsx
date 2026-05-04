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
  title: "뚱땅뚱땅 밴드 두번째 공연",
  description: "뚱땅뚱땅 밴드 두번째 공연에 함께해주세요!",
  icons: {
    icon: "/logo-square.webp",
  },
  openGraph: {
    title: "뚱땅뚱땅 밴드 두번째 공연",
    description: "뚱땅뚱땅 밴드 두번째 공연에 함께해주세요!",
    type: "website",
    url: "https://ddoong-ddang.vercel.app",
    images: ["/og.jpg"],
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

        <meta property="og:title" content={"뚱땅뚱땅 밴드 두번째 공연"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={"https://ddoong-ddang.vercel.app"} />
        <meta property="og:image" content={"/og.jpg"} />
        <meta
          property="og:description"
          content="뚱땅뚱땅 밴드 두번째 공연에 함께해주세요!"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
