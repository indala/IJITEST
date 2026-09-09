/**
 * Scholarly Email Design System & Layout Engine
 * 
 * Provides bulletproof, responsive, inline-styled HTML templates compatible with:
 * - Gmail (Web, iOS, Android)
 * - Apple Mail (iOS, macOS)
 * - Microsoft Outlook (Desktop, Web, Office 365)
 * - Dark Mode support across modern mobile mail clients.
 */

export interface JournalEmailConfig {
    name: string;
    shortName: string;
    supportEmail: string;
    address: string;
    publisher: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
}

export const JOURNAL_EMAIL_CONFIG: JournalEmailConfig = {
    name: 'International Journal of Innovative Trends in Engineering Science and Technology',
    shortName: 'IJITEST',
    supportEmail: process.env["SUPPORT_EMAIL"] || 'support@ijitest.org',
    address: 'Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India',
    publisher: 'Felix Academic Publications',
    logo: '/logo.png',
    primaryColor: '#6d0202',
    secondaryColor: '#0f172a',
    accentColor: '#f8fafc',
};

export interface MailLayoutOptions {
    title?: string | undefined;
    previewText?: string | undefined;
}

/**
 * Common layout wrapper for all automated & custom editorial emails.
 * Uses inline styles, table-safe containers, and dark-mode friendly CSS variables.
 */
export function mailLayout(
    content: string, 
    cta?: { text: string; url: string }, 
    options?: MailLayoutOptions
): string {
    const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
    const logoUrl = `${baseUrl}${JOURNAL_EMAIL_CONFIG.logo}`;
    const pageTitle = options?.title || `${JOURNAL_EMAIL_CONFIG.shortName} Editorial Notification`;
    const previewText = options?.previewText || '';

    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>${pageTitle}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
        @media only screen and (max-width: 620px) {
            .email-outer-padding { padding: 16px 8px !important; }
            .email-card { border-radius: 12px !important; width: 100% !important; }
            .email-header { padding: 24px 20px !important; }
            .email-body { padding: 28px 20px !important; font-size: 14px !important; }
            .email-footer { padding: 24px 20px !important; }
            .email-cta-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; }
        }
        @media (prefers-color-scheme: dark) {
            .email-body-bg { background-color: #0b0f19 !important; }
            .email-card { background-color: #111827 !important; border-color: #1f2937 !important; }
            .email-header { background-color: #111827 !important; border-bottom-color: #1f2937 !important; }
            .email-content { color: #e2e8f0 !important; }
            .email-footer { background-color: #0f172a !important; border-top-color: #1f2937 !important; }
            .email-card-box { background-color: #1f2937 !important; border-color: #374151 !important; color: #e2e8f0 !important; }
            .email-card-title { color: #f8fafc !important; }
            .email-meta-text { color: #94a3b8 !important; }
            .email-blockquote { background-color: #1f2937 !important; border-left-color: #881337 !important; color: #cbd5e1 !important; }
        }
    </style>
</head>
<body class="email-body-bg" style="margin: 0; padding: 0; width: 100%; background-color: #f1f5f9; -webkit-font-smoothing: antialiased; word-spacing: normal;">
    ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${previewText} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ''}
    <div class="email-outer-padding" style="background-color: #f1f5f9; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center">
                    <!-- 🏛️ Main Card Container -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; text-align: left;">
                        <tr>
                            <td>
                                <div class="email-card" style="background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                                    
                                    <!-- Header Banner -->
                                    <div class="email-header" style="background-color: #ffffff; padding: 35px 40px 25px 40px; text-align: center; border-bottom: 2px solid #f8fafc;">
                                        <a href="${baseUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                                            <img src="${logoUrl}" alt="${JOURNAL_EMAIL_CONFIG.shortName} Logo" style="height: 60px; max-width: 180px; margin-bottom: 12px; display: inline-block; border: 0;" />
                                        </a>
                                        <h1 style="color: ${JOURNAL_EMAIL_CONFIG.primaryColor}; margin: 0; font-size: 21px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">${JOURNAL_EMAIL_CONFIG.shortName}</h1>
                                        <p style="color: #64748b; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Editorial Management System</p>
                                    </div>

                                    <!-- Body Content -->
                                    <div class="email-body email-content" style="padding: 40px 40px; background-color: #ffffff; color: #334155; line-height: 1.75; font-size: 15px;">
                                        ${content}

                                        ${cta ? `
                                            <div style="text-align: center; margin-top: 36px; margin-bottom: 12px;">
                                                <a href="${cta.url}" target="_blank" class="email-cta-btn" style="background-color: ${JOURNAL_EMAIL_CONFIG.primaryColor}; color: #ffffff; padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(109, 2, 2, 0.3);">
                                                    ${cta.text} &rarr;
                                                </a>
                                            </div>
                                        ` : ''}
                                    </div>

                                    <!-- Academic Footer -->
                                    <div class="email-footer" style="padding: 32px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                                        <p class="email-card-title" style="margin: 0; font-size: 13px; font-weight: 700; color: ${JOURNAL_EMAIL_CONFIG.secondaryColor};">${JOURNAL_EMAIL_CONFIG.name}</p>
                                        <p class="email-meta-text" style="margin: 4px 0; font-size: 12px; color: #64748b;">Published by <strong>${JOURNAL_EMAIL_CONFIG.publisher}</strong></p>
                                        
                                        <div class="email-meta-text" style="margin: 18px 0; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                                            <p style="margin: 0;">${JOURNAL_EMAIL_CONFIG.address}</p>
                                            <p style="margin: 4px 0;">
                                                <a href="mailto:${JOURNAL_EMAIL_CONFIG.supportEmail}" style="color: ${JOURNAL_EMAIL_CONFIG.primaryColor}; text-decoration: none; font-weight: 600;">Contact Editorial Office</a> 
                                                &nbsp;&bull;&nbsp; 
                                                <a href="${baseUrl}" style="color: ${JOURNAL_EMAIL_CONFIG.primaryColor}; text-decoration: none; font-weight: 600;">Journal Home</a>
                                            </p>
                                        </div>

                                        <div style="margin-top: 20px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8;">
                                            <p style="margin: 0;">This is an automated scholarly notification. Direct replies to this mailbox are not monitored.</p>
                                            <p style="margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} ${JOURNAL_EMAIL_CONFIG.publisher}. All rights reserved.</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Trust & Indexing Badge -->
                                <div style="text-align: center; margin-top: 22px;">
                                    <span style="font-size: 10px; color: #64748b; border: 1px solid #cbd5e1; padding: 5px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                        Peer Reviewed &bull; Open Access &bull; CrossRef DOI Indexed
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;
}

/**
 * Converts plain text / markdown editorial body into formatted, email-safe HTML paragraphs,
 * detecting blockquotes, links, and bold text.
 */
export function formatEmailBodyToHtml(rawText: string): string {
    if (!rawText) return "";

    // Normalize Windows/Mac line endings
    const normalized = rawText.replace(/\r\n/g, "\n").trim();
    const blocks = normalized.split(/\n\s*\n/);

    return blocks.map(block => {
        const trimmed = block.trim();
        if (!trimmed) return "";

        // Check if block is a blockquote (> text)
        if (trimmed.startsWith(">")) {
            const quoteContent = trimmed
                .split("\n")
                .map(line => line.replace(/^>\s?/, ""))
                .join("<br/>");

            return `<div class="email-blockquote" style="background-color: #fdf2f2; border-left: 4px solid #6d0202; padding: 16px 20px; border-radius: 0 10px 10px 0; margin: 20px 0; font-style: italic; color: #374151; font-size: 14px; line-height: 1.65;">${quoteContent}</div>`;
        }

        // Format inline elements: **bold** and http(s):// links
        let formatted = trimmed
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" style="color: #6d0202; text-decoration: underline; font-weight: 600; word-break: break-all;">$1</a>')
            .replace(/\n/g, '<br/>');

        return `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.75; color: #334155;">${formatted}</p>`;
    }).join("");
}

/**
 * Reusable manuscript info card component for emails
 */
export function emailManuscriptCard(props: {
    paperId: string;
    title: string;
    statusBadge?: string;
}): string {
    return `<div class="email-card-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px 24px; margin: 24px 0; border-left: 5px solid #6d0202; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #6d0202; text-transform: uppercase; letter-spacing: 1px;">
                Manuscript ${props.paperId}
            </span>
            ${props.statusBadge ? `
                <span style="background: #f1f5f9; color: #475569; padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
                    ${props.statusBadge}
                </span>
            ` : ''}
        </div>
        <h3 class="email-card-title" style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 700; line-height: 1.45;">
            ${props.title}
        </h3>
    </div>`;
}

/**
 * Renders a full branded email from raw plain text or template body
 */
export function renderBrandedEmail(
    bodyText: string,
    options?: {
        cta?: { text: string; url: string } | undefined;
        title?: string | undefined;
        previewText?: string | undefined;
    }
): string {
    const htmlContent = formatEmailBodyToHtml(bodyText);
    const layoutOptions: MailLayoutOptions = {};
    if (options?.title !== undefined) layoutOptions.title = options.title;
    if (options?.previewText !== undefined) layoutOptions.previewText = options.previewText;
    return mailLayout(htmlContent, options?.cta, layoutOptions);
}
