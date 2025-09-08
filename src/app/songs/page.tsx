'use client';

import React, { useEffect } from 'react';
import { useSongs, usePlaylists, useAddSongToPlaylist } from '@/hooks/useQueries';
import { Music, Search, Download, Plus, Loader2 } from 'lucide-react';
import { formatDuration } from "@/utils";

const SongsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [showAddToPlaylist, setShowAddToPlaylist] = React.useState<number | null>(null);

    const perPage = 20;

    const { data: songsData, isLoading: songsLoading } = useSongs({
        ...(debouncedSearchTerm  && { title: debouncedSearchTerm  }),
        page: currentPage,
        'per-page': perPage,
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 2000);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data: playlistsData, isLoading: playlistsLoading } = usePlaylists();
    const addToPlaylistMutation = useAddSongToPlaylist();

    const songs = songsData?.result?.items || [];
    const playlists = playlistsData?.result?.items || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleAddToPlaylist = async (songId: number, playlistId: number) => {
        try {
            await addToPlaylistMutation.mutateAsync({ playlistId, songId });
            setShowAddToPlaylist(null);
        } catch (error) {
            console.error('Error adding song to playlist:', error);
        }
    };

    const handleDownload = (fileUrl: string, title: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `${title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 p-8" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">آهنگ ‌ها</h1>
                <p className="text-gray-600">مرور و جستجو در همه آهنگ ‌ها</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="جستجو در آهنگ ‌ها..."
                            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        جستجو
                    </button>
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                setCurrentPage(1);
                            }}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            پاک کردن
                        </button>
                    )}
                </form>
            </div>

            <div className="bg-white rounded-lg shadow">
                {songsLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : songs.length === 0 ? (
                    <div className="text-center py-12">
                        <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {searchTerm ? 'آهنگی با این عنوان پیدا نشد' : 'هیچ آهنگی موجود نیست'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                                <div className="col-span-4">آهنگ</div>
                                <div className="col-span-3">هنرمند</div>
                                <div className="col-span-2">آلبوم</div>
                                <div className="col-span-1">سال</div>
                                <div className="col-span-1">مدت</div>
                                <div className="col-span-1">عملیات</div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {songs.map((song) => (
                                <div key={song.id} className="px-6 py-4 hover:bg-gray-50">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4 flex items-center space-x-3 space-x-reverse">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <Music className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-medium text-gray-900 truncate">{song.title}</h4>
                                                <p className="text-sm text-gray-500 truncate">{song.format}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 truncate">{song.artist_name}</div>
                                        <div className="col-span-2 truncate text-gray-600">{song.album_name}</div>
                                        <div className="col-span-1 text-gray-600">{song.year}</div>
                                        <div className="col-span-1 text-gray-600">{formatDuration(song.duration)}</div>
                                        <div className="col-span-1">
                                            <div className="flex items-center space-x-2 space-x-reverse relative">
                                                <button
                                                    onClick={() => handleDownload(song.file, song.title)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="دانلود"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>

                                                <div className="relative">
                                                    <button
                                                        onClick={() =>
                                                            setShowAddToPlaylist(showAddToPlaylist === song.id ? null : song.id)
                                                        }
                                                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                                        title="اضافه به پلی‌ لیست"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>

                                                    {showAddToPlaylist === song.id && (
                                                        <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                            {playlistsLoading ? (
                                                                <div className="p-3 text-center text-gray-500 text-sm">
                                                                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                                                                    در حال بارگذاری...
                                                                </div>
                                                            ) : playlists.length === 0 ? (
                                                                <div className="p-3 text-center text-gray-500 text-sm">
                                                                    هیچ پلی‌لیستی موجود نیست
                                                                </div>
                                                            ) : (
                                                                playlists.map((playlist) => (
                                                                    <button
                                                                        key={playlist.id}
                                                                        onClick={() => handleAddToPlaylist(song.id, playlist.id)}
                                                                        className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    >
                                                                        {playlist.title}
                                                                    </button>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SongsPage;
