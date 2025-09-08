import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'موزیک پلیر - مدیریت پلی‌لیست‌های موزیکی',
    description: 'پلتفرم مدیریت و پخش موزیک با قابلیت ایجاد پلی‌لیست‌های شخصی',
    manifest: '/manifest.json',
    themeColor: '#2563eb',
    viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fa" dir="rtl">
        <body className={inter.className}>
        {children}
        </body>
        </html>
    );
}