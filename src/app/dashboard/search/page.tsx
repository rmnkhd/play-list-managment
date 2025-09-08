'use client';

import React from 'react';
import { useSongs, usePlaylists, useAddSongToPlaylist } from '@/hooks/useQueries';
import { Search, Music, ListMusic, Download, Plus, Loader2 } from 'lucide-react';
import { formatDuration } from "@/utils";

const SearchPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [showAddToPlaylist, setShowAddToPlaylist] = React.useState<number | null>(null);

    const perPage = 20;

    // Debounce search term
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: songsData, isLoading: songsLoading } = useSongs({
        ...(debouncedSearchTerm && { title: debouncedSearchTerm }),
        page: currentPage,
        'per-page': perPage,
    });

    const { data: playlistsData } = usePlaylists();
    const addToPlaylistMutation = useAddSongToPlaylist();

    const songs = songsData?.result?.items || [];
    const playlists = playlistsData?.result?.items || [];

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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">جستجو</h1>
                <p className="text-gray-600">در میان آهنگ‌ها جستجو کنید</p>
            </div>

            {/* Search Input */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="نام آهنگ، هنرمند یا آلبوم را جستجو کنید..."
                        className="w-full pr-12 pl-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                {searchTerm && (
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <span>{`جستجو برای: "${searchTerm}"`}</span>
                        {debouncedSearchTerm !== searchTerm && (
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Loader2 className="w-4 h-4 animate-spin"/>
                                <span>در حال جستجو...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Search Results */}
            <div className="bg-white rounded-lg shadow">
                {!debouncedSearchTerm ? (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">آماده برای جستجو</h3>
                        <p className="text-gray-500">عبارت مورد نظر خود را در بالا تایپ کنید</p>
                    </div>
                ) : songsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : songs.length === 0 ? (
                    <div className="text-center py-12">
                        <Music className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">نتیجه‌ای یافت نشد</h3>
                        <p className="text-gray-500">
                            {`آهنگی با عبارت "${debouncedSearchTerm}" پیدا نشد`}
                        </p>

                        <p className="text-gray-400 text-sm mt-2">کلمات کلیدی مختلفی امتحان کنید</p>
                    </div>
                ) : (
                    <>
                        {/* Results Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">
                                    نتایج جستجو ({songs.length} آهنگ)
                                </h2>
                                <div className="text-sm text-gray-500">
                                    صفحه {currentPage}
                                </div>
                            </div>
                        </div>

                        {/* Results Table Header */}
                        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                                <div className="col-span-4">آهنگ</div>
                                <div className="col-span-3">هنرمند</div>
                                <div className="col-span-2">آلبوم</div>
                                <div className="col-span-1">سال</div>
                                <div className="col-span-1">مدت</div>
                                <div className="col-span-1">عملیات</div>
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="divide-y divide-gray-200">
                            {songs.map((song, index) => (
                                <div key={song.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4 flex items-center space-x-3 space-x-reverse">
                                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <Music className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-medium text-gray-900 truncate">{song.title}</h4>
                                                <p className="text-sm text-gray-500 truncate capitalize">{song.format}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 truncate text-gray-900">{song.artist_name}</div>
                                        <div className="col-span-2 truncate text-gray-600">{song.album_name}</div>
                                        <div className="col-span-1 text-gray-600">{song.year}</div>
                                        <div className="col-span-1 text-gray-600">{formatDuration(song.duration)}</div>
                                        <div className="col-span-1">
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <button
                                                    onClick={() => handleDownload(song.file, song.title)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="دانلود آهنگ"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>

                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowAddToPlaylist(showAddToPlaylist === song.id ? null : song.id)}
                                                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                                        title="اضافه به پلی‌لیست"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>

                                                    {showAddToPlaylist === song.id && (
                                                        <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                            <div className="p-2">
                                                                <p className="text-xs text-gray-500 mb-2">اضافه به پلی‌لیست:</p>
                                                                {playlists.length === 0 ? (
                                                                    <p className="text-sm text-gray-500 py-2 text-center">پلی‌لیستی موجود نیست</p>
                                                                ) : (
                                                                    <div className="max-h-32 overflow-y-auto">
                                                                        {playlists.map((playlist) => (
                                                                            <button
                                                                                key={playlist.id}
                                                                                onClick={() => handleAddToPlaylist(song.id, playlist.id)}
                                                                                disabled={addToPlaylistMutation.isPending}
                                                                                className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center justify-between disabled:opacity-50"
                                                                            >
                                                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                                                    <ListMusic className="w-3 h-3 text-gray-400" />
                                                                                    <span className="truncate">{playlist.title}</span>
                                                                                </div>
                                                                                {addToPlaylistMutation.isPending && (
                                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                                )}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    صفحه قبل
                                </button>
                                <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg">
                  صفحه {currentPage}
                </span>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={songs.length < perPage}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    صفحه بعد
                                </button>
                            </div>
                            <div className="text-sm text-gray-600">
                                {songs.length} آهنگ در این صفحه
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Click outside to close dropdown */}
            {showAddToPlaylist && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowAddToPlaylist(null)}
                />
            )}
        </div>
    );
};

export default SearchPage;