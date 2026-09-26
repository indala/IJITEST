import { Suspense } from "react";
import { MessagesTabContainer } from "@/features/messages/components/MessagesTabContainer";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Intelligence Inbox | IJITEST Administrative Board",
    description: "Secure gateway for institutional inquiries and researcher communications."
};

export default function MessagesPage() {
    return (
        <section className="h-[calc(100vh-100px)] flex flex-col p-0 overflow-hidden">
            <Suspense fallback={
                <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-40">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="font-mono text-meta uppercase tracking-[0.5em] animate-pulse">Initializing Comm-Matrix...</p>
                </div>
            }>
                <div className="flex-1 min-h-0 px-2 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6 flex flex-col overflow-hidden">
                    <MessagesTabContainer />
                </div>
            </Suspense>
        </section>
    );
}
