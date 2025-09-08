'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Music, Eye, EyeOff, Loader2 } from 'lucide-react';
import { LoginRequest } from '@/types';

// ✅ اعتبارسنجی فرم
const loginSchema = z.object({
    username: z.string().min(1, 'نام کاربری الزامی است'),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isLoading } = useAuth();

    const [showPassword, setShowPassword] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    // ✅ ارسال فرم
    const onSubmit = async (data: LoginForm) => {
        const success = await login(data as LoginRequest);
        if (success) {
            const redirectPath = searchParams.get('redirect') || '/dashboard';
            router.push(redirectPath);
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
            dir="rtl"
        >
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Music className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            ورود به حساب کاربری
                        </h1>
                        <p className="text-gray-600">به موزیک پلیر خوش آمدید</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نام کاربری
                            </label>
                            <input
                                {...register('username')}
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="نام کاربری خود را وارد کنید"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                رمز عبور
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                                    placeholder="رمز عبور خود را وارد کنید"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                                    در حال ورود...
                                </>
                            ) : (
                                'ورود'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            حساب کاربری ندارید؟{' '}
                            <Link
                                href="/auth/register"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                ثبت نام کنید
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
