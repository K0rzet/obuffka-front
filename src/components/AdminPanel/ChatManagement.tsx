import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { chatStore } from '../../store/ChatStore';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import styles from './ChatManagement.module.scss';

const ChatManagement: React.FC = observer(() => {
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

    useEffect(() => {
        chatStore.fetchChats();
        chatStore.fetchStats();

        // Автообновление каждые 5 секунд
        const interval = setInterval(() => {
            chatStore.fetchChats();
            chatStore.fetchStats();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const selectedChat = selectedChatId 
        ? chatStore.chats.find(chat => chat.id === selectedChatId)
        : null;

    return (
        <div className={styles.chatManagement}>
            <div className={styles.sidebar}>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{chatStore.stats.total}</span>
                        <span className={styles.statLabel}>Всего чатов</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{chatStore.stats.active}</span>
                        <span className={styles.statLabel}>Активные</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{chatStore.stats.pending}</span>
                        <span className={styles.statLabel}>Ожидают</span>
                    </div>
                </div>
                
                <ChatList 
                    chats={chatStore.chats}
                    selectedChatId={selectedChatId}
                    onChatSelect={setSelectedChatId}
                />
            </div>
            
            <div className={styles.mainContent}>
                {selectedChat ? (
                    <ChatWindow 
                        chat={selectedChat}
                        onClose={() => setSelectedChatId(null)}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <h3>Выберите чат для начала общения</h3>
                        <p>Выберите чат из списка слева, чтобы начать переписку с клиентом</p>
                    </div>
                )}
            </div>
        </div>
    );
});

export default ChatManagement; 