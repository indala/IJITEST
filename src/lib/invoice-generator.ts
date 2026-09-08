import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface InvoiceData {
    invoiceNumber: string;
    date: Date | string;
    paperId: string;
    paperTitle: string;
    authorName: string;
    authorEmail?: string | null | undefined;
    authorInstitution?: string | null | undefined;
    amount: number | string;
    currency: string;
    transactionId?: string | null | undefined;
    paymentMethod?: string | null | undefined;
    journalTitle?: string | undefined;
    publisherName?: string | undefined;
    publisherAddress?: string | undefined;
}

/**
 * Generates an official, high-resolution PDF Tax Invoice and APC Receipt.
 * Standard Portrait A4 dimensions: 595.28 x 841.89 points.
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

    const primaryColor = rgb(0.12, 0.23, 0.38); // Academic Navy
    const goldColor = rgb(0.79, 0.64, 0.28);    // Gold
    const charcoalColor = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.5, 0.5, 0.5);
    const borderGray = rgb(0.88, 0.88, 0.88);
    const greenColor = rgb(0.08, 0.64, 0.29);

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

    // 1. Top Decorative Bar
    page.drawRectangle({
        x: 0,
        y: height - 10,
        width,
        height: 10,
        color: primaryColor,
    });

    let currentY = height - 45;

    // 2. Journal & Publisher Header
    const journalTitle = data.journalTitle || "International Journal of Innovative Trends in Engineering Science and Technology (IJITEST)";
    page.drawText(journalTitle, {
        x: 40,
        y: currentY,
        size: 11,
        font: fontBold,
        color: primaryColor,
    });

    currentY -= 14;
    const publisherName = data.publisherName || "Felix Academic Publications";
    const publisherAddress = data.publisherAddress || "Madhurawada, Visakhapatnam, Andhra Pradesh, India";
    page.drawText(`Published by ${publisherName}  |  ${publisherAddress}`, {
        x: 40,
        y: currentY,
        size: 8.5,
        font: fontRegular,
        color: lightGray,
    });

    currentY -= 12;
    page.drawLine({
        start: { x: 40, y: currentY },
        end: { x: width - 40, y: currentY },
        thickness: 1,
        color: borderGray,
    });

    // 3. Invoice Title & Status
    currentY -= 35;
    page.drawText("TAX INVOICE & PAYMENT RECEIPT", {
        x: 40,
        y: currentY,
        size: 18,
        font: fontBold,
        color: primaryColor,
    });

    // Green PAID Badge on Right
    const badgeText = "PAID & VERIFIED";
    const badgeWidth = fontBold.widthOfTextAtSize(badgeText, 10) + 16;
    page.drawRectangle({
        x: width - 40 - badgeWidth,
        y: currentY - 4,
        width: badgeWidth,
        height: 24,
        color: rgb(0.93, 0.98, 0.95),
        borderWidth: 1,
        borderColor: greenColor,
    });
    page.drawText(badgeText, {
        x: width - 40 - badgeWidth + 8,
        y: currentY + 3,
        size: 10,
        font: fontBold,
        color: greenColor,
    });

    // 4. Metadata Two-Column Grid
    currentY -= 35;

    // Left Column: Billed To
    page.drawText("BILLED TO:", { x: 40, y: currentY, size: 9, font: fontBold, color: goldColor });
    page.drawText(data.authorName, { x: 40, y: currentY - 15, size: 11, font: fontBold, color: charcoalColor });
    if (data.authorInstitution) {
        page.drawText(data.authorInstitution, { x: 40, y: currentY - 28, size: 9, font: fontRegular, color: charcoalColor });
    }
    if (data.authorEmail) {
        page.drawText(data.authorEmail, { x: 40, y: currentY - (data.authorInstitution ? 41 : 28), size: 9, font: fontRegular, color: lightGray });
    }

    // Right Column: Invoice Details
    const rightColX = 360;
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    page.drawText("INVOICE DETAILS:", { x: rightColX, y: currentY, size: 9, font: fontBold, color: goldColor });
    page.drawText(`Invoice No: ${data.invoiceNumber}`, { x: rightColX, y: currentY - 15, size: 9.5, font: fontBold, color: charcoalColor });
    page.drawText(`Date of Payment: ${formattedDate}`, { x: rightColX, y: currentY - 28, size: 9, font: fontRegular, color: charcoalColor });
    page.drawText(`Payment Gateway: ${data.paymentMethod || "Razorpay Secure Payments"}`, { x: rightColX, y: currentY - 41, size: 9, font: fontRegular, color: charcoalColor });
    if (data.transactionId) {
        page.drawText(`Transaction Ref: ${data.transactionId}`, { x: rightColX, y: currentY - 54, size: 8.5, font: fontRegular, color: lightGray });
    }

    // 5. Line Item Table
    currentY -= 80;
    const tableTop = currentY;
    const tableBottom = currentY - 120;

    // Header Row Background
    page.drawRectangle({
        x: 40,
        y: tableTop - 22,
        width: width - 80,
        height: 22,
        color: rgb(0.96, 0.97, 0.98),
    });

    page.drawText("ITEM DESCRIPTION", { x: 50, y: tableTop - 15, size: 9, font: fontBold, color: primaryColor });
    page.drawText("PAPER ID", { x: 370, y: tableTop - 15, size: 9, font: fontBold, color: primaryColor });
    page.drawText("AMOUNT", { x: 470, y: tableTop - 15, size: 9, font: fontBold, color: primaryColor });

    page.drawLine({
        start: { x: 40, y: tableTop - 22 },
        end: { x: width - 40, y: tableTop - 22 },
        thickness: 1,
        color: borderGray,
    });

    // Row 1 Content
    currentY = tableTop - 42;
    page.drawText("Article Processing Charge (APC)", { x: 50, y: currentY, size: 10, font: fontBold, color: charcoalColor });

    currentY -= 14;
    page.drawText("Open Access Scholarly Publication & Peer-Review Archival", { x: 50, y: currentY, size: 8.5, font: fontRegular, color: lightGray });

    currentY -= 14;
    const titleLines = wrapText(`Title: "${data.paperTitle}"`, fontOblique, 8.5, 300);
    for (const line of titleLines.slice(0, 2)) {
        page.drawText(line, { x: 50, y: currentY, size: 8.5, font: fontOblique, color: charcoalColor });
        currentY -= 12;
    }

    // Paper ID Column
    page.drawText(data.paperId, { x: 370, y: tableTop - 42, size: 9.5, font: fontBold, color: primaryColor });

    // Amount Column
    const amountStr = `${data.currency} ${Number(data.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    page.drawText(amountStr, { x: 470, y: tableTop - 42, size: 10.5, font: fontBold, color: charcoalColor });

    page.drawLine({
        start: { x: 40, y: tableBottom },
        end: { x: width - 40, y: tableBottom },
        thickness: 1,
        color: borderGray,
    });

    // 6. Summary Totals Table
    currentY = tableBottom - 25;
    const summaryRightX = width - 50;

    page.drawText("Subtotal:", { x: 370, y: currentY, size: 9.5, font: fontRegular, color: charcoalColor });
    const subtotalStr = amountStr;
    page.drawText(subtotalStr, { x: summaryRightX - fontRegular.widthOfTextAtSize(subtotalStr, 9.5), y: currentY, size: 9.5, font: fontRegular, color: charcoalColor });

    currentY -= 18;
    page.drawText("Taxes (0% Scholarly OA):", { x: 370, y: currentY, size: 9, font: fontRegular, color: lightGray });
    const taxStr = `${data.currency} 0.00`;
    page.drawText(taxStr, { x: summaryRightX - fontRegular.widthOfTextAtSize(taxStr, 9), y: currentY, size: 9, font: fontRegular, color: lightGray });

    currentY -= 20;
    page.drawRectangle({
        x: 360,
        y: currentY - 8,
        width: width - 400,
        height: 28,
        color: primaryColor,
    });

    page.drawText("TOTAL PAID:", { x: 370, y: currentY, size: 10.5, font: fontBold, color: rgb(1, 1, 1) });
    const totalStr = amountStr;
    page.drawText(totalStr, { x: summaryRightX - fontBold.widthOfTextAtSize(totalStr, 11), y: currentY, size: 11, font: fontBold, color: rgb(1, 1, 1) });

    // 7. Official Seal & Signatory Block
    currentY -= 90;

    page.drawText("Authorized Signatory", { x: 40, y: currentY, size: 10, font: fontBold, color: charcoalColor });
    page.drawText("Felix Academic Publications Accounts & Editorial Office", { x: 40, y: currentY - 14, size: 8.5, font: fontRegular, color: lightGray });
    page.drawText("Electronically Authenticated Document", { x: 40, y: currentY - 26, size: 8, font: fontOblique, color: greenColor });

    // 8. Footer Note
    currentY = 45;
    page.drawLine({
        start: { x: 40, y: currentY + 15 },
        end: { x: width - 40, y: currentY + 15 },
        thickness: 0.8,
        color: borderGray,
    });

    page.drawText("This is an official computer-generated receipt issued for scholarly Article Processing Charges (APC).", {
        x: 40,
        y: currentY,
        size: 8,
        font: fontRegular,
        color: lightGray,
    });
    page.drawText(`Support & Verification: support@ijitest.org  |  Permanent Verification: https://ijitest.org/track`, {
        x: 40,
        y: currentY - 12,
        size: 7.5,
        font: fontRegular,
        color: lightGray,
    });

    return await doc.save();
}
