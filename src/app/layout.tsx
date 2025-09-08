import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { clsx } from "clsx";

import './globals.css';
import { Providers } from "@/app/providers/providers";

const inter = Inter({ subsets: ['latin'] });

const yekanBakh = localFont({
    variable: '--YekanBakh',
    src: [{ path: '../assets/fonts/YekanBakhFaNum-VF.woff2' }],
});

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
            <body
                className={clsx(
                    inter.className,
                    yekanBakh.className,
                    'bg-gradient-to-br from-gray-300 to-gray-600 min-h-screen'
                )}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}