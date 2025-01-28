import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import HomePage from './pages/HomePage/HomePage';
import AdminPage from './pages/AdminPage/AdminPage';
import { authStore } from './store/AuthStore';
import styles from './App.module.scss';

const App: React.FC = observer(() => {
    return (
        <BrowserRouter>
            <div className={styles.app}>
                <nav className={styles.nav}>
                    <Link to="/">Главная</Link>
                    {authStore.user?.isAdmin && (
                        <Link to="/admin">Админ панель</Link>
                    )}
                </nav>
                
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
});

export default App;
