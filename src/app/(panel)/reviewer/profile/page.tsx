import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileDossier from "@/features/profile/components/ProfileDossier";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Review Board Profile | IJITEST",
};

export default async function ReviewerProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <section className="space-y-4">
            <header className="space-y-1 border-b border-border/70 pb-3 sm:pb-4">
                <h1 className="panel-title text-xl xl:text-2xl font-bold text-primary">Review Board Profile</h1>
                <p className="panel-subtitle text-body-sm text-muted-foreground">Professional dossier and reviewer credentials repository.</p>
            </header>

            <Suspense fallback={
                <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                    <p className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Decrypting Identity Archive...</p>
                </div>
            }>
                <ProfileDossier role="reviewer" userId={(session.user as { id: string }).id} />
            </Suspense>
        </section>
    );
}
