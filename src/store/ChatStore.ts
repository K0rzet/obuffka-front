import { makeAutoObservable } from 'mobx';
import { io, Socket } from 'socket.io-client';
import { Chat, Message, ChatStats, ChatStatus } from '../types/chat';
import { api } from '../api/api';

class ChatStore {
    chats: Chat[] = [];
    stats: ChatStats = { total: 0, active: 0, pending: 0, closed: 0 };
    isLoading = false;
    error: string | null = null;
    socket: Socket | null = null;
    currentChatMessages: Message[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(`${import.meta.env.VITE_API_URL}/chat`, {
            auth: {
                token: localStorage.getItem('token'),
            },
        });

        this.socket.on('connect', () => {
            console.log('Connected to chat server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from chat server');
        });

        this.socket.on('chatList', (chats: Chat[]) => {
            this.chats = chats;
        });

        this.socket.on('chatStats', (stats: ChatStats) => {
            this.stats = stats;
        });

        this.socket.on('newMessage', (message: Message) => {
            this.addMessage(message);
        });

        this.socket.on('chatAssigned', (chat: Chat) => {
            this.updateChat(chat);
        });

        this.socket.on('chatStatusUpdated', (chat: Chat) => {
            this.updateChat(chat);
        });

        this.socket.on('newChat', (chat: Chat) => {
            this.chats.unshift(chat);
        });

        this.socket.on('error', (error: { message: string }) => {
            this.error = error.message;
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
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

    joinChat(chatId: number) {
        if (this.socket) {
            this.socket.emit('joinChat', { chatId });
        }
    }

    leaveChat(chatId: number) {
        if (this.socket) {
            this.socket.emit('leaveChat', { chatId });
        }
    }

    sendMessage(chatId: number, text: string) {
        if (this.socket) {
            this.socket.emit('sendMessage', {
                chatId,
                text,
                isAdmin: true,
            });
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

    private addMessage(message: Message) {
        // Добавляем сообщение в текущий чат, если он открыт
        if (this.currentChatMessages.length > 0 && 
            this.currentChatMessages[0]?.chatId === message.chatId) {
            this.currentChatMessages.push(message);
        }

        // Обновляем последнее сообщение в списке чатов
        const chatIndex = this.chats.findIndex(chat => chat.id === message.chatId);
        if (chatIndex !== -1) {
            this.chats[chatIndex].messages = [message];
            this.chats[chatIndex].updatedAt = message.createdAt;
            
            // Перемещаем чат в начало списка
            const chat = this.chats.splice(chatIndex, 1)[0];
            this.chats.unshift(chat);
        }
    }

    private updateChat(updatedChat: Chat) {
        const index = this.chats.findIndex(chat => chat.id === updatedChat.id);
        if (index !== -1) {
            this.chats[index] = updatedChat;
        }
    }

    clearError() {
        this.error = null;
    }
}

export const chatStore = new ChatStore(); 