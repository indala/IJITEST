"use client";

import { Search, Loader2 } from 'lucide-react';
import { useState, memo, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card className="border-border/50 bg-card rounded-xl shadow-sm transition-all group">
            <CardHeader className="p-5 pb-0">
                <CardTitle className="text-sm 2xl:text-xl font-semibold text-primary">Track Manuscript</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-4">
                <form action={formAction} className="space-y-3">
                    <div className="space-y-1">
                        <Input
                            type="text"
                            name="paperId"
                            placeholder="Manuscript ID"
                            value={paperId}
                            onChange={(e) => setPaperId(e.target.value)}
                            className="h-10 bg-muted/20 border-border/50 text-xs focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                        />
                        {state && !state.success && (
                            <p className="text-[10px] text-destructive pl-1 font-semibold">{state.error}</p>
                        )}
                    </div>
                    <TrackButton />
                </form>
            </CardContent>
        </Card>
    );
}

function TrackButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-10 bg-[#000066] hover:bg-[#000088] text-white font-bold text-[10px] 2xl:text-xl tracking-wider rounded-lg transition-all shadow-sm uppercase gap-2"
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
