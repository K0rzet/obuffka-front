import { makeAutoObservable } from 'mobx';
import { Chat, Message, ChatStats, ChatStatus } from '../types/chat';
import { api } from '../api/api';

class ChatStore {
    chats: Chat[] = [];
    stats: ChatStats = { total: 0, active: 0, pending: 0, closed: 0 };
    isLoading = false;
    error: string | null = null;
    currentChatMessages: Message[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    async fetchChats() {
        try {
            this.isLoading = true;
            this.error = null;
            const response = await api.get('/chat');
            this.chats = response.data;
        } catch (error: any) {
            this.error = error.response?.data?.message || 'Ошибка загрузки чатов';
        } finally {
            this.isLoading = false;
        }
    }

    async fetchStats() {
        try {
            const response = await api.get('/chat/stats');
            this.stats = response.data;
        } catch (error: any) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }

    async fetchChatMessages(chatId: number) {
        try {
            this.isLoading = true;
            const response = await api.get(`/chat/${chatId}`);
            this.currentChatMessages = response.data.messages || [];
            return response.data;
        } catch (error: any) {
            this.error = error.response?.data?.message || 'Ошибка загрузки сообщений';
        } finally {
            this.isLoading = false;
        }
    }

    async sendMessage(chatId: number, text: string, userId: number) {
        try {
            const response = await api.post(`/chat/${chatId}/messages`, {
                text,
                userId: userId.toString()
            });
            
            // Добавляем сообщение в локальный стор
            this.currentChatMessages.push(response.data);
            
            return response.data;
        } catch (error: any) {
            this.error = error.response?.data?.message || 'Ошибка отправки сообщения';
            throw error;
        }
    }

    async assignChat(chatId: number, adminId: number) {
        try {
            await api.put(`/chat/${chatId}/assign`, { adminId });
        } catch (error: any) {
            this.error = error.response?.data?.message || 'Ошибка назначения чата';
        }
    }

    async updateChatStatus(chatId: number, status: ChatStatus) {
        try {
            await api.put(`/chat/${chatId}/status`, { status });
        } catch (error: any) {
            this.error = error.response?.data?.message || 'Ошибка обновления статуса';
        }
    }

    clearError() {
        this.error = null;
    }
}

export const chatStore = new ChatStore(); 