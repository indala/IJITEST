import { ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { ActionResponse } from '@/db/types';

interface TrackErrorCardProps {
    errorMessage?: Extract<ActionResponse, { success: false }>['error'] | null | undefined;
    onRetry: () => void;
}

export function TrackErrorCard({ errorMessage, onRetry }: TrackErrorCardProps) {
    return (
        <div className="p-12 sm:p-20 bg-card border border-border/50 rounded-xl text-center space-y-8 max-w-3xl mx-auto w-full shadow-sm">
            <div className="w-16 h-16 bg-destructive/5 rounded-xl flex items-center justify-center mx-auto text-destructive border border-destructive/10">
                <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
                <h2 className="font-semibold m-0">Access Denied</h2>
                <p className="text-muted-foreground m-0">
                    Manuscript not found or credentials mismatched.
                </p>
                {errorMessage && (
                    <p className="text-destructive/60 italic m-0">&quot;{errorMessage}&quot;</p>
                )}
            </div>
            <Button
                onClick={onRetry}
                className="h-12 px-10 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 font-bold text-label"
            >
                Try Again
            </Button>
        </div>
    );
}
