// src/components/layout/navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import ConnectButton from "@/components/connect-button";
import { useTheme } from "next-themes";

export function Navbar() {
    const { theme } = useTheme();

    return (
        <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-lg">
            <div className="container mx-auto flex h-24 items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/opera-logogram.svg"
                            alt="Opera"
                            width={96}
                            height={48}
                            className={theme === "light" ? "invert" : ""}
                            priority
                        />
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
}
