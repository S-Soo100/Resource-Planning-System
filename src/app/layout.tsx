import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import AppBarComponent from "../components/appbar/Appbar";

const notoSansKr = Noto_Sans_KR({
  // preload: true, 기본값
  subsets: ["latin"], // 또는 preload: false
  weight: ["100", "400", "700", "900"], // 가변 폰트가 아닌 경우, 사용할 fontWeight 배열
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSansKr.className} font-sans antialiased max-w-3xl min-w-96 mx-auto shadow-lg`}
      >
        <header>
          <AppBarComponent />
        </header>
        <div className="container mx-auto">{children}</div>
      </body>
    </html>
  );
}
