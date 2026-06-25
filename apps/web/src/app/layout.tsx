import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

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
    <html lang="ko">
      <body className="min-h-dvh w-full bg-[#f0ebe3] flex justify-center">
        <div className="w-full max-w-[390px] min-h-dvh flex flex-col bg-[#fbf9f4] shadow-[4px_0_24px_rgba(0,0,0,0.08),-4px_0_24px_rgba(0,0,0,0.08)]">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
