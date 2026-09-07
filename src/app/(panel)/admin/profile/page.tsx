import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileDossier from "@/features/profile/components/ProfileDossier";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Account Profile | Admin Panel",
};

function ProfileDossierSkeleton() {
    return (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin opacity-20" />
            <p className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Initializing Identity Dossier...</p>
        </div>
    );
}

async function AdminProfileContent() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    return <ProfileDossier role="admin" userId={session.user.id} />;
}

export default function AdminProfilePage() {
    return (
        <section className="space-y-4">
            <header className="space-y-1 border-b border-border/70 pb-3 sm:pb-4">
                <h1 className="panel-title text-xl xl:text-2xl font-bold text-primary">Administrative Identity</h1>
                <p className="panel-subtitle text-body-sm text-muted-foreground">Manage your core credentials and administrative clearance.</p>
            </header>

            <Suspense fallback={<ProfileDossierSkeleton />}>
                <AdminProfileContent />
            </Suspense>
        </section>
    );
}
