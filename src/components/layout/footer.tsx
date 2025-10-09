// src/components/layout/footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { CONTRACT_ADDRESS_BASE_SEPOLIA, CONTRACT_ADDRESS_BASE_MAINNET, CONTRACT_ADDRESS_U2U_MAINNET, CONTRACT_ADDRESS_U2U_TESTNET } from "@/lib/contracts";
import {
    Github,
    Twitter,
    MessageCircle,
    Youtube,
    Book,
    FileText,
    ExternalLink,
} from "lucide-react";

export function Footer() {
    const { theme } = useTheme();

    return (
        <footer className="border-t bg-card/50 mt-24 rounded-4xl">
            <div className="container mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Logo and description */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/opera-logogram.svg"
                                alt="Opera"
                                width={120}
                                height={48}
                                className={theme === "light" ? "invert" : ""}
                            />
                        </Link>
                        <p className="text-muted-foreground text-sm">
                            Open Payroll Raising Automatically - A decentralized payroll system
                            built on blockchain for transparency and reliability.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/employee" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                    Employee Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/employer" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                    Employer Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                    Register as Employer
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contract Addresses */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Contract Addresses</h3>
                        <ul className="space-y-2">
                            <li className="text-sm">
                                <p className="text-muted-foreground mb-1">Base Sepolia</p>
                                <div className="flex items-center">
                                    <code className="text-xs font-mono bg-muted rounded p-1 truncate max-w-44">
                                        {CONTRACT_ADDRESS_BASE_SEPOLIA}
                                    </code>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 ml-1"
                                        asChild
                                    >
                                        <a
                                            href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS_BASE_SEPOLIA}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View on Base Sepolia Explorer"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </Button>
                                </div>
                            </li>
                            <li className="text-sm">
                                <p className="text-muted-foreground mb-1">Base Mainnet</p>
                                <div className="flex items-center">
                                    <code className="text-xs font-mono bg-muted rounded p-1 truncate max-w-44">
                                        {CONTRACT_ADDRESS_BASE_MAINNET}
                                    </code>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 ml-1"
                                        asChild
                                    >
                                        <a
                                            href={`https://basescan.org/address/${CONTRACT_ADDRESS_BASE_MAINNET}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View on Base Explorer"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </Button>
                                </div>
                            </li>
                            <li className="text-sm">
                                <p className="text-muted-foreground mb-1">U2U Testnet</p>
                                <div className="flex items-center">
                                    <code className="text-xs font-mono bg-muted rounded p-1 truncate max-w-44">
                                        {CONTRACT_ADDRESS_U2U_TESTNET}
                                    </code>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 ml-1"
                                        asChild
                                    >
                                        <a
                                            href={`https://testnet.u2uscan.xyz/address/${CONTRACT_ADDRESS_U2U_TESTNET}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View on U2U Explorer"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </Button>
                                </div>
                            </li>
                            <li className="text-sm">
                                <p className="text-muted-foreground mb-1">U2U Mainnet</p>
                                <div className="flex items-center">
                                    <code className="text-xs font-mono bg-muted rounded p-1 truncate max-w-44">
                                        {CONTRACT_ADDRESS_U2U_MAINNET}
                                    </code>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 ml-1"
                                        asChild
                                    >
                                        <a
                                            href={`https://u2uscan.xyz/address/${CONTRACT_ADDRESS_U2U_MAINNET}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View on U2U Explorer"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </Button>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Social and Docs */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">Connect with us</h3>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full"
                                asChild
                            >
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Twitter/X"
                                >
                                    <Twitter className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full"
                                asChild
                            >
                                <a
                                    href="https://t.me/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Telegram"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full"
                                asChild
                            >
                                <a
                                    href="https://github.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="GitHub"
                                >
                                    <Github className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full"
                                asChild
                            >
                                <a
                                    href="https://youtube.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="YouTube"
                                >
                                    <Youtube className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full"
                                asChild
                            >
                                <a
                                    href="https://medium.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Medium"
                                >
                                    <FileText className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                        <div className="pt-2">
                            <Button variant="outline" asChild className="w-full">
                                <a
                                    href="https://opera-io.vercel.app/docs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2"
                                >
                                    <Book className="h-4 w-4" />
                                    Documentation
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Opera - Open Payroll Raising Automatically. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
