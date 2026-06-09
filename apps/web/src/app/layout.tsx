import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
