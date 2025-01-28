import { makeAutoObservable, runInAction } from 'mobx';
import axiosInstance from '../api/axiosInstance';
import { User, LoginResponse } from '../types/user';
import { retrieveLaunchParams } from '@telegram-apps/sdk';

class AuthStore {
    user: User | null = null;
    isLoading: boolean = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
        // Проверяем токен при инициализации
        const token = localStorage.getItem('token');
        if (token) {
            this.fetchCurrentUser();
        }
    }

    async initAuth() {
        this.isLoading = true;
        this.error = null;
        
        try {
            await new Promise<void>((resolve) => {
                if (window.Telegram?.WebApp) {
                    console.log('Telegram WebApp уже инициализирован');
                    resolve();
                } else {
                    console.log('Загружаем Telegram WebApp скрипт');
                    const script = document.createElement('script');
                    script.src = 'https://telegram.org/js/telegram-web-app.js';
                    script.onload = () => {
                        console.log('Telegram WebApp скрипт загружен');
                        resolve();
                    };
                    document.head.appendChild(script);
                }
            });

            const launchParams = retrieveLaunchParams();
            const initData = launchParams.initDataRaw || window.Telegram?.WebApp?.initData;
            
            console.log('Launch Params:', launchParams);
            console.log('Init Data:', initData);
            
            if (!initData) {
                throw new Error('Отсутствуют данные инициализации Telegram');
            }

            const response = await axiosInstance.post<LoginResponse>('/auth/login', {
                initData
            });
            
            console.log('Ответ сервера:', response.data);
            
            runInAction(() => {
                this.user = response.data.user;
                localStorage.setItem('token', response.data.token);
            });
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            runInAction(() => {
                this.error = 'Ошибка авторизации';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async fetchCurrentUser() {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await axiosInstance.get<User>('/auth/me');
            runInAction(() => {
                this.user = response.data;
            });
        } catch (error) {
            runInAction(() => {
                this.error = 'Ошибка получения данных пользователя';
                console.error(error);
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    logout() {
        this.user = null;
        localStorage.removeItem('token');
    }
}

export const authStore = new AuthStore(); 