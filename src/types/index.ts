export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
}

export interface Song {
    id: number;
    album_name: string;
    artist_name: string;
    duration: string;
    title: string;
    year: string;
    file: string;
    format: string;
}

export interface Playlist {
    id: number;
    title: string;
    cover: string;
    created_at: string;
    updated_at: string | null;
    songs: Song[];
}

export interface AuthResponse {
    ok: boolean;
    result: {
        access_token: string;
        access_token_expration: string;
    };
}

export interface RegisterRequest {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface CreatePlaylistRequest {
    title: string;
    cover?: string;
}

export interface UpdatePlaylistRequest {
    title?: string;
    cover?: string;
}

export interface ApiResponse<T> {
    ok: boolean;
    result: T;
}

export interface PaginatedResponse<T> {
    items: T[];
}

export interface SearchFilters {
    title?: string;
    page?: number;
    'per-page'?: number;
}