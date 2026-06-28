import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Providers } from './providers';
import './globals.css';

const pretendard = localFont({
  src: '../fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'MUUD',
  description: '감정 기반 문화예술 추천 서비스',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="min-h-dvh w-full bg-[#f0ebe3] flex justify-center font-sans">
        <div className="w-full min-[390px]:max-w-[390px] min-h-dvh flex flex-col bg-[#fbf9f4] shadow-[4px_0_24px_rgba(0,0,0,0.08),-4px_0_24px_rgba(0,0,0,0.08)]">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
