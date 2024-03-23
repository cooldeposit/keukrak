export interface RoomType {
  id: string;
  created_at: string;
  users: UserType[];
  chats: ChatType[];
  concept: string;
  questions: string[];
  currentQuestion: number;
}

export interface UserType {
  id: string;
  isOnline: boolean;
  username: string;
  isAdmin: boolean;
}

export interface ChatType {
  message: string;
  created_at: Date;
  userId: string;
}
