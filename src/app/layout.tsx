"use client";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AppBarComponent from "@/components/appbar/Appbar";
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
    <html lang="en">
      <head>
        <Script id="disable-antd-warning" strategy="beforeInteractive">
          {`
            window.DISABLE_ANTD_COMPATIBLE_WARNING = true;
          `}
        </Script>
      </head>
      <body
        className={`${notoSansKr.className} font-sans antialiased max-w-4xl min-w-96 mx-auto shadow-lg relative`}
      >
        <Providers>
          <header className="relative z-50">
            <AppBarComponent />
          </header>
          <div className="container mx-auto relative">{children}</div>{" "}
        </Providers>
      </body>
    </html>
  );
}
