import { Header } from "@/app/components/Header";
import { RoomType } from "../types/room";
import { redirect } from "next/navigation";
import { getAdmin } from "../lib/getAdmin";
import Main from "../components/Main";

const fetchRoom = async (id: string) => {
  try {
    const res: RoomType = await (
      await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/room/${id}`, {
        cache: "no-cache",
      })
    ).json();

    return res;
  } catch (e) {
    console.log(e);
    redirect("/");
  }
};

export default async function RoomPage({ params }: { params: { id: string } }) {
  const room = await fetchRoom(params.id);
  const admin = getAdmin(room);

  return (
    <div className="flex h-full flex-col">
      <Header text={`${admin!.username}님이 연 극락 퀴즈쇼`} />
      <Main room={room} />
    </div>
  );
}
