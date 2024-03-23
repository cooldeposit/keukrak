export interface ChatType {
  user: string;
  content: string;
}

export interface UserPayloadType {
  userId: string;
  username: string;
}

export interface MessageType {
  type: "message" | "enter" | "leave";
  payload: ChatType | UserPayloadType;
}
