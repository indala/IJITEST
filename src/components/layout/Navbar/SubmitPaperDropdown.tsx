'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FilePlus, RefreshCw, Award } from 'lucide-react';

interface SubmitPaperDropdownProps {
    className?: string;
}

export default function SubmitPaperDropdown({ className }: SubmitPaperDropdownProps) {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={`nav-btn-action flex items-center gap-1.5 cursor-pointer select-none ${className || ''}`}
                    aria-label="Paper Submission Menu"
                >
                    <span className="relative z-20 hidden sm:inline">Submit Manuscript</span>
                    <span className="relative z-20 sm:hidden">Submit</span>
                    <ChevronDown className={`w-3.5 h-3.5 relative z-20 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-52 p-1.5 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl z-50 animate-in fade-in-80 zoom-in-95 duration-150"
            >
                <DropdownMenuItem asChild className="p-0 rounded-lg focus:bg-primary/10 cursor-pointer">
                    <Link
                        href="/submit?type=new"
                        className="flex items-center gap-2.5 px-3 py-2 w-full no-underline group"
                        onClick={() => setOpen(false)}
                    >
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                            <FilePlus className="size-3.5 hover:text-white" />
                        </div>
                        <span className="text-label text-foreground group-hover:text-primary transition-colors">New Manuscript</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="p-0 rounded-lg focus:bg-primary/10 cursor-pointer">
                    <Link
                        href="/submit?type=revised"
                        className="flex items-center gap-2.5 px-3 py-2 w-full no-underline group"
                        onClick={() => setOpen(false)}
                    >
                        <div className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
                            <RefreshCw className="w-3.5 h-3.5 hover:text-white" />
                        </div>
                        <span className="text-label text-foreground group-hover:text-secondary transition-colors">Revised Manuscript</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="p-0 rounded-lg focus:bg-primary/10 cursor-pointer">
                    <Link
                        href="/submit?type=final"
                        className="flex items-center gap-2.5 px-3 py-2 w-full no-underline group"
                        onClick={() => setOpen(false)}
                    >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Award className="w-3.5 h-3.5 hover:text-white" />
                        </div>
                        <span className="text-label text-foreground group-hover:text-emerald-700 transition-colors">Final Manuscript</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
