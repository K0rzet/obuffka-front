export interface User {
    id: number;
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    isAdmin: boolean;
}

export interface LoginResponse {
    user: User;
    token: string;
} 