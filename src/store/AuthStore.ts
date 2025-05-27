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
                    // Если токен недействителен, удаляем его и продолжаем
                    localStorage.removeItem('token');
                }
            }

            // Инициализируем Telegram WebApp
            await this.initTelegramWebApp();
            
            // Получаем initData
            const initData = this.getTelegramInitData();
            
            if (!initData) {
                // Если мы не в Telegram WebApp, создаем тестового пользователя для разработки
                await this.createTestUser();
                return;
            }

            // Пытаемся авторизоваться через Telegram
            try {
                await this.loginWithTelegram(initData);
            } catch (telegramError) {
                console.warn('Ошибка авторизации через Telegram, переключаемся на тестовый режим:', telegramError);
                // Если авторизация через Telegram не удалась, используем тестовый режим
                await this.createTestUser();
            }
            
        } catch (error) {
            console.error('Ошибка инициализации авторизации:', error);
            runInAction(() => {
                this.error = error instanceof Error ? error.message : 'Ошибка авторизации';
            });
            
            // В крайнем случае создаем тестового пользователя
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
        return new Promise((resolve, reject) => {
            // Если Telegram WebApp уже доступен
            if (window.Telegram?.WebApp) {
                try {
                    window.Telegram.WebApp.ready();
                    window.Telegram.WebApp.expand();
                    resolve();
                } catch (error) {
                    console.warn('Ошибка инициализации Telegram WebApp:', error);
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
                        console.warn('Telegram WebApp не загрузился корректно');
                        resolve(); // Не блокируем выполнение
                    }
                } catch (error) {
                    console.warn('Ошибка при инициализации Telegram WebApp:', error);
                    resolve(); // Не блокируем выполнение
                }
            };
            script.onerror = () => {
                console.warn('Ошибка загрузки скрипта Telegram WebApp');
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
            console.warn('Ошибка получения initData:', error);
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
            
            // Проверяем тип ошибки
            if (error.response?.status === 404) {
                throw new Error('Backend недоступен или неправильно настроен');
            } else if (error.response?.status === 401) {
                throw new Error('Ошибка валидации данных Telegram');
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                throw new Error('Нет соединения с сервером');
            }
            
            throw new Error(
                error.response?.data?.message || 
                'Ошибка авторизации через Telegram'
            );
        }
    }

    private async createTestUser() {
        console.log('Создание тестового пользователя...');
        
        // Создаем тестового пользователя для разработки
        const testUser: User = {
            id: 1,
            telegramId: '631855340', // Используем реальный ID из логов
            username: 'k0rzet',
            firstName: 'Илья',
            lastName: 'Буторин',
            isAdmin: true
        };
        
        runInAction(() => {
            this.user = testUser;
            localStorage.setItem('token', 'test-token');
            this.error = null;
        });
        
        console.log('Тестовый пользователь создан:', testUser);
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
        try {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.close();
            }
        } catch (error) {
            console.warn('Ошибка при закрытии Telegram WebApp:', error);
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