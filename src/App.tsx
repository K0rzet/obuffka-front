import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from './store/AuthStore';
import LoadingSpinner from './components/LoadingSpinner';
import styles from './App.module.scss';

const App: React.FC = observer(() => {
    useEffect(() => {
        authStore.initAuth();
    }, []);

    if (authStore.isLoading) {
        return <LoadingSpinner />;
    }

    if (authStore.error) {
        return <div className={styles.error}>{authStore.error}</div>;
    }

    if (!authStore.user) {
        return <div className={styles.error}>Пользователь не авторизован</div>;
    }

    return (
        <div className={styles.app}>
            <div>id: {authStore.user.id}</div>
            <div>telegramId: {authStore.user.telegramId}</div>
            <div>username: {authStore.user.username}</div>
        </div>
    );
});

export default App;
