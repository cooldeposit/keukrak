import { RoomType } from "../types/room";

export const getAdmin = (room: RoomType) => {
  return room.users.find((user) => user.isAdmin);
};
