import { NicknameType } from "./room";

export interface ChatPayloadType {
  nickname: NicknameType;
  content: string;
}

export interface UserPayloadType {
  userId: string;
  username: string;
}

export interface MessageType {
  type: "message" | "enter" | "leave" | "admin" | "start" | "poll";
  id: string;
  payload: ChatPayloadType | UserPayloadType | null;
}
