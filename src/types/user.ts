export interface User {
    id: number;
    telegramId: number;
    username: string;
}

export interface LoginResponse {
    user: User;
    token: string;
} 