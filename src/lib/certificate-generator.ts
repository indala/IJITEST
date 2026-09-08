import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface CertificateData {
    paperId: string;
    title: string;
    authors: string[];
    volume: number;
    issue: number;
    year: number;
    monthRange?: string | null | undefined;
    doi?: string | null | undefined;
    publishedDate?: Date | string | null | undefined;
    issn?: string | undefined;
    journalTitle?: string | undefined;
    baseUrl?: string | undefined;
}

/**
 * Generates an official, high-resolution vector PDF Certificate of Publication.
 * Standard Landscape A4 dimensions: 841.89 x 595.28 points.
 */
export async function generatePublicationCertificate(data: CertificateData): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([841.89, 595.28]); // A4 Landscape
    const { width, height } = page.getSize();

    // Fonts
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontSerifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
    const fontSerifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

    // Palette
    const primaryColor = rgb(0.12, 0.23, 0.38); // Deep Academic Navy (#1e3a61)
    const goldColor = rgb(0.79, 0.64, 0.28);    // Rich Gold (#c9a347)
    const charcoalColor = rgb(0.2, 0.2, 0.2);   // Charcoal (#333333)
    const lightGray = rgb(0.6, 0.6, 0.6);

    // 1. Dual Decorative Borders
    // Outer border (Navy)
    page.drawRectangle({
        x: 25,
        y: 25,
        width: width - 50,
        height: height - 50,
        borderWidth: 3,
        borderColor: primaryColor,
    });

    // Inner border (Gold)
    page.drawRectangle({
        x: 32,
        y: 32,
        width: width - 64,
        height: height - 64,
        borderWidth: 1.5,
        borderColor: goldColor,
    });

    // Decorative corner notches
    const cornerSize = 12;
    page.drawRectangle({ x: 28, y: height - 44, width: cornerSize, height: cornerSize, color: goldColor });
    page.drawRectangle({ x: width - 40, y: height - 44, width: cornerSize, height: cornerSize, color: goldColor });
    page.drawRectangle({ x: 28, y: 32, width: cornerSize, height: cornerSize, color: goldColor });
    page.drawRectangle({ x: width - 40, y: 32, width: cornerSize, height: cornerSize, color: goldColor });

    // Helper: Draw centered text
    const drawCenteredText = (text: string, y: number, font: typeof fontRegular, size: number, color = charcoalColor) => {
        const textWidth = font.widthOfTextAtSize(text, size);
        const x = (width - textWidth) / 2;
        page.drawText(text, { x, y, size, font, color });
        return y;
    };

    // Helper: Wrap text to max width
    const wrapText = (text: string, font: typeof fontRegular, size: number, maxWidth: number): string[] => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    };

    // 2. Journal Header
    let currentY = height - 75;
    const journalTitle = (data.journalTitle || "INTERNATIONAL JOURNAL OF INNOVATIVE TRENDS IN ENGINEERING SCIENCE AND TECHNOLOGY").toUpperCase();
    drawCenteredText(journalTitle, currentY, fontBold, 13, primaryColor);

    currentY -= 16;
    const subheader = `ISSN: ${data.issn || "2584-XXXX"} (Online)  |  CrossRef Official Prefix: 10.68139  |  Open Access Peer-Reviewed Journal`;
    drawCenteredText(subheader, currentY, fontRegular, 9, goldColor);

    // Separator line
    currentY -= 14;
    page.drawLine({
        start: { x: 120, y: currentY },
        end: { x: width - 120, y: currentY },
        thickness: 1,
        color: goldColor,
    });

    // 3. Main Certificate Banner
    currentY -= 36;
    drawCenteredText("CERTIFICATE OF PUBLICATION", currentY, fontSerifBold, 26, primaryColor);

    currentY -= 20;
    drawCenteredText("THIS CERTIFICATE IS PROUDLY PRESENTED IN RECOGNITION OF PUBLICATION TO", currentY, fontRegular, 9.5, lightGray);

    // 4. Authors Section
    currentY -= 30;
    const authorsText = data.authors.length > 0 ? data.authors.join(", ") : "Contributing Author";
    const authorLines = wrapText(authorsText, fontSerifBold, 17, width - 180);
    for (const line of authorLines) {
        drawCenteredText(line, currentY, fontSerifBold, 17, goldColor);
        currentY -= 22;
    }

    // 5. Article Details
    currentY -= 4;
    drawCenteredText("for successfully publishing their peer-reviewed original research paper entitled:", currentY, fontSerifItalic, 11, charcoalColor);

    currentY -= 24;
    const titleLines = wrapText(`"${data.title}"`, fontSerifBold, 13, width - 180);
    for (const line of titleLines) {
        drawCenteredText(line, currentY, fontSerifBold, 13, primaryColor);
        currentY -= 18;
    }

    // 6. Publication Metadata Block
    currentY -= 8;
    const dateFormatted = data.publishedDate
        ? new Date(data.publishedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : `${data.monthRange || "Issue"} ${data.year}`;

    const metadataText = `Published in Volume ${data.volume}, Issue ${data.issue} (${data.monthRange ? data.monthRange + " " : ""}${data.year})  |  Paper ID: ${data.paperId}`;
    drawCenteredText(metadataText, currentY, fontRegular, 10, charcoalColor);

    currentY -= 15;
    const doiText = data.doi ? `DOI: https://doi.org/${data.doi}` : `Permanent URL: https://ijitest.org/archives/${data.paperId}`;
    drawCenteredText(doiText, currentY, fontBold, 9.5, primaryColor);

    // 7. Footer Signatures & Validation Seal
    const footerY = 65;

    // Left Signature: Managing Editor
    page.drawLine({
        start: { x: 80, y: footerY + 28 },
        end: { x: 230, y: footerY + 28 },
        thickness: 1,
        color: charcoalColor,
    });
    page.drawText("Managing Editor", { x: 115, y: footerY + 14, size: 9.5, font: fontBold, color: charcoalColor });
    page.drawText("IJITEST Editorial Board", { x: 105, y: footerY + 2, size: 8, font: fontRegular, color: lightGray });

    // Center: Validation Seal & Date
    page.drawRectangle({
        x: (width - 160) / 2,
        y: footerY - 5,
        width: 160,
        height: 46,
        borderWidth: 1,
        borderColor: goldColor,
        color: rgb(0.98, 0.98, 0.97),
    });
    drawCenteredText("OFFICIAL VERIFICATION", footerY + 25, fontBold, 8, primaryColor);
    drawCenteredText(`Issued on: ${dateFormatted}`, footerY + 12, fontRegular, 8, charcoalColor);
    drawCenteredText(`Ref: CERT-${data.paperId}`, footerY + 1, fontRegular, 7.5, lightGray);

    // Right Signature: Editor-in-Chief
    page.drawLine({
        start: { x: width - 230, y: footerY + 28 },
        end: { x: width - 80, y: footerY + 28 },
        thickness: 1,
        color: charcoalColor,
    });
    page.drawText("Editor-in-Chief", { x: width - 185, y: footerY + 14, size: 9.5, font: fontBold, color: charcoalColor });
    page.drawText("International Journal of IT & EST", { x: width - 215, y: footerY + 2, size: 8, font: fontRegular, color: lightGray });

    return await doc.save();
}
