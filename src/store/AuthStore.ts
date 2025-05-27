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
                try {
                    await this.fetchCurrentUser();
                    if (this.user) {
                        this.isInitialized = true;
                        return;
                    }
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }

            // Инициализируем Telegram WebApp
            await this.initTelegramWebApp();
            
            // Получаем initData
            const initData = this.getTelegramInitData();
            
            if (!initData) {
                await this.createTestUser();
                return;
            }

            // Пытаемся авторизоваться через Telegram
            try {
                await this.loginWithTelegram(initData);
            } catch (telegramError: any) {
                // Если backend недоступен, переходим на тестовый режим
                if (
                    telegramError.message.includes('Backend недоступен') ||
                    telegramError.message.includes('Ошибка валидации') ||
                    telegramError.message.includes('Нет соединения') ||
                    !telegramError.response
                ) {
                    await this.createTestUser();
                } else {
                    throw telegramError;
                }
            }
            
        } catch (error) {
            console.error('Критическая ошибка инициализации авторизации:', error);
            
            runInAction(() => {
                this.error = error instanceof Error ? error.message : 'Ошибка авторизации';
            });
            
            // В любом случае создаем тестового пользователя
            try {
                await this.createTestUser();
            } catch (testError) {
                console.error('Не удалось создать тестового пользователя:', testError);
            }
        } finally {
            runInAction(() => {
                this.isLoading = false;
                this.isInitialized = true;
            });
        }
    }

    private async initTelegramWebApp(): Promise<void> {
        return new Promise((resolve) => {
            // Если Telegram WebApp уже доступен
            if (window.Telegram?.WebApp) {
                try {
                    window.Telegram.WebApp.ready();
                    window.Telegram.WebApp.expand();
                    resolve();
                } catch (error) {
                    resolve(); // Не блокируем выполнение
                }
                return;
            }

            // Загружаем скрипт Telegram WebApp
            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-web-app.js';
            script.onload = () => {
                try {
                    if (window.Telegram?.WebApp) {
                        window.Telegram.WebApp.ready();
                        window.Telegram.WebApp.expand();
                        resolve();
                    } else {
                        resolve(); // Не блокируем выполнение
                    }
                } catch (error) {
                    resolve(); // Не блокируем выполнение
                }
            };
            script.onerror = () => {
                resolve(); // Не блокируем выполнение
            };
            
            document.head.appendChild(script);
        });
    }

    private getTelegramInitData(): string | null {
        try {
            if (window.Telegram?.WebApp?.initData) {
                return window.Telegram.WebApp.initData;
            }
        } catch (error) {
            // Игнорируем ошибки получения initData
        }
        
        // Для тестирования можно использовать URL параметры
        const urlParams = new URLSearchParams(window.location.search);
        const urlInitData = urlParams.get('tgWebAppData');
        if (urlInitData) {
            return urlInitData;
        }
        
        return null;
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
            // Проверяем тип ошибки
            if (error.response?.status === 404) {
                throw new Error('Backend недоступен или неправильно настроен');
            } else if (error.response?.status === 401) {
                throw new Error('Ошибка валидации данных Telegram');
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                throw new Error('Нет соединения с сервером');
            }
            
            throw error;
        }
    }

    private async createTestUser() {
        runInAction(() => {
            this.user = {
                id: 999999999,
                firstName: 'Тестовый',
                lastName: 'Пользователь',
                username: 'test_user',
                isAdmin: false
            };
            this.error = null;
            this.isTestMode = true;
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
            this.isTestMode = false;
        });
        localStorage.removeItem('token');
    }

    clearError() {
        runInAction(() => {
            this.error = null;
        });
    }

    async forceTestMode() {
        await this.createTestUser();
    }

    get isAuthenticated(): boolean {
        return !!this.user;
    }

    get isAdmin(): boolean {
        return this.user?.isAdmin || this.isTestMode;
    }

    get isTestMode(): boolean {
        return this.user?.id === 999999999;
    }

    private isTestMode: boolean = false;
}

export const authStore = new AuthStore(); 