import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchFilters, CreatePlaylistRequest, UpdatePlaylistRequest } from '@/types';
import toast from 'react-hot-toast';
import { playlistsApi, songsApi } from "@/services/api";

// Songs hooks
export const useSongs = (filters: SearchFilters = {}) => {
    return useQuery({
        queryKey: ['songs', filters],
        queryFn: () => songsApi.getSongs(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Playlists hooks
export const usePlaylists = () => {
    return useQuery({
        queryKey: ['playlists'],
        queryFn: () => playlistsApi.getPlaylists(),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const usePlaylist = (id: number) => {
    return useQuery({
        queryKey: ['playlist', id],
        queryFn: () => playlistsApi.getPlaylist(id),
        enabled: !!id,
    });
};

export const useCreatePlaylist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePlaylistRequest) => playlistsApi.createPlaylist(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
            toast.success('پلی‌ لیست با موفقیت ایجاد شد');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'خطا در ایجاد پلی‌ لیست');
        },
    });
};

export const useUpdatePlaylist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePlaylistRequest }) =>
            playlistsApi.updatePlaylist(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
            queryClient.invalidateQueries({ queryKey: ['playlist', variables.id] });
            toast.success('پلی‌ لیست با موفقیت به‌روزرسانی شد');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی پلی‌ لیست');
        },
    });
};

export const useDeletePlaylist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => playlistsApi.deletePlaylist(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
            toast.success('پلی‌ لیست با موفقیت حذف شد');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'خطا در حذف پلی‌ لیست');
        },
    });
};

export const useAddSongToPlaylist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ playlistId, songId }: { playlistId: number; songId: number }) =>
            playlistsApi.addSongToPlaylist(playlistId, songId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlistId] });
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
            toast.success('آهنگ به پلی‌ لیست اضافه شد');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'خطا در اضافه کردن آهنگ');
        },
    });
};

export const useRemoveSongFromPlaylist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ playlistId, songId }: { playlistId: number; songId: number }) =>
            playlistsApi.removeSongFromPlaylist(playlistId, songId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlistId] });
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
            toast.success('آهنگ از پلی‌ لیست حذف شد');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'خطا در حذف آهنگ');
        },
    });
};

export const useUploadCover = () => {
    return useMutation({
        mutationFn: (file: File) => playlistsApi.uploadCover(file),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'خطا در آپلود تصویر');
        },
    });
};