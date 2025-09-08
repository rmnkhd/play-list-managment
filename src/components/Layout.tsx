'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    Home,
    Music,
    ListMusic,
    LogOut,
    User,
    Search
} from 'lucide-react';
import { cn } from '@/utils';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    const navigation = [
        { name: 'داشبورد', href: '/dashboard', icon: Home },
        { name: 'آهنگ ‌ها', href: '/songs', icon: Music },
        { name: 'پلی‌ لیست ها', href: '/playlist', icon: ListMusic },
        { name: 'جستجو', href: '/search', icon: Search },
    ];

    if (!isAuthenticated) {
        return <div className="min-h-screen bg-gray-50">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            <div className="w-64 bg-white shadow-lg fixed h-full">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-8">موزیک پلیر</h1>

                    <nav className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">کاربر</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="خروج"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 mr-64">
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;