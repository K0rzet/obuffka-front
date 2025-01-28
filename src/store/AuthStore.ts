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
    }

    async initAuth() {
        this.isLoading = true;
        this.error = null;
        
        try {
            // Проверяем, запущено ли приложение в Telegram WebApp
            if (!window.Telegram?.WebApp) {
                throw new Error('Приложение должно быть запущено в Telegram');
            }

            const launchParams = retrieveLaunchParams();
            console.log('Launch params:', launchParams); // для отладки
            
            if (!launchParams.initDataRaw) {
                throw new Error('Отсутствуют данные инициализации Telegram');
            }

            const response = await axiosInstance.post<LoginResponse>('/auth/login', {
                initData: launchParams.initDataRaw
            });

            runInAction(() => {
                this.user = response.data.user;
                localStorage.setItem('token', response.data.token);
            });
        } catch (error) {
            runInAction(() => {
                this.error = 'Ошибка авторизации';
                console.error(error);
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