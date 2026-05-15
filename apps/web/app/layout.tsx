// 전역 레이아웃과 네비게이션, 글로벌 스타일을 정의한다.
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Life Key — 정기 지출 관리',
  description: '로컬 1인용 정기 지출 관리'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="topbar">
          <div className="brand">Life Key</div>
          <nav className="nav">
            <Link href="/">대시보드</Link>
            <Link href="/expenses">정기 지출</Link>
            <Link href="/calendar">캘린더</Link>
            <Link href="/summary">합계</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
