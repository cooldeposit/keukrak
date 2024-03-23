export interface RoomType {
  id: string;
  created_at: string;
  users: UserType[];
  chats: ChatType[];
  concept: string;
  questions: string[];
  currentQuestion: number;
  pollOngoing?: boolean;
  hasEnded?: boolean;
  result: {
    userId: string;
    nickname: NicknameType;
    score: number;
    result: {
      guessAI: boolean;
      aiNickname: boolean;
      friends: {
        name: string;
        nickname: string;
        correct: boolean;
      }[];
    };
  }[];
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
  nickname: NicknameType;
}

export interface NicknameType {
  icon: string;
  name: string;
  color: string;
}
