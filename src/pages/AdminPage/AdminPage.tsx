import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductManagement from '../../components/AdminPanel/ProductManagement';
import ChatManagement from '../../components/AdminPanel/ChatManagement';
import styles from './AdminPage.module.scss';

const AdminPage: React.FC = observer(() => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Определяем активную вкладку на основе URL
    const getActiveTabFromPath = () => {
        if (location.pathname.includes('/chats')) {
            return 'chats';
        }
        return 'products';
    };
    
    const [activeTab, setActiveTab] = useState<'products' | 'chats'>(getActiveTabFromPath());

    // Обновляем вкладку при изменении URL
    useEffect(() => {
        setActiveTab(getActiveTabFromPath());
    }, [location.pathname]);

    const handleTabChange = (tab: 'products' | 'chats') => {
        setActiveTab(tab);
        if (tab === 'chats') {
            navigate('/admin/chats');
        } else {
            navigate('/admin');
        }
    };

    return (
        <div className={styles.adminPage}>
            <div className={styles.header}>
                <h1>Панель администратора</h1>
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
                        onClick={() => handleTabChange('products')}
                    >
                        Товары
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'chats' ? styles.active : ''}`}
                        onClick={() => handleTabChange('chats')}
                    >
                        Чаты
                    </button>
                </div>
            </div>
            
            <div className={styles.content}>
                {activeTab === 'products' && <ProductManagement />}
                {activeTab === 'chats' && <ChatManagement />}
            </div>
        </div>
    );
});

export default AdminPage; 