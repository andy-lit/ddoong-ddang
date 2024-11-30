import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "뚱땅뚱땅",
  description: "뚱땅뚱땅 밴드 첫공연에 함께해주세요!",
  icons: {
    icon: "/logo-square.webp",
  },
  openGraph: {
    title: "뚱땅뚱땅",
    description: "뚱땅뚱땅 밴드 첫공연에 함께해주세요!",
    type: "website",
    url: "https://ddoong-ddang.vercel.app",
    images: ["/logo-square.webp"],
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

        <meta property="og:title" content={"뚱땅뚱땅 밴드 첫공연"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={"https://ddoong-ddang.vercel.app"} />
        <meta property="og:image" content={"/logo-square.webp"} />
        <meta
          property="og:description"
          content="뚱땅뚱땅 밴드 첫공연에 함께해주세요!"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
