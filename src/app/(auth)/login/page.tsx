import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export const metadata = {
    title: "Login | IJITEST",
    description: "Sign in to your IJITEST account.",
};

// Login Page component wrapper for the auth route group
export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        const role = session.user.role || 'author';
        redirect(`/${role}`);
    }

    return <LoginClient />;
}
