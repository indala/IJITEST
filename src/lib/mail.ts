import 'server-only'
import nodemailer from 'nodemailer';

const allowInsecureTls = process.env["SMTP_ALLOW_INSECURE_TLS"] === 'true';

const transporter = nodemailer.createTransport({
    host: process.env["SMTP_HOST"],
    port: parseInt(process.env["SMTP_PORT"] || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env["SMTP_USER"],
        pass: process.env["SMTP_PASS"],
    },
    tls: {
        // Keep certificate validation enabled by default.
        // Set SMTP_ALLOW_INSECURE_TLS=true only for controlled local troubleshooting.
        rejectUnauthorized: !allowInsecureTls
    }
});

interface SendEmailProps {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
        filename: string;
        path?: string;
        content?: string | Buffer;
        contentType?: string;
    }>;
}

export async function sendEmail({ to, subject, text, html, attachments }: SendEmailProps) {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env["EMAIL_FROM_NAME"] || 'IJITEST Editor'}" <${process.env["EMAIL_FROM"]}>`,
            to,
            subject,
            text,
            html,
            attachments,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("--- SMTP Error Diagnosis ---");
        const err = error as Error & { code?: string, response?: unknown };
        console.error("Error Code:", err?.code);
        console.error("SMTP Response:", err?.response);
        console.error("---------------------------");
        return { success: false, error: "Failed to send email. Please try again later." };
    }
}

/**
 * Send an email with automatic retry (up to 3 attempts, exponential backoff).
 * Logs failures but never throws - safe for fire-and-forget usage.
 */
export async function sendEmailWithRetry(props: SendEmailProps, context?: string): Promise<void> {
    const label = context ? "[" + context + "]" : "";
    for (let attempt = 1; attempt <= 3; attempt++) {
        const result = await sendEmail(props);
        if (result.success) return;
        if (attempt < 3) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
            console.warn("[Email Retry " + label + "] attempt " + attempt + "/3 failed, retrying in " + delay + "ms");
            await new Promise(r => setTimeout(r, delay));
        } else {
            console.error("[Email permanently failed " + label + "]", result.error);
        }
    }
}

import {
    JOURNAL_EMAIL_CONFIG,
    mailLayout,
    formatEmailBodyToHtml,
    renderBrandedEmail,
    emailManuscriptCard,
} from './email-layout';

export {
    JOURNAL_EMAIL_CONFIG,
    mailLayout,
    formatEmailBodyToHtml,
    renderBrandedEmail,
    emailManuscriptCard,
};

import { getCompiledEmailTemplate } from './email-templates-core';

// Helper templates (Database-driven via email-templates-core)
export const emailTemplates = {
    submissionReceived: async (authorName: string, paperTitle: string, paperId: string, setupUrl?: string) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        return getCompiledEmailTemplate("SUBMISSION_ACK", {
            authorName,
            paperTitle,
            paperId,
            trackUrl: setupUrl || `${baseUrl}/track`,
        }, setupUrl ? { text: 'Activate Author Account', url: setupUrl } : { text: 'Track Manuscript Status', url: `${baseUrl}/track` });
    },

    statusUpdate: async (authorName: string, paperTitle: string, status: string, paperId: string, isFree: boolean = false) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const isAccepted = status === 'accepted';
        const key = isAccepted ? "DECISION_ACCEPT" : status === 'rejected' ? "DECISION_REJECT" : "SUBMISSION_ACK";
        return getCompiledEmailTemplate(key, {
            authorName,
            paperTitle,
            paperId,
            actionUrl: isAccepted && !isFree ? `${baseUrl}/payment/${paperId}` : `${baseUrl}/author`,
            editorialFeedback: `Status updated to ${status.toUpperCase()}.`,
        }, {
            text: isAccepted && !isFree ? 'Finalize & Publish' : 'Access Author Dashboard',
            url: isAccepted && !isFree ? `${baseUrl}/payment/${paperId}` : `${baseUrl}/author`
        });
    },

    reviewAssignment: async (reviewerName: string, paperTitle: string, deadline: string, paperId: string, setupUrl?: string) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const formattedDeadline = new Date(deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        return getCompiledEmailTemplate("REVIEW_INVITATION", {
            reviewerName,
            paperTitle,
            paperId,
            reviewDeadline: formattedDeadline,
            portalUrl: setupUrl || `${baseUrl}/reviewer`,
        }, setupUrl ? { text: 'Activate Reviewer Account', url: setupUrl } : { text: 'Access Reviewer Dashboard', url: `${baseUrl}/reviewer` });
    },

    manuscriptAcceptance: async (authorName: string, paperTitle: string, paperId: string, isFree: boolean = false) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        return getCompiledEmailTemplate("DECISION_ACCEPT", {
            authorName,
            paperTitle,
            paperId,
            actionUrl: !isFree ? `${baseUrl}/payment/${paperId}` : `${baseUrl}/author`,
        }, {
            text: !isFree ? 'Complete Publication & Payment' : 'Access Author Dashboard',
            url: !isFree ? `${baseUrl}/payment/${paperId}` : `${baseUrl}/author`
        });
    },

    manuscriptRejection: async (authorName: string, paperTitle: string, paperId: string, feedback: string) => {
        return getCompiledEmailTemplate("DECISION_REJECT", {
            authorName,
            paperTitle,
            paperId,
            editorialFeedback: feedback || 'The submission did not sufficiently fulfill the technical requirements in its current form.',
        });
    },

    reviewCompleted: async (editorName: string, reviewerName: string, paperTitle: string, paperId: string, recommendation: string, subId?: number | string) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const evalUrl = subId ? `${baseUrl}/admin/submissions/${subId}` : `${baseUrl}/admin/submissions`;
        return getCompiledEmailTemplate("REVIEW_COMPLETED", {
            editorName: editorName || 'Editor',
            reviewerName,
            paperTitle,
            paperId,
            recommendation,
            evaluationUrl: evalUrl,
        }, {
            text: 'Evaluate Review Report & Scores',
            url: evalUrl
        });
    },

    paymentVerified: async (authorName: string, paperTitle: string, paperId: string) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        return getCompiledEmailTemplate("PAYMENT_VERIFIED", {
            authorName,
            paperTitle,
            paperId,
        }, {
            text: 'View Author Dashboard',
            url: `${baseUrl}/author`
        });
    },

    manuscriptPublished: async (authorName: string, paperTitle: string, paperId: string, volume: number, issue: number, year: number) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const articleUrl = `${baseUrl}/archives/volume${volume}/issue${issue}/${paperId}`;
        const certificateUrl = `${baseUrl}/api/certificate/${paperId}`;
        return getCompiledEmailTemplate("PAPER_PUBLISHED", {
            authorName,
            paperTitle,
            paperId,
            volumeNumber: volume,
            issueNumber: issue,
            year,
            articleUrl,
            certificateUrl,
        }, {
            text: 'View Official Publication',
            url: articleUrl
        });
    },

    resubmissionRequest: async (authorName: string, paperTitle: string, paperId: string, comments?: string, subId?: number) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const resubmitLink = subId ? `${baseUrl}/author/submissions/${subId}/resubmit` : `${baseUrl}/author/submissions`;
        return getCompiledEmailTemplate("REVISION_REQUEST", {
            authorName,
            paperTitle,
            paperId,
            comments: comments || 'Please address the detailed reviewer comments available in the portal.',
            resubmitUrl: resubmitLink,
        }, {
            text: 'Submit Revised Manuscript',
            url: resubmitLink
        });
    },

    resubmissionReceived: async (authorName: string, paperTitle: string, paperId: string, subId: number, role: 'admin' | 'editor' = 'admin') => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const dashboardLink = role === 'admin' ? `${baseUrl}/admin/submissions/${subId}` : `${baseUrl}/editor/submissions/${subId}`;
        return getCompiledEmailTemplate("REVISION_RECEIVED", {
            authorName,
            paperTitle,
            paperId,
            dashboardUrl: dashboardLink,
        }, {
            text: 'Review Revised Submission',
            url: dashboardLink
        });
    },

    boardInvitation: async (name: string, role: string, setupUrl: string) => {
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
        return getCompiledEmailTemplate("BOARD_INVITATION", {
            name,
            role: formattedRole,
            setupUrl,
        }, {
            text: 'Secure My Account & Set Password',
            url: setupUrl
        });
    },

    boardRejection: async (name: string, role: string, reason: string) => {
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
        return getCompiledEmailTemplate("BOARD_REJECTION", {
            name,
            role: formattedRole,
            reason,
        });
    },

    boardApplicationReceipt: async (name: string, role: string) => {
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
        return getCompiledEmailTemplate("BOARD_APP_RECEIPT", {
            name,
            role: formattedRole,
        });
    },

    passwordReset: async (name: string, resetUrl: string) => {
        return getCompiledEmailTemplate("PASSWORD_RESET", {
            name,
            resetUrl,
        }, {
            text: 'Create New Password',
            url: resetUrl
        });
    },

    contactReply: async (name: string, originalSubject: string, replyContent: string, originalMessage: string, date?: string) => {
        return getCompiledEmailTemplate("CONTACT_REPLY", {
            name,
            originalSubject: originalSubject || 'Your Inquiry',
            replyContent,
            originalMessage,
            date: date || new Date().toLocaleDateString(),
        });
    },

    contactReceipt: async (name: string, subject: string) => {
        return getCompiledEmailTemplate("CONTACT_RECEIPT", {
            name,
            subject: subject || 'General Inquiry',
        });
    },

    coAuthorNotification: async (name: string, paperTitle: string, correspondingAuthor: string, paperId: string) => {
        return getCompiledEmailTemplate("CO_AUTHOR_NOTIFICATION", {
            name,
            paperTitle,
            correspondingAuthor,
            paperId,
        });
    },

    staffNotification: async (staffName: string, title: string, details: string, actionUrl: string) => {
        return getCompiledEmailTemplate("STAFF_NOTIFICATION", {
            staffName,
            title,
            details,
            actionUrl,
        }, {
            text: 'View Submission & Details',
            url: actionUrl
        });
    },

    adminNotification: async (title: string, details: string, actionUrl?: string) => {
        return getCompiledEmailTemplate("ADMIN_NOTIFICATION", {
            title,
            details,
            actionUrl: actionUrl || '',
        }, actionUrl ? {
            text: 'Review in Admin Panel',
            url: actionUrl
        } : undefined);
    },

    copyrightSubmitted: async (authorName: string, paperTitle: string, paperId: string, subId: number) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const subUrl = `${baseUrl}/admin/submissions/${subId}`;
        return getCompiledEmailTemplate("COPYRIGHT_SUBMITTED", {
            authorName,
            paperTitle,
            paperId,
            submissionUrl: subUrl,
        }, {
            text: 'Review Submission Details',
            url: subUrl
        });
    },

    reviewDeadlineReminder: async (reviewerName: string, paperTitle: string, paperId: string, daysRemaining: number, deadline: string | Date) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const formattedDeadline = new Date(deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        let timeText = `is due in ${daysRemaining} days`;
        if (daysRemaining === 0) timeText = "is due TODAY";
        else if (daysRemaining < 0) timeText = `is OVERDUE by ${Math.abs(daysRemaining)} days`;

        return getCompiledEmailTemplate("REVIEW_DEADLINE_REMINDER", {
            reviewerName,
            paperTitle,
            paperId,
            deadline: formattedDeadline,
            timeText,
            portalUrl: `${baseUrl}/reviewer`,
        }, {
            text: 'Access Reviewer Dashboard',
            url: `${baseUrl}/reviewer`
        });
    },

    reviewOverdueEscalation: async (editorName: string, reviewerName: string, paperTitle: string, paperId: string, daysOverdue: number, deadline: string | Date) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const formattedDeadline = new Date(deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        const dashUrl = `${baseUrl}/admin/submissions/${paperId}`;
        return getCompiledEmailTemplate("REVIEW_OVERDUE_ESCALATION", {
            editorName,
            reviewerName,
            paperTitle,
            paperId,
            daysOverdue,
            deadline: formattedDeadline,
            dashboardUrl: dashUrl,
        }, {
            text: 'Manage Submission in Admin Panel',
            url: dashUrl
        });
    },

    newSubmissionEditorAlert: async (editorName: string, paperTitle: string, paperId: string, authorName: string, submissionDate: string, dashboardUrl: string) => {
        return getCompiledEmailTemplate("NEW_SUBMISSION_EDITOR_ALERT", {
            editorName: editorName || 'Editor',
            paperTitle,
            paperId,
            authorName,
            submissionDate,
            dashboardUrl,
        }, {
            text: 'Access Submission Workspace',
            url: dashboardUrl
        });
    },

    boardApplicationAlert: async (applicantName: string, applicantEmail: string, role: string, adminUrl: string) => {
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
        return getCompiledEmailTemplate("BOARD_APPLICATION_ALERT", {
            applicantName,
            applicantEmail,
            role: formattedRole,
            adminUrl,
        }, {
            text: 'Review Candidate Dossier',
            url: adminUrl
        });
    },

    contactInquiryAlert: async (visitorName: string, visitorEmail: string, subject: string, message: string, inquiryUrl: string) => {
        return getCompiledEmailTemplate("CONTACT_INQUIRY_ALERT", {
            visitorName,
            visitorEmail,
            subject: subject || 'General Inquiry',
            message,
            inquiryUrl,
        }, {
            text: 'Reply via Admin Portal',
            url: inquiryUrl
        });
    },

    paymentReceivedAlert: async (paperTitle: string, paperId: string, authorName: string, amount: string | number, currency: string, transactionId: string, subId: number) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const dashUrl = `${baseUrl}/admin/submissions/${subId}`;
        return getCompiledEmailTemplate("PAYMENT_RECEIVED_ALERT", {
            paperTitle,
            paperId,
            authorName,
            amount: String(amount),
            currency,
            transactionId,
            dashboardUrl: dashUrl,
        }, {
            text: 'Schedule for Issue & Typesetting',
            url: dashUrl
        });
    },

    galleyProofRequest: async (authorName: string, paperTitle: string, paperId: string, proofUrl: string) => {
        return getCompiledEmailTemplate("GALLEY_PROOF_REQUEST", {
            authorName,
            paperTitle,
            paperId,
            proofUrl,
        }, {
            text: 'Inspect Galley Proof (PDF)',
            url: proofUrl
        });
    },

    galleyProofResponseAlert: async (authorName: string, paperTitle: string, paperId: string, approved: boolean, correctionNotes: string = '', subId: number) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://ijitest.org';
        const dashUrl = `${baseUrl}/admin/submissions/${subId}`;
        const statusText = approved ? 'APPROVED' : 'CORRECTIONS REQUESTED';
        return getCompiledEmailTemplate("GALLEY_PROOF_RESPONSE_ALERT", {
            authorName,
            paperTitle,
            paperId,
            statusText,
            correctionNotes: correctionNotes || (approved ? 'Author approved typeset proof without changes.' : 'No notes provided.'),
            dashboardUrl: dashUrl,
        }, {
            text: 'Inspect Submission in Editorial Desk',
            url: dashUrl
        });
    }
};
