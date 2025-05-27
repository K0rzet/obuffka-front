import { makeAutoObservable, runInAction } from 'mobx';
import axiosInstance from '../api/axiosInstance';
import { User, LoginResponse } from '../types/user';

class AuthStore {
    user: User | null = null;
    isLoading: boolean = false;
    error: string | null = null;
    isInitialized: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    async initAuth() {
        if (this.isInitialized) return;
        
        this.isLoading = true;
        this.error = null;
        
        try {
            // Проверяем, есть ли уже токен
            const existingToken = localStorage.getItem('token');
            if (existingToken) {
                await this.fetchCurrentUser();
                if (this.user) {
                    this.isInitialized = true;
                    return;
                }
            }

            // Инициализируем Telegram WebApp
            await this.initTelegramWebApp();
            
            // Получаем initData
            const initData = this.getTelegramInitData();
            
            if (!initData) {
                // Если мы не в Telegram WebApp, создаем тестового пользователя для разработки
                if (import.meta.env.DEV) {
                    await this.createTestUser();
                    return;
                }
                throw new Error('Приложение должно быть запущено в Telegram');
            }

            // Авторизуемся через Telegram
            await this.loginWithTelegram(initData);
            
        } catch (error) {
            console.error('Ошибка инициализации авторизации:', error);
            runInAction(() => {
                this.error = error instanceof Error ? error.message : 'Ошибка авторизации';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
                this.isInitialized = true;
            });
        }
    }

    private async initTelegramWebApp(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Если Telegram WebApp уже доступен
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
                resolve();
                return;
            }

            // Загружаем скрипт Telegram WebApp
            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-web-app.js';
            script.onload = () => {
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.ready();
                    window.Telegram.WebApp.expand();
                    resolve();
                } else {
                    reject(new Error('Не удалось загрузить Telegram WebApp'));
                }
            };
            script.onerror = () => {
                reject(new Error('Ошибка загрузки скрипта Telegram WebApp'));
            };
            
            document.head.appendChild(script);
        });
    }

    private getTelegramInitData(): string | null {
        if (window.Telegram?.WebApp?.initData) {
            return window.Telegram.WebApp.initData;
        }
        
        // Для тестирования можно использовать URL параметры
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tgWebAppData');
    }

    private async loginWithTelegram(initData: string) {
        try {
            const response = await axiosInstance.post<LoginResponse>('/auth/login', {
                initData
            });
            
            runInAction(() => {
                this.user = response.data.user;
                localStorage.setItem('token', response.data.token);
                this.error = null;
            });
        } catch (error: any) {
            console.error('Ошибка авторизации через Telegram:', error);
            throw new Error(
                error.response?.data?.message || 
                'Ошибка авторизации через Telegram'
            );
        }
    }

    private async createTestUser() {
        // Создаем тестового пользователя для разработки
        const testUser: User = {
            id: 1,
            telegramId: '123456789',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            isAdmin: true
        };
        
        runInAction(() => {
            this.user = testUser;
            localStorage.setItem('token', 'test-token');
            this.error = null;
        });
    }

    async fetchCurrentUser() {
        try {
            const response = await axiosInstance.get<User>('/auth/me');
            runInAction(() => {
                this.user = response.data;
                this.error = null;
            });
        } catch (error: any) {
            console.error('Ошибка получения данных пользователя:', error);
            
            // Если токен недействителен, удаляем его
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                runInAction(() => {
                    this.user = null;
                });
            }
            
            throw error;
        }
    }

    logout() {
        runInAction(() => {
            this.user = null;
            this.error = null;
            this.isInitialized = false;
        });
        localStorage.removeItem('token');
        
        // Закрываем Telegram WebApp при выходе
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.close();
        }
    }

    clearError() {
        runInAction(() => {
            this.error = null;
        });
    }

    // Геттеры для удобства
    get isAuthenticated(): boolean {
        return !!this.user;
    }

    get isAdmin(): boolean {
        return this.user?.isAdmin || false;
    }
}

export const authStore = new AuthStore(); 