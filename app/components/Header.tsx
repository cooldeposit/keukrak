interface HeaderProps {
  text: string;
}

export function Header({ text }: HeaderProps) {
  return (
    <header className="fixed top-0 z-50 mx-auto flex w-full max-w-lg items-end gap-2 bg-white/40 p-4 font-bold backdrop-blur-lg">
      {text}
    </header>
  );
}
