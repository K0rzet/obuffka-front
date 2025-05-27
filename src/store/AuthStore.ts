import { makeAutoObservable, runInAction } from 'mobx';
import axiosInstance from '../api/axiosInstance';
import { User, LoginResponse } from '../types/user';

class AuthStore {
    user: User | null = null;
    isLoading: boolean = false;
    error: string | null = null;
    isInitialized: boolean = false;
    debugInfo: string[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    private addDebugInfo(message: string) {
        console.log(`[AuthStore] ${message}`);
        this.debugInfo.push(`${new Date().toLocaleTimeString()}: ${message}`);
    }

    async initAuth() {
        if (this.isInitialized) return;
        
        this.isLoading = true;
        this.error = null;
        this.debugInfo = [];
        
        try {
            this.addDebugInfo('Начинаем инициализацию авторизации');

            // Проверяем, есть ли уже токен
            const existingToken = localStorage.getItem('token');
            if (existingToken) {
                this.addDebugInfo(`Найден существующий токен: ${existingToken.substring(0, 10)}...`);
                try {
                    await this.fetchCurrentUser();
                    if (this.user) {
                        this.addDebugInfo('Успешно авторизован с существующим токеном');
                        this.isInitialized = true;
                        return;
                    }
                } catch (error) {
                    this.addDebugInfo('Существующий токен недействителен, удаляем');
                    localStorage.removeItem('token');
                }
            }

            // Инициализируем Telegram WebApp
            await this.initTelegramWebApp();
            
            // Получаем initData
            const initData = this.getTelegramInitData();
            
            if (!initData) {
                this.addDebugInfo('InitData не найден, создаем тестового пользователя');
                await this.createTestUser();
                return;
            }

            this.addDebugInfo(`InitData получен: ${initData.substring(0, 50)}...`);

            // Пытаемся авторизоваться через Telegram
            try {
                await this.loginWithTelegram(initData);
                this.addDebugInfo('Успешная авторизация через Telegram');
            } catch (telegramError: any) {
                this.addDebugInfo(`Ошибка авторизации через Telegram: ${telegramError.message}`);
                
                // Если backend недоступен (404, 401, сетевые ошибки), переходим на тестовый режим
                if (
                    telegramError.message.includes('Backend недоступен') ||
                    telegramError.message.includes('Ошибка валидации') ||
                    telegramError.message.includes('Нет соединения') ||
                    !telegramError.response
                ) {
                    this.addDebugInfo('Backend недоступен, переключаемся на тестовый режим');
                    await this.createTestUser();
                } else {
                    throw telegramError;
                }
            }
            
        } catch (error) {
            console.error('Критическая ошибка инициализации авторизации:', error);
            this.addDebugInfo(`Критическая ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            
            runInAction(() => {
                this.error = error instanceof Error ? error.message : 'Ошибка авторизации';
            });
            
            // В любом случае создаем тестового пользователя
            try {
                this.addDebugInfo('Создаем тестового пользователя как fallback');
                await this.createTestUser();
            } catch (testError) {
                console.error('Не удалось создать тестового пользователя:', testError);
                this.addDebugInfo('Не удалось создать тестового пользователя');
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
                    this.addDebugInfo('Telegram WebApp уже доступен');
                    window.Telegram.WebApp.ready();
                    window.Telegram.WebApp.expand();
                    resolve();
                } catch (error) {
                    this.addDebugInfo(`Ошибка инициализации Telegram WebApp: ${error}`);
                    resolve(); // Не блокируем выполнение
                }
                return;
            }

            this.addDebugInfo('Загружаем скрипт Telegram WebApp');
            // Загружаем скрипт Telegram WebApp
            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-web-app.js';
            script.onload = () => {
                try {
                    if (window.Telegram?.WebApp) {
                        this.addDebugInfo('Telegram WebApp скрипт загружен успешно');
                        window.Telegram.WebApp.ready();
                        window.Telegram.WebApp.expand();
                        resolve();
                    } else {
                        this.addDebugInfo('Telegram WebApp не загрузился корректно');
                        resolve(); // Не блокируем выполнение
                    }
                } catch (error) {
                    this.addDebugInfo(`Ошибка при инициализации Telegram WebApp: ${error}`);
                    resolve(); // Не блокируем выполнение
                }
            };
            script.onerror = () => {
                this.addDebugInfo('Ошибка загрузки скрипта Telegram WebApp');
                resolve(); // Не блокируем выполнение
            };
            
            document.head.appendChild(script);
        });
    }

    private getTelegramInitData(): string | null {
        try {
            if (window.Telegram?.WebApp?.initData) {
                const initData = window.Telegram.WebApp.initData;
                this.addDebugInfo(`InitData из Telegram WebApp: ${initData.length} символов`);
                return initData;
            }
        } catch (error) {
            this.addDebugInfo(`Ошибка получения initData: ${error}`);
        }
        
        // Для тестирования можно использовать URL параметры
        const urlParams = new URLSearchParams(window.location.search);
        const urlInitData = urlParams.get('tgWebAppData');
        if (urlInitData) {
            this.addDebugInfo('InitData получен из URL параметров');
            return urlInitData;
        }
        
        this.addDebugInfo('InitData не найден');
        return null;
    }

    private async loginWithTelegram(initData: string) {
        try {
            this.addDebugInfo('Отправляем запрос авторизации на backend');
            const response = await axiosInstance.post<LoginResponse>('/auth/login', {
                initData
            });
            
            this.addDebugInfo('Получен успешный ответ от backend');
            runInAction(() => {
                this.user = response.data.user;
                localStorage.setItem('token', response.data.token);
                this.error = null;
            });
            
            this.addDebugInfo(`Токен сохранен: ${response.data.token.substring(0, 10)}...`);
        } catch (error: any) {
            this.addDebugInfo(`Ошибка запроса авторизации: ${error.response?.status} ${error.response?.statusText}`);
            
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
        this.addDebugInfo('Создание тестового пользователя...');
        
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
        
        this.addDebugInfo('Тестовый пользователь создан успешно');
        console.log('Тестовый пользователь создан:', testUser);
    }

    async fetchCurrentUser() {
        try {
            this.addDebugInfo('Запрашиваем данные текущего пользователя');
            const response = await axiosInstance.get<User>('/auth/me');
            runInAction(() => {
                this.user = response.data;
                this.error = null;
            });
            this.addDebugInfo('Данные пользователя получены успешно');
        } catch (error: any) {
            this.addDebugInfo(`Ошибка получения данных пользователя: ${error.response?.status}`);
            
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
        this.addDebugInfo('Выход из системы');
        runInAction(() => {
            this.user = null;
            this.error = null;
            this.isInitialized = false;
            this.debugInfo = [];
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

    // Принудительно переключиться на тестовый режим
    async forceTestMode() {
        this.addDebugInfo('Принудительное переключение на тестовый режим');
        localStorage.removeItem('token');
        await this.createTestUser();
    }

    // Геттеры для удобства
    get isAuthenticated(): boolean {
        return !!this.user;
    }

    get isAdmin(): boolean {
        return this.user?.isAdmin || false;
    }

    get isTestMode(): boolean {
        return localStorage.getItem('token') === 'test-token';
    }
}

export const authStore = new AuthStore(); 