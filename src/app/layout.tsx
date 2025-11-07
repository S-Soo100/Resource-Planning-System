"use client";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Appbar from "@/components/appbar/Appbar";
import Script from "next/script";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "400", "700", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <title>KARS - Kangsters Auto Resource-management System</title>
        <meta
          name="description"
          content="KARS는 다양한 품목을 효율적으로 분류하고 자동으로 재고 관리하기 위한 통합 재고 관리 시스템입니다."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <Script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${notoSansKr.className} font-sans antialiased min-w-96 mx-auto shadow-lg relative min-h-screen`}
      >
        <Providers>
          <header className="relative z-50">
            <Appbar />
          </header>
          <div className="mx-auto relative">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
