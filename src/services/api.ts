import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import {
    ApiResponse,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    Song,
    Playlist,
    PaginatedResponse,
    SearchFilters,
    CreatePlaylistRequest,
    UpdatePlaylistRequest
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://188.121.116.185';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove('access_token');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    register: async (data: RegisterRequest): Promise<ApiResponse<any>> => {
        const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/site/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response: AxiosResponse<AuthResponse> = await apiClient.post('/site/login', data);
        return response.data;
    },
};

export const songsApi = {
    getSongs: async (filters: SearchFilters = {}): Promise<ApiResponse<PaginatedResponse<Song>>> => {
        const params = new URLSearchParams();

        if (filters.title) {
            params.append('filter[title][like]', filters.title);
        }
        if (filters.page) {
            params.append('page', filters.page.toString());
        }
        if (filters['per-page']) {
            params.append('per-page', filters['per-page'].toString());
        }

        const response: AxiosResponse<ApiResponse<PaginatedResponse<Song>>> = await apiClient.get(
            `/song?${params.toString()}`
        );
        return response.data;
    },
};

export const playlistsApi = {
    getPlaylists: async (): Promise<ApiResponse<PaginatedResponse<Playlist>>> => {
        const response: AxiosResponse<ApiResponse<PaginatedResponse<Playlist>>> = await apiClient.get('/playlist');
        return response.data;
    },

    getPlaylist: async (id: number): Promise<ApiResponse<Playlist>> => {
        const response: AxiosResponse<ApiResponse<Playlist>> = await apiClient.get(`/playlist/${id}`);
        return response.data;
    },

    createPlaylist: async (data: CreatePlaylistRequest): Promise<ApiResponse<Playlist>> => {
        const response: AxiosResponse<ApiResponse<Playlist>> = await apiClient.post('/playlist', data);
        return response.data;
    },

    updatePlaylist: async (id: number, data: UpdatePlaylistRequest): Promise<ApiResponse<Playlist>> => {
        const response: AxiosResponse<ApiResponse<Playlist>> = await apiClient.patch(`/playlist/${id}`, data);
        return response.data;
    },

    deletePlaylist: async (id: number): Promise<void> => {
        await apiClient.delete(`/playlist/${id}`);
    },

    addSongToPlaylist: async (playlistId: number, songId: number): Promise<ApiResponse<Playlist>> => {
        const response: AxiosResponse<ApiResponse<Playlist>> = await apiClient.post(
            `/playlist/add-song/${playlistId}`,
            { song_id: songId }
        );
        return response.data;
    },

    removeSongFromPlaylist: async (playlistId: number, songId: number): Promise<void> => {
        await apiClient.delete(`/playlist/remove-song/${playlistId}`, {
            data: { song_id: songId }
        });
    },

    uploadCover: async (file: File): Promise<ApiResponse<string>> => {
        const formData = new FormData();
        formData.append('image', file);

        const response: AxiosResponse<ApiResponse<string>> = await apiClient.post(
            '/uploader/playlist-cover',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },
};

export default apiClient;