import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs/promises";
import path from "path";

interface HeaderData {
    journal_name: string;
    volume: string | number;
    issue: string | number;
    month_year: string;
    website: string;
    issn: string;
    paper_id?: string;
}

/**
 * Modifies the header of a DOCX file by replacing placeholders with actual issue data.
 * @param inputPath - Path to the original manuscript DOCX.
 * @param outputPath - Path where the modified DOCX should be saved.
 * @param data - The data to inject into the template placeholders.
 */
export async function modifyManuscriptHeader(
    inputPath: string,
    outputPath: string,
    data: HeaderData
) {
    try {
        // Read the file as binary
        const content = await fs.readFile(inputPath);

        // Load the zip content
        const zip = new PizZip(content);

        // Initialize docxtemplater
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Set the template variables
        // We use the data provided, but also provide fallbacks
        doc.setData({
            journal_name: data.journal_name,
            volume: data.volume,
            issue: data.issue,
            month_year: data.month_year,
            website: data.website,
            issn: data.issn,
            paper_id: data.paper_id || ""
        });

        // Render the document (replace placeholders)
        doc.render();

        // Get the modified content as a buffer
        const buffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        // Ensure output directory exists
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        // Save the modified file
        await fs.writeFile(outputPath, buffer);

        return { success: true, path: outputPath };
    } catch (error: any) {
        console.error("DOCX Modification Error:", error);
        // If docxtemplater fails (e.g. no tags found or malformed docx), 
        // we might want to still allow publication but log the error.
        return { success: false, error: error.message };
    }
}
