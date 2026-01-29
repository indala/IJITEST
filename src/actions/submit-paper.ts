"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const submissionSchema = z.object({
    authorName: z.string().min(2),
    authorEmail: z.string().email(),
    affiliation: z.string().min(2),
    paperTitle: z.string().min(10),
    abstract: z.string().min(50),
    keywords: z.string().min(5),
    manuscriptPath: z.string(), // Path returned from storage upload
    fileName: z.string(),
});

export async function submitPaper(data: z.infer<typeof submissionSchema>) {
    const supabase = await createClient();

    // Validate data
    const result = submissionSchema.safeParse(data);
    if (!result.success) {
        return { error: "Invalid form data" };
    }

    const { authorName, authorEmail, affiliation, paperTitle, abstract, keywords, manuscriptPath } = result.data;

    // Generate a Paper ID (Format: IJITEST-YYYY-XXX)
    // Note: For high concurrency, a database function or sequence is better, but this suffices for now.
    const year = new Date().getFullYear();
    const { count } = await supabase.from('submissions').select('*', { count: 'exact', head: true });
    const sequence = (count || 0) + 1;
    const paperId = `IJITEST-${year}-${String(sequence).padStart(3, '0')}`;

    // Insert into DB
    const { error } = await supabase.from('submissions').insert({
        paper_id: paperId,
        title: paperTitle,
        abstract: abstract,
        keywords: keywords,
        author_name: authorName,
        author_email: authorEmail,
        affiliation: affiliation,
        manuscript_url: manuscriptPath, // Store the storage path
        status: 'Submitted'
    });

    if (error) {
        console.error("Submission Error:", error);
        return { error: "Failed to save submission. Please try again." };
    }

    return { success: true, paperId };
}
