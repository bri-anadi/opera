// src/components/layout/navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import ConnectButton from "@/components/connect-button";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-24 items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/opera-logogram.svg"
                            alt="Opera"
                            width={96}
                            height={48}
                            className="invert dark:invert-0"
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
