"use server";
import "server-only"

import { db } from "@/lib/db";
import {
    users,
    userProfiles,
    applications,
    applicationInterests,
    masterInterests,
    submissions,
    reviews,
    submissionVersions,
    reviewAssignments
} from "@/db/schema";
import { eq, sql, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeDeleteFile, uploadFileToStorage } from "@/lib/fs-utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { type ActionResponse, actionSuccess, actionError, type ProfileData, serverError } from "@/db/types";
import { insertProfileSchema } from "@/db/validation";



export async function getProfileData(userId: string, role: 'admin' | 'editor' | 'reviewer' | 'author'): Promise<ActionResponse<ProfileData>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return actionError("Unauthorized");

        // 1. Fetch User Base Info and Profile
        const userWithProfile = await db.select({
            id: users.id,
            email: users.email,
            name: userProfiles.fullName,
            designation: userProfiles.designation,
            institute: userProfiles.institute,
            phone: userProfiles.phone,
            nationality: userProfiles.nationality,
            bio: userProfiles.bio,
            photoUrl: userProfiles.photoUrl,
            orcidId: userProfiles.orcidId,
        })
            .from(users)
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(eq(users.id, userId))
            .limit(1);

        if (userWithProfile.length === 0 || !userWithProfile[0]) return actionError("User not found");
        const userData = userWithProfile[0];

        const profileData: Partial<ProfileData> = {
            id: userData.id,
            email: userData.email,
            name: userData.name || "",
            designation: userData.designation || "",
            institute: userData.institute || "",
            phone: userData.phone || "",
            nationality: userData.nationality || "India",
            bio: userData.bio || "",
            photoUrl: userData.photoUrl,
            orcidId: userData.orcidId,
            researchInterests: []
        };

        // 2. Fetch Application Data (if not admin)
        if (role !== 'admin') {
            const appRows = await db.select({
                institute: applications.institute,
                country: applications.nationality,
                status: applications.status,
                rejectionReason: sql<string | null>`NULL`,
                reviewedAt: applications.reviewedAt
            })
                .from(applications)
                .where(eq(applications.email, userData.email))
                .limit(1);

            const appData = appRows[0];
            if (appData) {
                profileData.application = {
                    institute: appData.institute,
                    country: appData.country || "",
                    status: appData.status,
                    rejectionReason: appData.rejectionReason,
                    reviewedAt: appData.reviewedAt
                };

                // Fetch interests from join table
                if (role === 'reviewer' || role === 'editor') {
                    const interestRows = await db.select({ name: masterInterests.name })
                        .from(applicationInterests)
                        .innerJoin(applications, eq(applicationInterests.applicationId, applications.id))
                        .innerJoin(masterInterests, eq(applicationInterests.interestId, masterInterests.id))
                        .where(eq(applications.email, userData.email));
                    profileData.researchInterests = interestRows.map(r => r.name);
                } else {
                    profileData.researchInterests = [];
                }
            } else {
                profileData.researchInterests = [];
            }
        } else {
            profileData.researchInterests = [];
        }

        // 4. Role-specific History
        let history: ProfileData['history'] = [];
        if (role === 'author' || role === 'reviewer') {
            const latestVersions = db.select({
                submissionId: submissionVersions.submissionId,
                maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as('max_version')
            })
            .from(submissionVersions)
            .groupBy(submissionVersions.submissionId)
            .as('lv');

            if (role === 'author') {
                const subRows = await db.select({
                    title: submissionVersions.title,
                    status: submissions.status,
                    submittedAt: submissions.submittedAt
                })
                    .from(submissions)
                    .innerJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
                    .innerJoin(submissionVersions, and(
                        eq(submissionVersions.submissionId, submissions.id),
                        eq(submissionVersions.versionNumber, latestVersions.maxVersion)
                    ))
                    .where(eq(submissions.correspondingAuthorId, userId))
                    .orderBy(desc(submissions.submittedAt))
                    .limit(10);
                history = subRows;
            } else {
                const revRows = await db.select({
                    title: submissionVersions.title,
                    decision: reviews.decision,
                    updatedAt: reviews.submittedAt
                })
                    .from(reviews)
                    .innerJoin(reviewAssignments, eq(reviews.assignmentId, reviewAssignments.id))
                    .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
                    .innerJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
                    .innerJoin(submissionVersions, and(
                        eq(submissionVersions.submissionId, submissions.id),
                        eq(submissionVersions.versionNumber, latestVersions.maxVersion)
                    ))
                    .where(and(
                        eq(reviewAssignments.reviewerId, userId),
                        eq(reviewAssignments.status, 'completed')
                    ))
                    .orderBy(desc(reviews.submittedAt))
                    .limit(10);
                history = revRows;
            }
        }
        profileData.history = history;

        // 5. Calculate Completeness
        profileData.completeness = await getProfileCompleteness(profileData, role);

        return actionSuccess(profileData as ProfileData);
    } catch (error) {
        return serverError(error, "fetch profile");
    }
}

export async function updateProfileField(userId: string, field: string, value: string): Promise<ActionResponse<string>> {
    // Auth: verify the caller owns this profile
    const session = await getServerSession(authOptions);
    if (!session?.user) return actionError("Unauthorized");
    if (session.user.id !== userId && session.user.role !== 'admin') {
        return actionError("Unauthorized: You can only edit your own profile.");
    }

    const fieldMapping: Record<string, string> = {
        name: 'fullName',
        designation: 'designation',
        orcidId: 'orcidId',
        phone: 'phone',
        institute: 'institute',
        nationality: 'nationality',
        bio: 'bio'
    };

    const dbField = fieldMapping[field];
    if (!dbField) return actionError('Field not permitted');

    const trimmedValue = value.trim();

    // 🛡️ Elite: Dynamic schema validation using drizzle-zod .shape
    const fieldSchema = insertProfileSchema.shape[dbField as keyof typeof insertProfileSchema.shape];
    const validation = fieldSchema.safeParse(trimmedValue);

    if (!validation.success) {
        return actionError(validation.error.issues[0]?.message || "Validation failed");
    }

    try {
        const updateDoc = { [dbField]: validation.data };

        await db.update(userProfiles)
            .set(updateDoc)
            .where(eq(userProfiles.userId, userId));

        revalidatePath("/(panel)", "layout");
        return actionSuccess(trimmedValue);
    } catch (error) {
        console.error("updateProfileField error:", error);
        return serverError(error, "update profile field");
    }
}

export async function updateResearchInterests(userId: string, interests: string[]): Promise<ActionResponse<string[]>> {
    // Auth: verify the caller owns this profile
    const session = await getServerSession(authOptions);
    if (!session?.user) return actionError("Unauthorized");
    if (session.user.id !== userId && session.user.role !== 'admin') {
        return actionError("Unauthorized: You can only update your own interests.");
    }

    if (!Array.isArray(interests)) return actionError("Invalid interests format");
    const cleanInterests = interests.map(i => i.trim()).filter(Boolean).slice(0, 20);

    try {
        await db.transaction(async (tx) => {
            // Get User Email and Profile
            const userRows = await tx.select({ email: users.email, role: users.role })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            const user = userRows[0];
            if (!user) throw new Error("User not found");

            const appRows = await tx.select({ id: applications.id })
                .from(applications)
                .where(eq(applications.email, user.email))
                .limit(1);

            let applicationId = appRows[0]?.id;

            if (!applicationId) {
                const profileRows = await tx.select()
                    .from(userProfiles)
                    .where(eq(userProfiles.userId, userId))
                    .limit(1);
                const profile = profileRows[0];

                const appType = user.role === 'editor' ? 'editor' : 'reviewer';
                const [insertResult] = await tx.insert(applications).values({
                    type: appType,
                    fullName: profile?.fullName || (user.email.split('@')[0] ?? ''),
                    email: user.email,
                    designation: profile?.designation || 'Staff',
                    institute: profile?.institute || 'IJITEST',
                    status: 'approved',
                    nationality: profile?.nationality || 'India',
                });
                applicationId = insertResult.insertId;
            }

            // Update the many-to-many interests join table
            await tx.delete(applicationInterests).where(eq(applicationInterests.applicationId, applicationId));

            // Batch: fetch all existing interests in one query
            const existingInterests = await tx.select().from(masterInterests).where(
                inArray(masterInterests.name, cleanInterests)
            );
            const existingMap = new Map(existingInterests.map(i => [i.name, i.id]));

            // Batch: insert any missing interests
            const newNames = cleanInterests.filter(name => !existingMap.has(name));
            for (const name of newNames) {
                const [inserted] = await tx.insert(masterInterests).values({ name });
                existingMap.set(name, inserted.insertId);
            }

            // Batch: insert all join table entries
            const joinRows = cleanInterests.map(name => ({
                applicationId,
                interestId: existingMap.get(name)!
            }));
            await tx.insert(applicationInterests).values(joinRows);
        });

        revalidatePath("/(panel)", "layout");
        return { success: true, data: cleanInterests };
    } catch (error) {
        console.error("updateResearchInterests error:", error);
        return serverError(error, "update research interests");
    }
}

export async function updateProfilePhoto(userId: string, formData: FormData): Promise<ActionResponse<string>> {
    // Auth: verify the caller owns this profile
    const session = await getServerSession(authOptions);
    if (!session?.user) return actionError("Unauthorized");
    if (session.user.id !== userId && session.user.role !== 'admin') {
        return actionError("Unauthorized: You can only update your own photo.");
    }

    const file = formData.get("file") as File;
    if (!file) return actionError("No file provided");

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return actionError("Invalid file type. Only JPG, PNG and WEBP allowed.");
    }

    if (file.size > 2 * 1024 * 1024) {
        return actionError("File too large. Max 2MB allowed.");
    }

    try {
        const ext = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${ext}`;
        const relativePhotoPath = `profiles/${fileName}`;
        const photoUrl = `/api/files/profiles/${fileName}`;

        // Get old photo to delete later
        const rows = await db.select({ photoUrl: userProfiles.photoUrl })
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId))
            .limit(1);

        const oldPhoto = rows[0]?.photoUrl;

        const photoBuffer = Buffer.from(await file.arrayBuffer());
        await uploadFileToStorage(relativePhotoPath, photoBuffer, file.name);

        await db.update(userProfiles)
            .set({ photoUrl: photoUrl })
            .where(eq(userProfiles.userId, userId));

        await safeDeleteFile(oldPhoto);

        revalidatePath("/(panel)", "layout");
        return { success: true, data: photoUrl };
    } catch (error) {
        console.error("updateProfilePhoto error:", error);
        return serverError(error, "update profile photo");
    }
}

async function getProfileCompleteness(profileData: Partial<ProfileData>, role: string) {
    let score = 0;
    let total = 0;
    const missing: string[] = [];

    const check = (val: unknown, label: string) => {
        total++;
        if (val && (Array.isArray(val) ? val.length > 0 : val.toString().trim().length > 0)) {
            score++;
        } else {
            missing.push(label);
        }
    };

    check(profileData.name, 'Full Name');
    check(profileData.designation, 'Designation');
    check(profileData.email, 'Email Address');
    check(profileData.institute, 'Academic Institute');
    check(profileData.nationality, 'Nationality/Country');
    check(profileData.phone, 'Phone Number');
    check(profileData.bio, 'Biography');

    if (role !== 'admin' && role !== 'author') {
        check(profileData.researchInterests, 'Research Interests');
    }
    check(profileData.photoUrl, 'Profile Photo');
    check(profileData.orcidId, 'ORCID ID');
    check(profileData.history, role === 'author' ? 'Submission History' : 'Activity History');

    return {
        score,
        total,
        percentage: Math.round((score / total) * 100),
        missing
    };
}
