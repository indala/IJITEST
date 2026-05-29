import { Suspense } from "react";
import { LiveChatContent } from "@/features/chat/components/LiveChatContent";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Reviewer Messages | IJITEST Portal",
    description: "Direct peer-review synchronization chat channels with editors and administrators."
};

export default function ReviewerMessagesPage() {
    return (
        <section className="h-[calc(100vh-140px)] flex flex-col gap-4 p-0">
            <header className="flex flex-col px-8 py-1 shrink-0 border-l-2 border-primary/20">
                <h1 className="text-xl font-bold tracking-tight capitalize">messages</h1>
            </header>

            <Suspense fallback={
                <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-40">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Initializing Comm-Matrix...</p>
                </div>
            }>
                <div className="flex-1 min-h-0 px-8 pb-8 overflow-hidden">
                    <LiveChatContent />
                </div>
            </Suspense>
        </section>
    );
}
