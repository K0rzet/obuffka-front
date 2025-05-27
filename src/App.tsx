import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { RiHome2Line, RiSettings4Line, RiBugLine } from 'react-icons/ri';
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
        
        {/* Отладочная информация */}
        {import.meta.env.DEV && authStore.debugInfo.length > 0 && (
            <details className={styles.debugInfo}>
                <summary>Отладочная информация</summary>
                <div className={styles.debugLog}>
                    {authStore.debugInfo.map((info, index) => (
                        <div key={index} className={styles.debugLine}>
                            {info}
                        </div>
                    ))}
                </div>
            </details>
        )}
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
                    {authStore.isAdmin && (
                        <Link to="/admin" title="Админ панель">
                            <RiSettings4Line size={24} />
                        </Link>
                    )}
                    {import.meta.env.DEV && (
                        <button 
                            onClick={() => authStore.forceTestMode()} 
                            title="Тестовый режим"
                            className={styles.debugButton}
                        >
                            <RiBugLine size={24} />
                        </button>
                    )}
                </nav>
                
                <main className={styles.main}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </main>

                {/* Показываем информацию о пользователе в режиме разработки */}
                {import.meta.env.DEV && authStore.user && (
                    <div className={styles.devInfo}>
                        <small>
                            Пользователь: {authStore.user.firstName} {authStore.user.lastName} 
                            {authStore.isAdmin && ' (Админ)'}
                            {authStore.isTestMode && ' [Тестовый режим]'}
                        </small>
                        
                        {/* Кнопка для просмотра отладочной информации */}
                        {authStore.debugInfo.length > 0 && (
                            <details className={styles.devDebug}>
                                <summary>Debug Log ({authStore.debugInfo.length})</summary>
                                <div className={styles.debugLog}>
                                    {authStore.debugInfo.slice(-10).map((info, index) => (
                                        <div key={index} className={styles.debugLine}>
                                            {info}
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>
                )}
            </div>
        </BrowserRouter>
    );
});

export default App;
