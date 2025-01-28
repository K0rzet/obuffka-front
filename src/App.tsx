import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { RiHome2Line, RiSettings4Line } from 'react-icons/ri';
import HomePage from './pages/HomePage/HomePage';
import AdminPage from './pages/AdminPage/AdminPage';
import { authStore } from './store/AuthStore';
import styles from './App.module.scss';

const App: React.FC = observer(() => {
    useEffect(() => {
        authStore.initAuth();
    }, []);

    return (
        <BrowserRouter>
            <div className={styles.app}>
                <nav className={styles.nav}>
                    <Link to="/" title="Главная">
                        <RiHome2Line size={24} />
                    </Link>
                    {authStore.user?.isAdmin && (
                        <Link to="/admin" title="Админ панель">
                            <RiSettings4Line size={24} />
                        </Link>
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
