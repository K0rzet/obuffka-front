import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import ProductManagement from '../../components/AdminPanel/ProductManagement';
import ChatManagement from '../../components/AdminPanel/ChatManagement';
import styles from './AdminPage.module.scss';

const AdminPage: React.FC = observer(() => {
    const [activeTab, setActiveTab] = useState<'products' | 'chats'>('products');

    return (
        <div className={styles.adminPage}>
            <div className={styles.header}>
                <h1>Панель администратора</h1>
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Товары
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'chats' ? styles.active : ''}`}
                        onClick={() => setActiveTab('chats')}
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