import "dotenv/config";
import { db } from "../src/lib/db";
import { submissionFiles, applications } from "../src/db/schema";
import { eq, like, and, sql } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

/**
 * Migration script to:
 * 1. Move files from public/uploads to storage/ (Excluding published papers)
 * 2. Update database records to use /api/files/ prefix
 * 
 * Run with: pnpm tsx scripts/migrate-files.ts
 */
async function migrate() {
    console.log("Starting file migration...");

    const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
    const storageDir = path.join(process.cwd(), "storage");

    try {
        await fs.mkdir(storageDir, { recursive: true });

        // 1. Migrate Submissions (Excluding 'published' folder which remains public)
        const subFiles = await db.select().from(submissionFiles)
            .where(and(
                like(submissionFiles.fileUrl, "/uploads/%"),
                sql`${submissionFiles.fileUrl} NOT LIKE '/uploads/published/%'`
            ));

        console.log(`Found ${subFiles.length} submission files to migrate.`);

        for (const file of subFiles) {
            const oldUrl = file.fileUrl;
            const newUrl = oldUrl.replace("/uploads/", "/api/files/");
            const relativePath = oldUrl.replace("/uploads/", "");

            const oldPath = path.join(publicUploadsDir, relativePath);
            const newPath = path.join(storageDir, relativePath);

            try {
                await fs.mkdir(path.dirname(newPath), { recursive: true });
                await fs.rename(oldPath, newPath);
                await db.update(submissionFiles).set({ fileUrl: newUrl }).where(eq(submissionFiles.id, file.id));
                console.log(`Migrated: ${oldUrl} -> ${newUrl}`);
            } catch (err) {
                console.error(`Failed to migrate ${oldUrl}:`, err);
            }
        }

        // 2. Migrate Reviewer Applications
        const appFiles = await db.select().from(applications).where(like(applications.cvUrl, "/uploads/%"));
        console.log(`Found ${appFiles.length} application files to migrate.`);

        for (const app of appFiles) {
            // Handle CV
            if (app.cvUrl?.startsWith("/uploads/")) {
                const oldUrl = app.cvUrl;
                const newUrl = oldUrl.replace("/uploads/", "/api/files/");
                const relativePath = oldUrl.replace("/uploads/", "");
                const oldPath = path.join(publicUploadsDir, relativePath);
                const newPath = path.join(storageDir, relativePath);

                try {
                    await fs.mkdir(path.dirname(newPath), { recursive: true });
                    await fs.rename(oldPath, newPath);
                    await db.update(applications).set({ cvUrl: newUrl }).where(eq(applications.id, app.id));
                } catch (err) { console.error(`Failed to migrate application CV ${app.id}:`, err); }
            }

            // Handle Photo
            if (app.photoUrl?.startsWith("/uploads/")) {
                const oldUrl = app.photoUrl;
                const newUrl = oldUrl.replace("/uploads/", "/api/files/");
                const relativePath = oldUrl.replace("/uploads/", "");
                const oldPath = path.join(publicUploadsDir, relativePath);
                const newPath = path.join(storageDir, relativePath);

                try {
                    await fs.mkdir(path.dirname(newPath), { recursive: true });
                    await fs.rename(oldPath, newPath);
                    await db.update(applications).set({ photoUrl: newUrl }).where(eq(applications.id, app.id));
                } catch (err) { console.error(`Failed to migrate application photo ${app.id}:`, err); }
            }
        }

        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Migration error:", error);
    }
}

migrate().catch(console.error);
