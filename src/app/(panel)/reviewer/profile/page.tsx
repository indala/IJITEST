import { getUserProfile } from "@/actions/users";
import ProfileForm from "@/features/shared/components/ProfileForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Account Profile | Reviewer Portal",
};

export default async function ReviewerProfilePage() {
    const user = await getUserProfile();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-serif font-black text-slate-900 mb-2">Reviewer Profile</h2>
                <p className="text-slate-500 font-medium tracking-tight">Ensure your expertise and research interests are current for better review assignments.</p>
            </div>

            <ProfileForm user={user} />
        </div>
    );
}
