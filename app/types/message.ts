import { NicknameType, RoomType } from "./room";

export interface ChatPayloadType {
  nickname: NicknameType;
  content: string;
}

export interface UserPayloadType {
  userId: string;
  username: string;
}

export interface QuestionPayloadType {
  currentQuestion: number;
  question: string;
}

export interface MessageType {
  type:
    | "message"
    | "enter"
    | "leave"
    | "admin"
    | "start"
    | "poll"
    | "pollend"
    | "question";
  id: string;
  payload:
    | ChatPayloadType
    | UserPayloadType
    | null
    | RoomType["result"]
    | QuestionPayloadType;
}
