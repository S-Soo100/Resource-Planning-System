"use client";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import AppBarComponent from "../components/appbar/Appbar";
import Providers from "./providers";

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
      <body
        className={`${notoSansKr.className} font-sans antialiased max-w-3xl min-w-96 mx-auto shadow-lg relative`}
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
