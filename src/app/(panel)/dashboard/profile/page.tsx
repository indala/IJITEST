import { getUserProfile } from "@/actions/users";
import ProfileForm from "@/features/shared/components/ProfileForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Account Profile | Author Workspace",
};

export default async function AuthorProfilePage() {
    const user = await getUserProfile();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">My Profile</h2>
                <p className="text-xs font-medium text-slate-500 tracking-wide">Update your personal information and profile photo.</p>
            </div>

            <ProfileForm user={user} />
        </div>
    );
}
