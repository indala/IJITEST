import { getProfileData } from "@/actions/profile"
import { ProfileDossierClient } from "./ProfileDossierClient"

export default async function ProfileDossier({ role, userId }: { role: 'admin' | 'editor' | 'reviewer' | 'author', userId: string }) {
    const profileResponse = await getProfileData(userId, role)
    if (!profileResponse.success) {
        return <div>Error loading profile data: {profileResponse.error}</div>
    }
    if (!profileResponse.data) {
        return <div>Error loading profile data: Data not found</div>
    }
    
    return <ProfileDossierClient data={profileResponse.data} role={role} userId={userId} />
}
