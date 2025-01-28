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
            const { initDataRaw } = retrieveLaunchParams();
            const response = await axiosInstance.post<LoginResponse>('/auth/login', {
                initData: initDataRaw
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