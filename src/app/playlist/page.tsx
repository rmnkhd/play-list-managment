'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePlaylists, useCreatePlaylist, useDeletePlaylist, useUploadCover } from '@/hooks/useQueries';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ListMusic,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    Music,
    X,
    Upload,
    Loader2
} from 'lucide-react';
import { formatDate } from "@/utils";

const createPlaylistSchema = z.object({
    title: z.string().min(1, 'عنوان پلی‌لیست الزامی است'),
    cover: z.string().optional(),
});

type CreatePlaylistForm = z.infer<typeof createPlaylistSchema>;

const PlaylistsPage: React.FC = () => {
    const searchParams = useSearchParams();
    const showCreateForm = searchParams.get('action') === 'create';

    const [showDropdown, setShowDropdown] = React.useState<number | null>(null);
    const [showCreateModal, setShowCreateModal] = React.useState(showCreateForm);
    const [coverFile, setCoverFile] = React.useState<File | null>(null);
    const [coverPreview, setCoverPreview] = React.useState<string | null>(null);

    const { data: playlistsData, isLoading } = usePlaylists();
    const createPlaylistMutation = useCreatePlaylist();
    const deletePlaylistMutation = useDeletePlaylist();
    const uploadCoverMutation = useUploadCover();

    const playlists = playlistsData?.result?.items || [];

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreatePlaylistForm>({
        resolver: zodResolver(createPlaylistSchema),
    });

    React.useEffect(() => {
        if (showCreateForm) {
            setShowCreateModal(true);
        }
    }, [showCreateForm]);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setCoverPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: CreatePlaylistForm) => {
        try {
            let coverFilename = '';

            if (coverFile) {
                const uploadResult = await uploadCoverMutation.mutateAsync(coverFile);
                if (uploadResult.ok) {
                    coverFilename = uploadResult.result;
                }
            }

            await createPlaylistMutation.mutateAsync({
                title: data.title,
                ...(coverFilename && { cover: coverFilename }),
            });

            setShowCreateModal(false);
            reset();
            setCoverFile(null);
            setCoverPreview(null);
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    };

    const handleDeletePlaylist = async (id: number) => {
        if (window.confirm('آیا از حذف این پلی‌لیست اطمینان دارید؟')) {
            try {
                await deletePlaylistMutation.mutateAsync(id);
                setShowDropdown(null);
            } catch (error) {
                console.error('Error deleting playlist:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">پلی‌لیست‌ها</h1>
                    <p className="text-gray-600">مدیریت پلی‌لیست‌های خود</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>پلی‌لیست جدید</span>
                </button>
            </div>

            {/* Playlists Grid */}
            <div className="bg-white rounded-lg shadow">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : playlists.length === 0 ? (
                    <div className="text-center py-12">
                        <ListMusic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز پلی‌لیستی ندارید</h3>
                        <p className="text-gray-500 mb-4">اولین پلی‌لیست خود را ایجاد کنید</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                        >
                            <Plus className="w-5 h-5" />
                            <span>پلی‌لیست جدید</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                        {playlists.map((playlist) => (
                            <div key={playlist.id} className="group relative">
                                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    {/* Playlist Cover */}
                                    <div className="relative mb-4">
                                        {playlist.cover ? (
                                            <img
                                                src={playlist.cover}
                                                alt={playlist.title}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <ListMusic className="w-12 h-12 text-white" />
                                            </div>
                                        )}

                                        {/* Dropdown Menu */}
                                        <div className="absolute top-2 left-2">
                                            <button
                                                onClick={() => setShowDropdown(showDropdown === playlist.id ? null : playlist.id)}
                                                className="p-1 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-600" />
                                            </button>

                                            {showDropdown === playlist.id && (
                                                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                    <Link
                                                        href={`/playlists/${playlist.id}/edit`}
                                                        className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        <span>ویرایش</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeletePlaylist(playlist.id)}
                                                        disabled={deletePlaylistMutation.isPending}
                                                        className="flex items-center space-x-2 space-x-reverse w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>حذف</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Playlist Info */}
                                    <Link href={`/playlists/${playlist.id}`}>
                                        <h3 className="font-medium text-gray-900 mb-2 truncate hover:text-blue-600 transition-colors">
                                            {playlist.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center space-x-1 space-x-reverse">
                                            <Music className="w-4 h-4" />
                                            <span>{playlist.songs.length} آهنگ</span>
                                        </div>
                                        <span>{formatDate(playlist.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Playlist Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-lg font-semibold">پلی‌لیست جدید</h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    reset();
                                    setCoverFile(null);
                                    setCoverPreview(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    عنوان پلی‌لیست
                                </label>
                                <input
                                    {...register('title')}
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="عنوان پلی‌لیست خود را وارد کنید"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    تصویر جلد
                                </label>
                                <div className="flex items-center space-x-4 space-x-reverse">
                                    {coverPreview ? (
                                        <img
                                            src={coverPreview}
                                            alt="Preview"
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <ListMusic className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                    <label className="cursor-pointer flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        <Upload className="w-4 h-4" />
                                        <span>انتخاب تصویر</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        reset();
                                        setCoverFile(null);
                                        setCoverPreview(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    انصراف
                                </button>
                                <button
                                    type="submit"
                                    disabled={createPlaylistMutation.isPending || uploadCoverMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
                                >
                                    {(createPlaylistMutation.isPending || uploadCoverMutation.isPending) ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>در حال ایجاد...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            <span>ایجاد پلی‌لیست</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowDropdown(null)}
                />
            )}
        </div>
    );
};

export default PlaylistsPage;