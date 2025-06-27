// src/app/page.tsx
import Image from "next/image";
import ConnectButton from "@/components/connect-button";

export default function Home() {
  return (
    <div className="grid grid-rows-1 items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
      <main className="flex flex-col gap-8 items-center sm:items-start">
        <Image
          className="invert"
          src="/opera-logogram.svg"
          alt="Opera logo"
          width={180}
          height={38}
          priority
        />
        <ConnectButton />
      </main>
    </div>
  );
}
