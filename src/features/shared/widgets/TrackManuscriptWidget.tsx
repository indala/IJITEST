"use client";

import { Search, Loader2 } from 'lucide-react';
import { useState, memo, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type ActionResponse, type Submission } from "@/db/types";

function TrackManuscriptWidget() {
    const [paperId, setPaperId] = useState<Submission['paperId']>('');
    const router = useRouter();

    const [state, formAction] = useActionState(
        async (_prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse | null> => {
            const id = formData.get('paperId') as string;
            if (id && id.trim()) {
                router.push(`/track?id=${id.trim()}`);
                return { success: true };
            }
            return { success: false, error: "Please enter a valid Manuscript ID." };
        },
        null
    );

    return (
        <div className="bg-card p-3.5 sm:p-4 2xl:p-5 rounded-xl border border-border/70 shadow-2xs space-y-3 2xl:space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Search className="w-4 h-4 2xl:w-5 2xl:h-5" />
                </div>
                <h3 className="card-title-brand m-0">
                    Track Manuscript
                </h3>
            </div>
            <form action={formAction} className="space-y-3">
                <div className="space-y-1">
                    <Input
                        type="text"
                        name="paperId"
                        placeholder="Manuscript ID (e.g. IJITEST-2026-001)"
                        value={paperId}
                        onChange={(e) => setPaperId(e.target.value)}
                        className="input-standard w-full"
                    />
                    {state && !state.success && (
                        <p className="text-meta text-destructive pl-1 font-semibold m-0">{state.error}</p>
                    )}
                </div>
                <TrackButton />
            </form>
        </div>
    );
}

function TrackButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="btn-primary w-full flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
        >
            {pending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <Search className="w-3.5 h-3.5" />
            )}
            Track
        </Button>
    );
}

export default memo(TrackManuscriptWidget);
