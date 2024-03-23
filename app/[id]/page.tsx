import { Chat } from "@/app/components/Chat";
import { Header } from "@/app/components/Header";
import { Pending } from "@/app/components/Pending";
import { RoomType } from "../types/room";
import { redirect } from "next/navigation";

const fetchRoom = async (id: string) => {
  try {
    const res: RoomType = await (
      await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/room/${id}`)
    ).json();

    return res;
  } catch (e) {
    console.log(e);
    redirect("/");
  }
};

export default async function RoomPage({ params }: { params: { id: string } }) {
  const room = await fetchRoom(params.id);
  const ADMIN_NAME = room.users.filter((user) => user.isAdmin)[0].username;

  return (
    <div className="flex h-full flex-col">
      <Header text={`${ADMIN_NAME}님이 연 극락 퀴즈쇼`} />
      {room.currentQuestion >= 0 && <Chat />}
      {room.currentQuestion === -1 && (
        <Pending
          adminName={ADMIN_NAME}
          me={"나"}
          users={room.users.map((user) => user.username)}
        />
      )}
    </div>
  );
}
