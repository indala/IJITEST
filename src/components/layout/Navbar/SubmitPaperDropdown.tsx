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
                    <span className="relative z-20 hidden sm:inline lg:hidden xl:inline">Paper Submission</span>
                    <span className="relative z-20 sm:hidden lg:inline xl:hidden">Submit</span>
                    <ChevronDown className={`w-3.5 h-3.5 relative z-20 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-64 p-1.5 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl z-50 animate-in fade-in-80 zoom-in-95 duration-150"
            >
                <DropdownMenuItem asChild className="p-0 rounded-lg focus:bg-primary/10 cursor-pointer">
                    <Link
                        href="/submit?type=new"
                        className="flex items-start gap-3 p-2.5 w-full no-underline group"
                        onClick={() => setOpen(false)}
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                            <FilePlus className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-label font-bold text-foreground m-0">New Submission</p>
                            <p className="text-meta text-muted-foreground m-0">Submit fresh manuscript for review</p>
                        </div>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="p-0 rounded-lg focus:bg-primary/10 cursor-pointer">
                    <Link
                        href="/submit?type=revised"
                        className="flex items-start gap-3 p-2.5 w-full no-underline group"
                        onClick={() => setOpen(false)}
                    >
                        <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-label font-bold text-foreground m-0">Revised Submission</p>
                            <p className="text-meta text-muted-foreground m-0">Submit response & revised draft</p>
                        </div>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="p-0 rounded-lg focus:bg-primary/10 cursor-pointer">
                    <Link
                        href="/submit?type=final"
                        className="flex items-start gap-3 p-2.5 w-full no-underline group"
                        onClick={() => setOpen(false)}
                    >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Award className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-label font-bold text-foreground m-0">Final Submission</p>
                            <p className="text-meta text-muted-foreground m-0">Camera-ready & copyright upload</p>
                        </div>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
