'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePlaylist, useRemoveSongFromPlaylist, useSongs, useAddSongToPlaylist } from '@/hooks/useQueries';
import {
    ListMusic,
    Music,
    Play,
    Download,
    Trash2,
    Edit2,
    Plus,
    Search,
    ArrowLeft,
    Clock,
    Calendar
} from 'lucide-react';
import { formatDate, formatDuration } from "@/utils";

const PlaylistDetailPage: React.FC = () => {
    const params = useParams();
    const playlistId = parseInt(params.id as string);

    const [showAddSongs, setShowAddSongs] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    const { data: playlistData, isLoading } = usePlaylist(playlistId);
    const { data: songsData, isLoading: songsLoading } = useSongs({
        ...(searchTerm && { title: searchTerm }),
        'per-page': 50,
    });

    const removeSongMutation = useRemoveSongFromPlaylist();
    const addSongMutation = useAddSongToPlaylist();

    const playlist = playlistData?.result;
    const allSongs = songsData?.result?.items || [];

    // Filter out songs that are already in the playlist
    const availableSongs = allSongs.filter(song =>
        !playlist?.songs.some(playlistSong => playlistSong.id === song.id)
    );

    const handleRemoveSong = async (songId: number) => {
        if (window.confirm('آیا از حذف این آهنگ از پلی‌لیست اطمینان دارید؟')) {
            try {
                await removeSongMutation.mutateAsync({ playlistId, songId });
            } catch (error) {
                console.error('Error removing song:', error);
            }
        }
    };

    const handleAddSong = async (songId: number) => {
        try {
            await addSongMutation.mutateAsync({ playlistId, songId });
            setSearchTerm(''); // Reset search to refresh available songs
        } catch (error) {
            console.error('Error adding song:', error);
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

    const totalDuration = playlist?.songs.reduce((total, song) => total + parseFloat(song.duration || '0'), 0) || 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="text-center py-12">
                <ListMusic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">پلی‌لیست پیدا نشد</p>
                <Link
                    href="/playlists"
                    className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                >
                    بازگشت به پلی‌لیست‌ها
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                <Link href="/playlists" className="hover:text-gray-700">
                    پلی‌لیست‌ها
                </Link>
                <ArrowLeft className="w-4 h-4 rotate-180" />
                <span className="text-gray-900">{playlist.title}</span>
            </div>

            {/* Playlist Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start space-x-6 space-x-reverse">
                    {/* Cover */}
                    <div className="flex-shrink-0">
                        {playlist.cover ? (
                            <img
                                src={playlist.cover}
                                alt={playlist.title}
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                        ) : (
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <ListMusic className="w-16 h-16 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{playlist.title}</h1>
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <Link
                                    href={`/playlists/${playlist.id}/edit`}
                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="ویرایش پلی‌لیست"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => setShowAddSongs(true)}
                                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>اضافه کردن آهنگ</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Music className="w-4 h-4" />
                                <span>{playlist.songs.length} آهنگ</span>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Clock className="w-4 h-4" />
                                <span>{Math.floor(totalDuration / 60)} دقیقه</span>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Calendar className="w-4 h-4" />
                                <span>ایجاد شده در {formatDate(playlist.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Songs List */}
            <div className="bg-white rounded-lg shadow">
                {playlist.songs.length === 0 ? (
                    <div className="text-center py-12">
                        <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">پلی‌لیست خالی است</h3>
                        <p className="text-gray-500 mb-4">آهنگ‌هایی به این پلی‌لیست اضافه کنید</p>
                        <button
                            onClick={() => setShowAddSongs(true)}
                            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                        >
                            <Plus className="w-4 h-4" />
                            <span>اضافه کردن آهنگ</span>
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                                <div className="col-span-1">#</div>
                                <div className="col-span-4">آهنگ</div>
                                <div className="col-span-3">هنرمند</div>
                                <div className="col-span-2">آلبوم</div>
                                <div className="col-span-1">مدت</div>
                                <div className="col-span-1">عملیات</div>
                            </div>
                        </div>

                        {/* Songs */}
                        <div className="divide-y divide-gray-200">
                            {playlist.songs.map((song, index) => (
                                <div key={song.id} className="px-6 py-4 hover:bg-gray-50 group">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-1">
                                            <div className="flex items-center justify-center w-8 h-8 text-gray-400 group-hover:text-blue-600">
                                                <span className="group-hover:hidden">{index + 1}</span>
                                                <Play className="w-4 h-4 hidden group-hover:block" />
                                            </div>
                                        </div>

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
                                        <div className="col-span-1 text-gray-600">{formatDuration(song.duration)}</div>

                                        <div className="col-span-1">
                                            <div className="flex items-center space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDownload(song.file, song.title)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="دانلود"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveSong(song.id)}
                                                    disabled={removeSongMutation.isPending}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                                    title="حذف از پلی‌لیست"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add Songs Modal */}
            {showAddSongs && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-lg font-semibold">اضافه کردن آهنگ به پلی‌لیست</h2>
                            <button
                                onClick={() => setShowAddSongs(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-6 border-b">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="جستجو در آهنگ‌ها..."
                                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Available Songs */}
                        <div className="flex-1 overflow-hidden">
                            {songsLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : availableSongs.length === 0 ? (
                                <div className="text-center py-8">
                                    <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {searchTerm
                                            ? 'آهنگی با این عنوان پیدا نشد'
                                            : 'همه آهنگ‌ها در این پلی‌لیست موجود هستند'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-y-auto max-h-96">
                                    <div className="divide-y divide-gray-200">
                                        {availableSongs.map((song) => (
                                            <div key={song.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                                                <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-0">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                        <Music className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-900 truncate">{song.title}</h4>
                                                        <p className="text-sm text-gray-500 truncate">{song.artist_name} • {song.album_name}</p>
                                                    </div>
                                                    <div className="text-sm text-gray-500">{formatDuration(song.duration)}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddSong(song.id)}
                                                    disabled={addSongMutation.isPending}
                                                    className="mr-4 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-1 space-x-reverse"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span className="text-sm">اضافه</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t">
                            <button
                                onClick={() => setShowAddSongs(false)}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                بستن
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistDetailPage;