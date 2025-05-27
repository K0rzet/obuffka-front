/// <reference types="vite/client" />

interface Window {
    Telegram?: {
        WebApp?: {
            initData: string;
            initDataUnsafe: any;
            ready: () => void;
            expand: () => void;
            close: () => void;
            MainButton: any;
            BackButton: any;
            colorScheme: 'light' | 'dark';
            themeParams: any;
            isExpanded: boolean;
            viewportHeight: number;
            viewportStableHeight: number;
        };
    }
}
