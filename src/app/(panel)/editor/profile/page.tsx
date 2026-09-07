import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileDossier from "@/features/profile/components/ProfileDossier";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Editorial Board Profile | IJITEST",
};

export default async function EditorProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <section className="space-y-4">
            <header className="space-y-1 border-b border-border/70 pb-3 sm:pb-4">
                <h1 className="panel-title text-xl xl:text-2xl font-bold text-primary">Editorial Identity</h1>
                <p className="panel-subtitle text-body-sm text-muted-foreground">Board metadata and system clearance credentials.</p>
            </header>

            <Suspense fallback={
                <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                    <p className="text-[10px] font-semibold capitalize tracking-widest animate-pulse">Decrypting board credentials...</p>
                </div>
            }>
                <ProfileDossier role="editor" userId={session.user.id} />
            </Suspense>
        </section>
    );
}
