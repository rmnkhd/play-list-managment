'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { LoginRequest, RegisterRequest } from '@/types';
import toast from 'react-hot-toast';
import { authApi } from "@/services/api";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<boolean>;
    register: (data: RegisterRequest) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('access_token');
        setIsAuthenticated(!!token);
        setIsLoading(false);
    }, []);

    const login = async (data: LoginRequest): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await authApi.login(data);

            if (response.ok && response.result.access_token) {
                Cookies.set('access_token', response.result.access_token, {
                    expires: new Date(response.result.access_token_expration),
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });

                setIsAuthenticated(true);
                toast.success('با موفقیت وارد شدید');
                return true;
            }

            toast.error('نام کاربری یا رمز عبور اشتباه است');
            return false;
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'خطا در ورود به سیستم');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterRequest): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await authApi.register(data);

            if (response.ok) {
                toast.success('ثبت نام با موفقیت انجام شد. اکنون وارد شوید.');
                return true;
            }

            toast.error('خطا در ثبت نام');
            return false;
        } catch (error: any) {
            console.error('Register error:', error);
            toast.error(error.response?.data?.message || 'خطا در ثبت نام');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        Cookies.remove('access_token');
        setIsAuthenticated(false);
        toast.success('با موفقیت خارج شدید');
    };

    const value: AuthContextType = {
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};