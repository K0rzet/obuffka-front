export interface User {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
}

export interface Message {
  id: number;
  chatId: number;
  userId: number;
  text?: string;
  isAdmin: boolean;
  messageType: MessageType;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  user: User;
}

export interface Chat {
  id: number;
  userId: number;
  type: ChatType;
  status: ChatStatus;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  assignedAdmin?: User;
  messages: Message[];
  _count?: {
    messages: number;
  };
}

export enum MessageType {
  TEXT = 'TEXT',
  PHOTO = 'PHOTO',
  DOCUMENT = 'DOCUMENT',
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  VIDEO_NOTE = 'VIDEO_NOTE',
}

export enum ChatType {
  QUESTION = 'QUESTION',
  ORDER = 'ORDER',
}

export enum ChatStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
}

export interface ChatStats {
  total: number;
  active: number;
  pending: number;
  closed: number;
} 