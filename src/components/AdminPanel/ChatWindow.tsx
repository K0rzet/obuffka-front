import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Chat, Message, MessageType, ChatStatus } from '../../types/chat';
import { chatStore } from '../../store/ChatStore';
import styles from './ChatWindow.module.scss';

interface ChatWindowProps {
    chat: Chat;
    onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = observer(({ chat, onClose }) => {
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatStore.joinChat(chat.id);
        loadChatMessages();

        return () => {
            chatStore.leaveChat(chat.id);
        };
    }, [chat.id]);

    useEffect(() => {
        setMessages(chatStore.currentChatMessages);
        scrollToBottom();
    }, [chatStore.currentChatMessages]);

    const loadChatMessages = async () => {
        const chatData = await chatStore.fetchChatMessages(chat.id);
        if (chatData?.messages) {
            setMessages(chatData.messages);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (messageText.trim()) {
            chatStore.sendMessage(chat.id, messageText.trim());
            setMessageText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getUserName = () => {
        const user = chat.user;
        if (user.firstName || user.lastName) {
            return `${user.firstName || ''} ${user.lastName || ''}`.trim();
        }
        return user.username || `User ${user.telegramId}`;
    };

    const getStatusText = (status: ChatStatus) => {
        switch (status) {
            case ChatStatus.ACTIVE:
                return 'Активный';
            case ChatStatus.PENDING:
                return 'Ожидает';
            case ChatStatus.CLOSED:
                return 'Закрыт';
            default:
                return status;
        }
    };

    const renderMessage = (message: Message) => {
        const isAdmin = message.isAdmin;
        
        return (
            <div
                key={message.id}
                className={`${styles.message} ${isAdmin ? styles.admin : styles.user}`}
            >
                <div className={styles.messageContent}>
                    {message.messageType === MessageType.TEXT && message.text && (
                        <div className={styles.messageText}>{message.text}</div>
                    )}
                    
                    {message.messageType === MessageType.PHOTO && message.mediaUrl && (
                        <div className={styles.mediaMessage}>
                            <img src={message.mediaUrl} alt="Фото" className={styles.messageImage} />
                            {message.text && <div className={styles.messageText}>{message.text}</div>}
                        </div>
                    )}
                    
                    {message.messageType === MessageType.DOCUMENT && message.mediaUrl && (
                        <div className={styles.mediaMessage}>
                            <div className={styles.documentMessage}>
                                <span className={styles.documentIcon}>📄</span>
                                <div className={styles.documentInfo}>
                                    <div className={styles.fileName}>{message.fileName}</div>
                                    {message.fileSize && (
                                        <div className={styles.fileSize}>
                                            {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    )}
                                </div>
                                <a 
                                    href={message.mediaUrl} 
                                    download={message.fileName}
                                    className={styles.downloadButton}
                                >
                                    ⬇️
                                </a>
                            </div>
                            {message.text && <div className={styles.messageText}>{message.text}</div>}
                        </div>
                    )}
                    
                    {message.messageType === MessageType.VOICE && message.mediaUrl && (
                        <div className={styles.mediaMessage}>
                            <audio controls className={styles.audioMessage}>
                                <source src={message.mediaUrl} type={message.mediaType} />
                                Ваш браузер не поддерживает аудио.
                            </audio>
                            {message.text && <div className={styles.messageText}>{message.text}</div>}
                        </div>
                    )}
                    
                    {message.messageType === MessageType.VIDEO && message.mediaUrl && (
                        <div className={styles.mediaMessage}>
                            <video controls className={styles.videoMessage}>
                                <source src={message.mediaUrl} type={message.mediaType} />
                                Ваш браузер не поддерживает видео.
                            </video>
                            {message.text && <div className={styles.messageText}>{message.text}</div>}
                        </div>
                    )}
                </div>
                
                <div className={styles.messageTime}>
                    {formatTime(message.createdAt)}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.chatWindow}>
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <h3>{getUserName()}</h3>
                    <div className={styles.chatMeta}>
                        <span className={styles.status}>
                            {getStatusText(chat.status)}
                        </span>
                        <span className={styles.type}>
                            {chat.type === 'ORDER' ? 'Заказ' : 'Вопрос'}
                        </span>
                    </div>
                </div>
                
                <div className={styles.actions}>
                    <button
                        onClick={() => chatStore.updateChatStatus(chat.id, ChatStatus.CLOSED)}
                        className={styles.closeButton}
                    >
                        Закрыть чат
                    </button>
                    <button onClick={onClose} className={styles.backButton}>
                        ✕
                    </button>
                </div>
            </div>
            
            <div className={styles.messagesContainer}>
                <div className={styles.messages}>
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            
            <div className={styles.inputContainer}>
                <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    className={styles.messageInput}
                    rows={3}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className={styles.sendButton}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
});

export default ChatWindow; 