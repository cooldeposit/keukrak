import { Chat } from "@/app/components/Chat";
import { Header } from "@/app/components/Header";
import { Pending } from "@/app/components/Pending";

export default function RoomPage() {
  const USERS = ["찬휘", "희찬"];
  // const USERS = ["찬휘"];

  const ME = "찬휘";
  const ADMIN_NAME = "희찬";

  // @ts-expect-error ㅁㄴㅇㄹ
  const isAdmin = ME === ADMIN_NAME;

  const HAS_STARTED = false;

  return (
    <div className="flex h-full flex-col">
      <Header
        text={`${isAdmin ? "내가" : `${ADMIN_NAME}님이`} 연 극락 퀴즈쇼`}
      />
      {/* @ts-expect-error ㅁㄴㅇㄹ */}
      {HAS_STARTED === true && <Chat />}
      {HAS_STARTED === false && (
        <Pending adminName={ADMIN_NAME} me={ME} users={USERS} />
      )}
    </div>
  );
}
