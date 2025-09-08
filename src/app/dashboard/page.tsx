'use client';

import React from 'react';
import Link from 'next/link';
import { usePlaylists, useSongs } from '@/hooks/useQueries';
import { Music, ListMusic, Plus, TrendingUp, Clock } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { data: playlistsData, isLoading: playlistsLoading } = usePlaylists();
    const { data: songsData, isLoading: songsLoading } = useSongs({ 'per-page': 10 });

    const playlists = playlistsData?.result?.items || [];
    const songs = songsData?.result?.items || [];

    const stats = [
        {
            name: 'تعداد پلی‌ لیست ها',
            value: playlists.length,
            icon: ListMusic,
            color: 'bg-blue-500',
        },
        {
            name: 'تعداد آهنگ ‌ها',
            value: songs.length,
            icon: Music,
            color: 'bg-green-500',
        },
        {
            name: 'اخیراً اضافه شده',
            value: playlists.filter(p => {
                const createdAt = new Date(p.created_at);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return createdAt > weekAgo;
            }).length,
            icon: TrendingUp,
            color: 'bg-purple-500',
        },
        {
            name: 'مدت زمان کل',
            value: `${Math.floor(songs.reduce((total, song) => total + parseFloat(song.duration || '0'), 0) / 60)} دقیقه`,
            icon: Clock,
            color: 'bg-orange-500',
        },
    ];

    return (
        <div className="space-y-8 p-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-5">داشبورد</h1>
                <p className="text-gray-600">نمای کلی از موزیک پلیر شما</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className={`${stat.color} rounded-lg p-3`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">عملیات سریع</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/playlist"
                        className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        <Plus className="w-6 h-6 text-gray-400 ml-3" />
                        <div>
                            <h3 className="font-medium text-gray-900">پلی‌ لیست جدید</h3>
                            <p className="text-sm text-gray-500">ایجاد پلی‌ لیست جدید</p>
                        </div>
                    </Link>

                    <Link
                        href="/songs"
                        className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                        <Music className="w-6 h-6 text-gray-400 ml-3" />
                        <div>
                            <h3 className="font-medium text-gray-900">مرور و جستجو آهنگ ‌ها</h3>
                            <p className="text-sm text-gray-500">مشاهده همه آهنگ ‌ها</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">آخرین پلی‌ لیست ها</h2>
                    <Link
                        href="/playlist"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        مشاهده همه
                    </Link>
                </div>

                {playlistsLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : playlists.length === 0 ? (
                    <div className="text-center py-8">
                        <ListMusic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">هنوز پلی‌لیستی ایجاد نکرده‌اید</p>
                        <Link
                            href="/playlist"
                            className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                        >
                            اولین پلی‌ لیست خود را بسازید
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {playlists.slice(0, 6).map((playlist) => (
                            <Link
                                key={playlist.id}
                                href={`/playlist/${playlist.id}`}
                                className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <ListMusic className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">{playlist.title}</h3>
                                        <p className="text-sm text-gray-500">{playlist.songs.length} آهنگ</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">آهنگ‌ های اخیر</h2>
                    <Link
                        href="/songs"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        مشاهده همه
                    </Link>
                </div>

                {songsLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {songs.slice(0, 5).map((song) => (
                            <div key={song.id} className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-gray-50">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Music className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{song.title}</h4>
                                    <p className="text-sm text-gray-500 truncate">{song.artist_name}</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {Math.floor(parseFloat(song.duration) / 60)}:{Math.floor(parseFloat(song.duration) % 60).toString().padStart(2, '0')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;