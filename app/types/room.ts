export interface RoomType {
  id: string;
  created_at: string;
  nicknames: NicknameType[];
  users: UserType[];
  chats: ChatType[];
  concept: string;
  questions: string[];
  currentQuestion: number;
  status: "pending" | "chat" | "poll" | "pollend";
  result: {
    userId: string;
    nickname: NicknameType;
    score: number;
    friends: {
      name: string;
      realName: string;
      nickname: NicknameType;
      correct: boolean;
    }[];
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
