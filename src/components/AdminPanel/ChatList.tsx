import React from 'react';
import { Chat, ChatType, ChatStatus } from '../../types/chat';
import styles from './ChatList.module.scss';

interface ChatListProps {
    chats: Chat[];
    selectedChatId: number | null;
    onChatSelect: (chatId: number) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onChatSelect }) => {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            return date.toLocaleDateString('ru-RU', { 
                day: '2-digit', 
                month: '2-digit' 
            });
        }
    };

    const getStatusColor = (status: ChatStatus) => {
        switch (status) {
            case ChatStatus.ACTIVE:
                return '#2ed573';
            case ChatStatus.PENDING:
                return '#ffa502';
            case ChatStatus.CLOSED:
                return '#747d8c';
            default:
                return '#747d8c';
        }
    };

    const getTypeIcon = (type: ChatType) => {
        return type === ChatType.ORDER ? '🛍️' : '❓';
    };

    const getUserName = (chat: Chat) => {
        const user = chat.user;
        if (user.firstName || user.lastName) {
            return `${user.firstName || ''} ${user.lastName || ''}`.trim();
        }
        return user.username || `User ${user.telegramId}`;
    };

    return (
        <div className={styles.chatList}>
            <div className={styles.header}>
                <h3>Чаты</h3>
            </div>
            
            <div className={styles.list}>
                {chats.map(chat => {
                    const lastMessage = chat.messages[0];
                    const isSelected = chat.id === selectedChatId;
                    
                    return (
                        <div
                            key={chat.id}
                            className={`${styles.chatItem} ${isSelected ? styles.selected : ''}`}
                            onClick={() => onChatSelect(chat.id)}
                        >
                            <div className={styles.chatHeader}>
                                <div className={styles.userInfo}>
                                    <span className={styles.typeIcon}>
                                        {getTypeIcon(chat.type)}
                                    </span>
                                    <span className={styles.userName}>
                                        {getUserName(chat)}
                                    </span>
                                </div>
                                <div className={styles.chatMeta}>
                                    <span 
                                        className={styles.status}
                                        style={{ color: getStatusColor(chat.status) }}
                                    >
                                        ●
                                    </span>
                                    <span className={styles.time}>
                                        {formatTime(chat.updatedAt)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className={styles.lastMessage}>
                                {lastMessage ? (
                                    <>
                                        <span className={styles.messageAuthor}>
                                            {lastMessage.isAdmin ? 'Вы: ' : ''}
                                        </span>
                                        <span className={styles.messageText}>
                                            {lastMessage.text || 
                                             (lastMessage.mediaUrl ? '📎 Медиафайл' : 'Сообщение')}
                                        </span>
                                    </>
                                ) : (
                                    <span className={styles.noMessages}>Нет сообщений</span>
                                )}
                            </div>
                            
                            {chat.assignedAdmin && (
                                <div className={styles.assignedTo}>
                                    Назначен: {chat.assignedAdmin.firstName || chat.assignedAdmin.username}
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {chats.length === 0 && (
                    <div className={styles.empty}>
                        <p>Нет активных чатов</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList; 