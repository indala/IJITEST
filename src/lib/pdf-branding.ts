import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { PDFPage, PDFFont, Color } from 'pdf-lib';
import fontkit from "@pdf-lib/fontkit";
import fs from 'fs/promises';
import path from 'path';
import { resolveAbsolutePath } from './fs-utils';

interface BrandingMetadata {
    journalName: string;
    journalShortName: string;
    volume: string | number;
    issue: string | number;
    year: string | number;
    monthRange: string;
    issn: string;
    website: string;
    paperId: string;
    startPage?: number | null;
    endPage?: number | null;
}

/* =========================================================
   HEADER CONFIGURATION
   ========================================================= */
const HEADER_FIRST_PAGE_ONLY = true;
const HEADER_HEIGHT = 90;
const HEADER_CONTENT_TOP_OFFSET = 26;
const HEADER_LOGO_X = 30;
const HEADER_LOGO_Y_OFFSET = 35;
const HEADER_LOGO_HEIGHT = 33;
const HEADER_TITLE_X = 105;
const HEADER_TITLE_Y_OFFSET = 18;
const HEADER_SUBTITLE_X = 105;
const HEADER_SUBTITLE_Y_OFFSET = 32;
const HEADER_INFO_Y_OFFSET = 48;
const HEADER_LINE_Y_OFFSET = 62;
const HEADER_LINE_X_MARGIN = 50;

const HEADER_TITLE_FONT_SIZE = 11;
const HEADER_SUBTITLE_FONT_SIZE = 11;
const HEADER_INFO_FONT_SIZE = 11;
const HEADER_LETTER_SPACING = 0.5;

const HEADER_TEXT_COLOR = rgb(0.705, 0.137, 0.623);
const HEADER_LINE_COLOR = rgb(0.705, 0.137, 0.623);

/* =========================================================
   FOOTER CONFIGURATION
   ========================================================= */
const FOOTER_HEIGHT = 55;
const FOOTER_WIDTH_PERCENT = 0.87;
const FOOTER_IMAGE_Y = 8;
const FOOTER_IMAGE_X_ADJUST = 5;
const FOOTER_FONT_SIZE = 11;
const FOOTER_TEXT_PADDING = 10;
const CENTER_TEXT_X_ADJUST = 20;
const TEXT_Y_ADJUST = 0;

/* =========================================================
   HELPERS
   ========================================================= */

function drawTextWithSpacing(page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont, color: Color, spacing = 0) {
    let currentX = x;
    for (const char of text) {
        page.drawText(char, {
            x: currentX,
            y,
            size,
            font,
            color,
        });
        currentX += font.widthOfTextAtSize(char, size) + spacing;
    }
}

function widthOfTextWithSpacing(text: string, size: number, font: PDFFont, spacing = 0) {
    const baseWidth = font.widthOfTextAtSize(text, size);
    const totalSpacing = Math.max(0, text.length - 1) * spacing;
    return baseWidth + totalSpacing;
}


export async function brandPdf(inputPath: string, outputPath: string, metadata: BrandingMetadata) {
    try {
        const cleanOut = outputPath.replace(/^\/+/, '');

        // 1. Read the existing PDF
        const fullInputPath = resolveAbsolutePath(inputPath);
        const pdfBytes = await fs.readFile(fullInputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        pdfDoc.registerFontkit(fontkit);
        const pages = pdfDoc.getPages();

        // 2. Embed fonts
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // 3. Load and embed Logo & Footer
        const logoPath = path.join(process.cwd(), 'public/logo.png');
        const logoBytes = await fs.readFile(logoPath);
        const logoImage = await pdfDoc.embedPng(logoBytes);

        const footerPath = path.join(process.cwd(), 'public/footer.png');
        const footerBytes = await fs.readFile(footerPath);
        const footerImage = await pdfDoc.embedPng(footerBytes);

        // 4. PROCESS ALL PAGES
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            if (!page) continue;

            const { width, height } = page.getSize();
            const currentPageNumber = (metadata.startPage || 1) + i;

            // --- HEADER REPLACEMENT ---
            const shouldRenderHeader = HEADER_FIRST_PAGE_ONLY ? i === 0 : true;

            if (shouldRenderHeader) {
                page.drawRectangle({
                    x: 0,
                    y: height - HEADER_HEIGHT,
                    width,
                    height: HEADER_HEIGHT,
                    color: rgb(1, 1, 1),
                });

                const logoWidth = (logoImage.width / logoImage.height) * HEADER_LOGO_HEIGHT;
                page.drawImage(logoImage, {
                    x: HEADER_LOGO_X,
                    y: height - HEADER_LOGO_Y_OFFSET - HEADER_CONTENT_TOP_OFFSET,
                    width: logoWidth,
                    height: HEADER_LOGO_HEIGHT,
                });

                // TITLE with Spacing
                drawTextWithSpacing(
                    page,
                    metadata.journalName,
                    HEADER_TITLE_X,
                    height - HEADER_TITLE_Y_OFFSET - HEADER_CONTENT_TOP_OFFSET,
                    HEADER_TITLE_FONT_SIZE,
                    boldFont,
                    HEADER_TEXT_COLOR,
                    HEADER_LETTER_SPACING
                );

                // SUBTITLE with Spacing
                drawTextWithSpacing(
                    page,
                    `A Peer-Reviewed International Research Journal (${metadata.journalShortName})`,
                    HEADER_SUBTITLE_X,
                    height - HEADER_SUBTITLE_Y_OFFSET - HEADER_CONTENT_TOP_OFFSET,
                    HEADER_SUBTITLE_FONT_SIZE,
                    boldFont,
                    HEADER_TEXT_COLOR,
                    HEADER_LETTER_SPACING
                );

                // WEBSITE | ISSN (Centered with Spacing)
                const infoText = `${metadata.website} | E-ISSN: ${metadata.issn}`;
                const infoWidth = widthOfTextWithSpacing(infoText, HEADER_INFO_FONT_SIZE, boldFont, HEADER_LETTER_SPACING);

                drawTextWithSpacing(
                    page,
                    infoText,
                    (width - infoWidth) / 2,
                    height - HEADER_INFO_Y_OFFSET - HEADER_CONTENT_TOP_OFFSET,
                    HEADER_INFO_FONT_SIZE,
                    boldFont,
                    HEADER_TEXT_COLOR,
                    HEADER_LETTER_SPACING
                );

                page.drawLine({
                    start: { x: HEADER_LINE_X_MARGIN, y: height - HEADER_LINE_Y_OFFSET - HEADER_CONTENT_TOP_OFFSET },
                    end: { x: width - HEADER_LINE_X_MARGIN, y: height - HEADER_LINE_Y_OFFSET - HEADER_CONTENT_TOP_OFFSET },
                    thickness: 0.8,
                    color: HEADER_LINE_COLOR,
                    dashArray: [2, 2],
                });
            }

            // --- FOOTER REPLACEMENT ---
            page.drawRectangle({ x: 0, y: 0, width, height: FOOTER_HEIGHT, color: rgb(1, 1, 1) });
            
            const targetWidth = width * FOOTER_WIDTH_PERCENT;
            const scale = targetWidth / footerImage.width;
            const targetHeight = footerImage.height * scale;
            const fx = (width - targetWidth + FOOTER_IMAGE_X_ADJUST) / 2;
            const fy = FOOTER_IMAGE_Y;

            page.drawImage(footerImage, { x: fx, y: fy, width: targetWidth, height: targetHeight });
            const fTextY = fy + targetHeight / 2 - FOOTER_FONT_SIZE / 2 + TEXT_Y_ADJUST;

            // Left: Paper ID
            page.drawText(`Paper ID: ${metadata.paperId}`, {
                x: fx + FOOTER_TEXT_PADDING,
                y: fTextY,
                size: FOOTER_FONT_SIZE,
                font: boldFont,
                color: rgb(1, 1, 1),
            });

            // Center: Volume, Issue, Date
            const centerText = `${metadata.website}    Volume ${metadata.volume} Issue ${metadata.issue}, ${metadata.monthRange} ${metadata.year}`;
            const centerTextWidth = boldFont.widthOfTextAtSize(centerText, FOOTER_FONT_SIZE);
            page.drawText(centerText, {
                x: fx + targetWidth / 2 - centerTextWidth / 2 + CENTER_TEXT_X_ADJUST,
                y: fTextY,
                size: FOOTER_FONT_SIZE,
                font: boldFont,
                color: rgb(1, 1, 1),
            });

            // Right: Page Number
            const pText = `${currentPageNumber}`;
            const pWidth = boldFont.widthOfTextAtSize(pText, FOOTER_FONT_SIZE);
            page.drawText(pText, {
                x: fx + targetWidth - pWidth - FOOTER_TEXT_PADDING,
                y: fTextY,
                size: FOOTER_FONT_SIZE,
                font: boldFont,
                color: rgb(1, 1, 1),
            });
        }

        // 5. Save the branded PDF
        const brandedBytes = await pdfDoc.save();
        const fullOutputPath = path.join(process.cwd(), 'public', cleanOut);
        await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });
        await fs.writeFile(fullOutputPath, brandedBytes);

        return { success: true, path: outputPath };
    } catch (error) {
        console.error("PDF Branding Error:", error);
        throw new Error(`Failed to replace metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
}
