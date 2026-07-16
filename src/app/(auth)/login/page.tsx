import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export const metadata = {
    title: "Login | IJITEST",
    description: "Sign in to your IJITEST account.",
    robots: 'noindex',
};

function LoginFallback() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin opacity-20" />
            <p className="text-[10px] font-semibold capitalize tracking-widest animate-pulse">Checking credentials...</p>
        </div>
    );
}

async function LoginContent() {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        const role = session.user.role || 'author';
        redirect(`/${role}`);
    }

    return <LoginClient />;
}

// Login Page component wrapper for the auth route group
export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFallback />}>
            <LoginContent />
        </Suspense>
    );
}
