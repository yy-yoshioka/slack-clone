export interface User {
  id: string;
  name: string;
  avatar?: string;
  // Add other user properties
}

export interface Attachment {
  id: string;
  url: string;
  type: string;
  name: string;
  size?: number;
  // Add other attachment properties
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  // Add other reaction properties
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  channelId: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  user?: User;
  attachments?: Attachment[];
  reactions?: Reaction[];
  threadId?: string;
  parentId?: string;
  // Add other message properties
}

export interface SearchResult {
  id: string;
  type: "message" | "channel" | "user" | "file";
  title: string;
  description?: string;
  url?: string;
  // Add other search result properties
}
