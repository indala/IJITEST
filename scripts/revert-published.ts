import "dotenv/config";
import { db } from "../src/lib/db";
import { submissionFiles } from "../src/db/schema";
import { eq, like } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

/**
 * Revert migration for published files.
 * Moves them back to public/uploads/published and updates DB URLs.
 */
async function revertPublished() {
    console.log("Reverting published files migration...");

    const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
    const storageDir = path.join(process.cwd(), "storage");

    try {
        const subFiles = await db.select().from(submissionFiles).where(like(submissionFiles.fileUrl, "/api/files/published/%"));
        console.log(`Found ${subFiles.length} published files to revert.`);

        for (const file of subFiles) {
            const oldUrl = file.fileUrl;
            const newUrl = oldUrl.replace("/api/files/", "/uploads/");
            const relativePath = oldUrl.replace("/api/files/", "");
            
            const oldPath = path.join(storageDir, relativePath);
            const newPath = path.join(publicUploadsDir, relativePath);

            try {
                await fs.mkdir(path.dirname(newPath), { recursive: true });
                await fs.rename(oldPath, newPath);
                await db.update(submissionFiles).set({ fileUrl: newUrl }).where(eq(submissionFiles.id, file.id));
                console.log(`Reverted: ${oldUrl} -> ${newUrl}`);
            } catch (err) {
                console.error(`Failed to revert ${oldUrl}:`, err);
            }
        }

        console.log("Revert completed successfully.");
    } catch (error) {
        console.error("Revert error:", error);
    }
}

revertPublished().catch(console.error);
