import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { RiHome2Line, RiSettings4Line, RiMessage3Line } from 'react-icons/ri';
import HomePage from './pages/HomePage/HomePage';
import AdminPage from './pages/AdminPage/AdminPage';
import { authStore } from './store/AuthStore';
import styles from './App.module.scss';

const LoadingScreen: React.FC = () => (
    <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
        <p>Инициализация приложения...</p>
    </div>
);

const ErrorScreen: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
    <div className={styles.errorScreen}>
        <h2>Ошибка авторизации</h2>
        <p>{error}</p>
        <div className={styles.errorButtons}>
            <button onClick={onRetry} className={styles.retryButton}>
                Попробовать снова
            </button>
            <button 
                onClick={() => authStore.forceTestMode()} 
                className={styles.testModeButton}
            >
                Тестовый режим
            </button>
        </div>
    </div>
);

const App: React.FC = observer(() => {
    useEffect(() => {
        authStore.initAuth();
    }, []);

    // Показываем экран загрузки во время инициализации
    if (authStore.isLoading && !authStore.isInitialized) {
        return <LoadingScreen />;
    }

    // Показываем экран ошибки, если авторизация не удалась
    if (authStore.error && !authStore.user) {
        return (
            <ErrorScreen 
                error={authStore.error} 
                onRetry={() => {
                    authStore.clearError();
                    authStore.initAuth();
                }} 
            />
        );
    }

    return (
        <BrowserRouter>
            <div className={styles.app}>
                <nav className={styles.nav}>
                    <Link to="/" title="Главная">
                        <RiHome2Line size={24} />
                    </Link>
                    {/* Показываем админ навигацию только для админов */}
                    {authStore.isAdmin && (
                        <>
                            <Link to="/admin" title="Админ панель">
                                <RiSettings4Line size={24} />
                            </Link>
                            <Link to="/admin/chats" title="Чаты">
                                <RiMessage3Line size={24} />
                            </Link>
                        </>
                    )}
                </nav>
                
                <main className={styles.main}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/admin/chats" element={<AdminPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
});

export default App;
