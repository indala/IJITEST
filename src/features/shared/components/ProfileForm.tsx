"use client";

import { useState, useRef, useCallback, useActionState } from 'react';
import { updateUserProfile } from '@/actions/users';
import { type User, type UserProfile } from "@/db/types";

// Import sub-components
import { ProfileHeader } from './profile/ProfileHeader';
import { ProfileInfoCards } from './profile/ProfileInfoCards';
import { ExpertiseDossier } from './profile/ExpertiseDossier';
import { ProfileFormActions } from './profile/ProfileFormActions';

interface ProfileFormProps {
    user: {
        id: User['id'];
        email: User['email'];
        full_name: UserProfile['fullName'];
        designation?: UserProfile['designation'];
        institute?: UserProfile['institute'];
        phone?: UserProfile['phone'];
        bio?: UserProfile['bio'];
        photo_url?: UserProfile['photoUrl'];
        role: User['role'];
        nationality?: UserProfile['nationality'];
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [state, formAction] = useActionState(async (_prevState: { success?: boolean; error?: string } | null, formData: FormData) => {
        try {
            const result = await updateUserProfile(formData);
            if (result.success) {
                return { success: true };
            } else {
                return { error: result.error || "Update failed" };
            }
        } catch {
            return { error: "An unexpected error occurred." };
        }
    }, null);

    // Derive showSuccess directly from state — no useEffect needed
    const showSuccess = state?.success === true;

    const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handlePhotoClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const statusForActions = showSuccess ? { success: true } : (state?.error ? { error: state.error } : null);

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <form action={formAction} className="space-y-12">
                {/* 1. Header & Photo Area */}
                <ProfileHeader
                    fullName={user.full_name}
                    email={user.email}
                    role={user.role}
                    photoUrl={user.photo_url || ""}
                    previewUrl={previewUrl}
                    onPhotoClick={handlePhotoClick}
                />

                {/* Hidden File Input */}
                <input
                    id="profile-photo-input"
                    type="file"
                    name="photo"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    aria-label="Upload profile photo"
                    title="Choose a profile photo"
                />
                <input type="hidden" name="existingPhotoUrl" value={user.photo_url || ''} title="Existing Photo URL" />

                {/* 2. Professional Details & Institution */}
                <ProfileInfoCards
                    fullName={user.full_name}
                    designation={user.designation || ""}
                    institute={user.institute || ""}
                    phone={user.phone || ""}
                    nationality={user.nationality || ""}
                />

                {/* 3. Expertise Dossier */}
                <ExpertiseDossier bio={user.bio || ""} />

                {/* 4. Feedback & Actions */}
                <ProfileFormActions
                    status={statusForActions}
                />
            </form>
        </div>
    );
}
