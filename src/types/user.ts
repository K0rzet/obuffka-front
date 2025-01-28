export interface User {
    id: number;
    telegramId: number;
    username: string;
    isAdmin: boolean;
}

export interface LoginResponse {
    user: User;
    token: string;
} 