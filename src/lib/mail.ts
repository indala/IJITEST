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
        path: string;
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
        console.error("Host:", process.env["SMTP_HOST"]);
        console.error("User:", process.env["SMTP_USER"]);
        const err = error as Error & { code?: string, response?: unknown };
        console.error("Error Code:", err?.code);
        console.error("SMTP Response:", err?.response);
        console.error("---------------------------");
        return { success: false, error: err instanceof Error ? err.message : String(error) };
    }
}

// --- 📋 JOURNAL GLOBAL SETTINGS (Extracted from u116573049_ijitest_db.sql) ---
const JOURNAL = {
    name: 'International Journal of Innovative Trends in Engineering Science and Technology',
    shortName: 'IJITEST',
    supportEmail: process.env["SUPPORT_EMAIL"] || process.env["SMTP_USER"] || 'support@ijitest.org',
    address: 'Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India',
    publisher: 'Felix Academic Publications',
    logo: '/logo.png', // Reaches public folder
    primaryColor: '#6d0202',
    secondaryColor: '#1a1a1a',
    accentColor: '#f8fafc'
};

/**
 * Common layout wrapper for all Automated Emails
 * Ensures consistent branding, typography, and professional aesthetics.
 */
const mailLayout = (content: string, cta?: { text: string, url: string }) => {
    const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://www.ijitest.org';
    const logoUrl = `${baseUrl}${JOURNAL.logo}`;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${JOURNAL.shortName} Notification</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
            <div style="background-color: #f1f5f9; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    
                    <!-- 🏛️ Header -->
                    <div style="background-color: white; padding: 35px 40px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                        <a href="${baseUrl}" target="_blank">
                            <img src="${logoUrl}" alt="${JOURNAL.shortName}" style="height: 65px; margin-bottom: 15px; display: inline-block;" />
                        </a>
                        <h1 style="color: ${JOURNAL.primaryColor}; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">${JOURNAL.shortName}</h1>
                        <p style="color: #64748b; font-size: 11px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Editorial Management System</p>
                    </div>

                    <!-- 📄 Body -->
                    <div style="padding: 45px 40px; background-color: white; color: #334155; line-height: 1.7; font-size: 15px;">
                        ${content}

                        ${cta ? `
                            <div style="text-align: center; margin-top: 40px; margin-bottom: 10px;">
                                <a href="${cta.url}" style="background-color: ${JOURNAL.primaryColor}; color: white; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 12px ${JOURNAL.primaryColor}40;">
                                    ${cta.text}
                                </a>
                            </div>
                        ` : ''}
                    </div>

                    <!-- 📍 Footer -->
                    <div style="padding: 35px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                        <img src="${logoUrl}" alt="Journal Logo" style="height: 30px; opacity: 0.5; margin-bottom: 15px;" />
                        <p style="margin: 0; font-size: 13px; font-weight: bold; color: ${JOURNAL.secondaryColor};">${JOURNAL.name}</p>
                        <p style="margin: 5px 0; font-size: 12px; color: #64748b;">Published by <strong>${JOURNAL.publisher}</strong></p>
                        
                        <div style="margin: 20px 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                            <p style="margin: 0;">${JOURNAL.address}</p>
                            <p style="margin: 5px 0;">
                                <a href="mailto:${JOURNAL.supportEmail}" style="color: ${JOURNAL.primaryColor}; text-decoration: none; font-weight: 600;">Contact Support</a> 
                                &nbsp;•&nbsp; 
                                <a href="${baseUrl}" style="color: ${JOURNAL.primaryColor}; text-decoration: none; font-weight: 600;">Journal Website</a>
                            </p>
                        </div>

                        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #cbd5e1;">
                            <p style="margin: 0;">This is an automated editorial notification. Please do not reply directly.</p>
                            <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} ${JOURNAL.publisher}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
                
                <!-- 🛡️ Professional Research Badge -->
                <div style="text-align: center; margin-top: 25px; opacity: 0.6;">
                    <span style="font-size: 10px; color: #64748b; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">Verified Academic Publication</span>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Helper templates
export const emailTemplates = {
    submissionReceived: (authorName: string, paperTitle: string, paperId: string, setupUrl?: string) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://www.ijitest.org';
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>Thank you for choosing <strong>${JOURNAL.shortName}</strong>. We have successfully received your manuscript and it has entered our professional screening queue.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px; margin: 30px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="display: inline-block; background: ${JOURNAL.primaryColor}10; color: ${JOURNAL.primaryColor}; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                    Manuscript Received
                </div>
                <h3 style="margin: 0; color: ${JOURNAL.secondaryColor}; font-size: 18px; line-height: 1.4;">${paperTitle}</h3>
                <p style="margin: 15px 0 0 0; font-size: 13px; color: #64748b; font-weight: 600;">Paper ID: ${paperId}</p>
            </div>
            
            <p>Our editorial team will evaluate your submission against our technical criteria. You can monitor the progress through the Author Portal.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] Acknowledgment of Submission: ${paperId}`,
            html: mailLayout(content, setupUrl ? {
                text: 'Activate Author Account',
                url: setupUrl
            } : {
                text: 'Track Manuscript Status',
                url: `${baseUrl}/track`
            })
        };
    },

    statusUpdate: (authorName: string, paperTitle: string, status: string, paperId: string, isFree: boolean = false) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://www.ijitest.org';
        const isAccepted = status === 'accepted';
        const statusColor = isAccepted ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#2563eb';

        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>A professional decision has been reached regarding the evaluation of your manuscript.</p>
            
            <div style="text-align: center; background: #ffffff; border: 1px solid #e2e8f0; padding: 40px 30px; border-radius: 20px; margin: 30px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <p style="margin: 0; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Current Decision Stage</p>
                <h2 style="color: ${statusColor}; font-size: 32px; margin: 15px 0; text-transform: uppercase; font-weight: 900;">${status.replace('_', ' ')}</h2>
                <div style="margin: 20px auto; width: 40px; height: 2px; background-color: #f1f5f9;"></div>
                <p style="margin: 0; font-size: 14px; color: #475569; font-style: italic;">"${paperTitle}"</p>
            </div>

            ${isAccepted ? `
                <p style="color: #166534; font-weight: bold; margin-top: 25px;">Congratulations on the successful acceptance of your paper.</p>
                <p>${isFree ? 'Your manuscript will now proceed to the production queue.' : 'To finalize inclusion in the upcoming issue, please complete the Article Processing Charge (APC) via the link below.'}</p>
            ` : ''}
        `;

        return {
            subject: `[${JOURNAL.shortName}] Status Update: ${paperId} [${status.toUpperCase()}]`,
            html: mailLayout(content, {
                text: isAccepted && !isFree ? 'Finalize & Publish' : 'Access Author Dashboard',
                url: isAccepted && !isFree ? `${baseUrl}/payment/${paperId}` : `${baseUrl}/author`
            })
        };
    },

    reviewAssignment: (reviewerName: string, paperTitle: string, deadline: string, paperId: string, setupUrl?: string) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://www.ijitest.org';
        const formattedDeadline = new Date(deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${reviewerName}</strong>,</p>
            <p>Based on your distinguished research record and expertise, the Editorial Board of <strong>${JOURNAL.shortName}</strong> cordially invites you to serve as a Peer Reviewer for a new manuscript submission.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 35px; border-radius: 20px; margin: 30px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="display: inline-block; background: ${JOURNAL.primaryColor}10; color: ${JOURNAL.primaryColor}; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                    Scholarly Contribution Invitation
                </div>
                <h3 style="margin: 0; color: ${JOURNAL.secondaryColor}; font-size: 18px; line-height: 1.4;">${paperTitle}</h3>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Manuscript ID</p>
                    <p style="margin: 5px 0 0 0; font-weight: bold; color: ${JOURNAL.primaryColor};">${paperId}</p>
                </div>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; color: #475569;">
                    <strong>Review Timeline:</strong> We kindly request your technical evaluation by <span style="color: ${JOURNAL.primaryColor}; font-weight: bold;">${formattedDeadline}</span>.
                </p>
            </div>

            <p style="font-size: 14px; line-height: 1.7; color: #475569;">
                Your rigorous evaluation is vital to maintaining the academic integrity and high standards of <em>${JOURNAL.name}</em>. 
                ${setupUrl
                ? 'As this is your first appointment, please activate your professional reviewer account using the secure link below to access the manuscript.'
                : 'The full manuscript and review criteria are now available in your reviewer dashboard.'
            }
            </p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] Invitation to Review: ${paperId}`,
            html: mailLayout(content, setupUrl ? {
                text: 'Activate Reviewer Account',
                url: setupUrl
            } : {
                text: 'Access Reviewer Dashboard',
                url: `${baseUrl}/reviewer`
            })
        };
    },

    manuscriptAcceptance: (authorName: string, paperTitle: string, paperId: string, isFree: boolean = false) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://www.ijitest.org';
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>I am pleased to inform you that your manuscript has been <strong>ACCEPTED</strong> for publication in the <em>${JOURNAL.name}</em>.</p>

            <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 40px 30px; border-radius: 20px; text-align: center; margin: 30px 0; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.05);">
                <div style="width: 60px; height: 60px; background: #16a34a; border-radius: 50%; margin: 0 auto 20px auto; line-height: 60px; color: white; font-size: 30px;">✓</div>
                <h3 style="margin-top: 0; font-weight: 900; color: #166534; font-size: 24px; text-transform: uppercase;">Accepted</h3>
                <p style="color: #166534; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 15px 0 5px 0;">Manuscript ID: ${paperId}</p>
                <p style="color: #475569; font-size: 14px; font-style: italic;">"${paperTitle}"</p>
            </div>

            <p>The editorial board found your research to be significant and well-aligned with our technical scopes. ${isFree ? 'Our production team will now begin the final formatting.' : 'To proceed with publication, please finalize the Article Processing Charge (APC) via the portal below.'}</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] MANUSCRIPT ACCEPTANCE: ${paperId}`,
            html: mailLayout(content, {
                text: !isFree ? 'Complete Publication & Payment' : 'Access Author Dashboard',
                url: !isFree ? `${baseUrl}/payment/${paperId}` : `${baseUrl}/author`
            })
        };
    },

    manuscriptRejection: (authorName: string, _paperTitle: string, paperId: string, feedback: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>Thank you for giving us the opportunity to evaluate your manuscript <strong>(ID: ${paperId})</strong>.</p>
            <p>After a rigorous evaluation by our reviewers and the editorial board, we regret to inform you that we are unable to accept your manuscript for publication at this time.</p>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px; margin: 30px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <p style="margin: 0; font-weight: bold; font-size: 10px; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">Editorial Feedback & Review Summary</p>
                <div style="margin-top: 15px; color: #475569; font-size: 14px; white-space: pre-wrap; line-height: 1.8; border-left: 3px solid #f1f5f9; padding-left: 20px;">${feedback || 'The submission did not sufficiently fulfill the technical requirements of the journal in its current form.'}</div>
            </div>

            <p>We appreciate your interest in <strong>${JOURNAL.shortName}</strong> and wish you success with your future research work.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] Editorial Decision: ${paperId}`,
            html: mailLayout(content)
        };
    },

    reviewCompleted: (reviewerName: string, paperTitle: string, paperId: string) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://www.ijitest.org';
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear Administrator,</p>
            <p>Reviewer <strong>${reviewerName}</strong> has submitted their final evaluation for manuscript <strong>${paperId}</strong>.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 25px; border-radius: 16px; margin: 30px 0;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Submission Title</p>
                <p style="margin: 10px 0 0 0; font-weight: 800; font-size: 16px; color: ${JOURNAL.secondaryColor};">${paperTitle}</p>
            </div>
            
            <p>Please review the technical feedback and proceed to the next editorial decision stage.</p>
        `;

        return {
            subject: `[SYSTEM] Review Completed: ${paperId}`,
            html: mailLayout(content, {
                text: 'Evaluate Review Feedback',
                url: `${baseUrl}/admin/submissions/${paperId}`
            })
        };
    },

    paymentVerified: (authorName: string, paperTitle: string, paperId: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>We are pleased to confirm that the Article Processing Charge (APC) for your manuscript has been successfully verified.</p>
            
            <div style="background: #ffffff; border: 1px solid #10b981; padding: 35px 30px; border-radius: 20px; text-align: center; margin: 30px 0; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.05);">
                <div style="display: inline-block; background: #ecfdf5; color: #059669; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                    Payment Confirmed
                </div>
                <p style="color: #065f46; font-weight: 900; margin: 0; font-size: 18px;">ID: ${paperId}</p>
                <p style="color: #475569; margin-top: 10px; font-size: 14px; font-style: italic;">"${paperTitle}"</p>
            </div>

            <p>Your paper is now in the final publication queue and will be assigned to the next available issue. You will receive final confirmation once the index is live.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] APC Payment Verified: ${paperId}`,
            html: mailLayout(content)
        };
    },

    manuscriptPublished: (authorName: string, paperTitle: string, paperId: string, volume: number, issue: number, year: number) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://www.ijitest.org';
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>We are delighted to inform you that your manuscript is now officially <strong>PUBLISHED</strong> and indexed in the latest issue of ${JOURNAL.shortName}.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 35px; border-radius: 20px; margin: 30px 0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
                <div style="display: inline-block; background: ${JOURNAL.primaryColor}10; color: ${JOURNAL.primaryColor}; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">
                    Live in Archives
                </div>
                <h3 style="margin: 0; color: ${JOURNAL.secondaryColor}; font-size: 18px; line-height: 1.5; font-weight: 800;">${paperTitle}</h3>
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <p style="margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Location</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: #475569;">Vol ${volume}, Issue ${issue} (${year})</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Manuscript ID</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: #475569;">${paperId}</p>
                    </div>
                </div>
            </div>

            <p>Your contribution to the scientific community is now available in our global archives. Congratulations on this milestone achievement.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] OFFICIAL PUBLICATION: ${paperId}`,
            html: mailLayout(content, {
                text: 'View Official Publication',
                url: `${baseUrl}/archives`
            })
        };
    },

    resubmissionRequest: (authorName: string, _paperTitle: string, paperId: string, comments?: string, subId?: number) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://www.ijitest.org';
        const resubmitLink = subId ? `${baseUrl}/author/submissions/${subId}/resubmit` : `${baseUrl}/author/submissions`;
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>The technical evaluation for your manuscript <strong>(ID: ${paperId})</strong> has been completed. The reviewers have requested revisions before a final decision can be made.</p>
            
            <div style="background: #ffffff; border: 1px solid #f9731633; border-left: 5px solid #f97316; padding: 30px; border-radius: 12px; margin: 30px 0; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.05);">
                <p style="margin: 0; font-weight: bold; color: #c2410c; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;">Editorial & Reviewer Requirements</p>
                <div style="margin-top: 15px; color: #475569; font-size: 14px; white-space: pre-wrap; line-height: 1.8;">${comments || 'Please address the detailed reviewer comments available in the portal.'}</div>
            </div>

            <p>Please submit your revised version within 15 days to remain in the current publication cycle.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] Revision Requested: ${paperId}`,
            html: mailLayout(content, {
                text: 'Submit Revised Manuscript',
                url: resubmitLink
            })
        };
    },

    resubmissionReceived: (authorName: string, paperTitle: string, paperId: string, subId: number, role: 'admin' | 'editor' = 'admin') => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://www.ijitest.org';
        const dashboardLink = role === 'admin' ? `${baseUrl}/admin/submissions/${subId}` : `${baseUrl}/editor/submissions/${subId}`;
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p>A revised manuscript from <strong>${authorName}</strong> has been uploaded to the system.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 25px; border-radius: 16px; margin: 30px 0;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Revised Manuscript ID</p>
                <p style="margin: 10px 0 0 0; font-weight: 800; font-size: 18px; color: ${JOURNAL.primaryColor};">${paperId}</p>
                <p style="margin: 10px 0 0 0; font-style: italic; color: #475569; font-size: 14px;">"${paperTitle}"</p>
            </div>
            
            <p>Please verify the revisions and changelog to proceed with the next editorial step.</p>
        `;

        return {
            subject: `[SYSTEM] Revision Received: ${paperId} (by ${authorName})`,
            html: mailLayout(content, {
                text: 'Review Revised Submission',
                url: dashboardLink
            })
        };
    },

    boardInvitation: (name: string, role: string, setupUrl: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${name}</strong>,</p>
            <p>On behalf of the Editorial Board, we are pleased to invite you to join <strong>${JOURNAL.name}</strong> as a <strong>${role.charAt(0).toUpperCase() + role.slice(1)}</strong>.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 35px; border-radius: 20px; margin: 30px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="display: inline-block; background: ${JOURNAL.primaryColor}10; color: ${JOURNAL.primaryColor}; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                    Official Appointment
                </div>
                <h3 style="margin: 0; color: ${JOURNAL.secondaryColor}; font-size: 18px; line-height: 1.4;">Editorial Management Board Enrollment</h3>
                <p style="margin: 15px 0 0 0; font-size: 14px; color: #475569;">You have been selected based on your academic excellence and technical expertise to help shape the future of innovative research.</p>
            </div>

            <p>To finalize your enrollment and access your administrative portal, please secure your official staff account by setting your professional credentials:</p>
            
            <p style="font-size: 12px; color: #94a3b8; font-style: italic; margin-top: 20px;">Note: This invitation link is personal and will expire in 7 days for security purposes.</p>
        `;

        return {
            subject: `Welcome to IJITEST | ${role.charAt(0).toUpperCase() + role.slice(1)} Portal Invitation`,
            html: mailLayout(content, {
                text: 'Secure My Account & Set Password',
                url: setupUrl
            })
        };
    },

    boardRejection: (name: string, role: string, reason: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${name}</strong>,</p>
            <p>Thank you for your interest in joining the <strong>IJITEST ${role.charAt(0).toUpperCase() + role.slice(1)} Board</strong>.</p>
            <p>After a thorough evaluation of your professional profile and academic background, we regret to inform you that we cannot proceed with your enrollment at this time.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px; margin: 30px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <p style="margin: 0; font-weight: bold; font-size: 10px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">Review Decision Summary</p>
                <div style="margin-top: 15px; color: #475569; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">${reason}</div>
            </div>

            <p>We appreciate your expertise and suggest you continue contributing to our journal through research submissions. We wish you the very best in your academic endeavors.</p>
        `;

        return {
            subject: `Application Update | IJITEST ${role.charAt(0).toUpperCase() + role.slice(1)} Board`,
            html: mailLayout(content)
        };
    },

    passwordReset: (name: string, resetUrl: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${name}</strong>,</p>
            <p>We received a request to reset your password for the <strong>${JOURNAL.shortName}</strong> professional portal.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 35px 30px; border-radius: 20px; text-align: center; margin: 30px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="width: 50px; height: 50px; background: ${JOURNAL.primaryColor}10; border-radius: 50%; margin: 0 auto 20px auto; line-height: 50px; color: ${JOURNAL.primaryColor}; font-size: 20px;">🔑</div>
                <h3 style="margin-top: 0; font-weight: 800; color: ${JOURNAL.secondaryColor};">Password Recovery</h3>
                <p style="color: #475569; font-size: 14px;">To set a new password, please click the secure link below.</p>
            </div>

            <p style="font-size: 12px; color: #94a3b8; font-style: italic; text-align: center;">This recovery link will expire in 1 hour. If you did not request this, you can safely ignore this message.</p>
        `;

        return {
            subject: `Reset Your Password | ${JOURNAL.shortName}`,
            html: mailLayout(content, {
                text: 'Create New Password',
                url: resetUrl
            })
        };
    },

    contactReply: (name: string, originalSubject: string, replyContent: string, originalMessage: string, date?: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${name}</strong>,</p>
            <p>Thank you for reaching out to <strong>${JOURNAL.name}</strong>. Please find our response to your inquiry below:</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px; margin: 30px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="display: inline-block; background: ${JOURNAL.primaryColor}10; color: ${JOURNAL.primaryColor}; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">
                    Support Response
                </div>
                <div style="color: #1e293b; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${replyContent}</div>
            </div>

            <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 25px;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Original Inquiry ${date ? `(On ${date})` : ''}</p>
                <p style="margin: 10px 0 0 0; color: #64748b; font-size: 13px; font-style: italic; border-left: 2px solid #f1f5f9; padding-left: 15px;">"${originalMessage}"</p>
            </div>
        `;

        return {
            subject: `Re: ${originalSubject || 'Your Inquiry to IJITEST'}`,
            html: mailLayout(content)
        };
    },

    contactReceipt: (name: string, subject: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${name}</strong>,</p>
            <p>This is an automated confirmation that we have successfully received your inquiry regarding "<strong>${subject || 'General Inquiry'}</strong>".</p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px; margin: 30px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #475569;">Our editorial office will review your message and provide a detailed response within 2-3 business days.</p>
            </div>

            <p>Thank you for your patience and interest in <strong>${JOURNAL.shortName}</strong>.</p>
        `;

        return {
            subject: `Receipt Confirmation: ${subject || 'Contact Inquiry'}`,
            html: mailLayout(content)
        };
    },

    adminNotification: (title: string, details: string, actionUrl?: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Hello Administrator,</p>
            <p>A new event requires your attention on the <strong>${JOURNAL.shortName}</strong> management platform.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px; margin: 30px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="display: inline-block; background: #334155; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                    System Alert
                </div>
                <h3 style="margin: 0; color: ${JOURNAL.secondaryColor}; font-size: 18px;">${title}</h3>
                <div style="margin-top: 20px; color: #475569; font-size: 14px; line-height: 1.6; border-left: 3px solid #f1f5f9; padding-left: 15px;">${details}</div>
            </div>
        `;

        return {
            subject: `[SYSTEM ALERT] ${title}`,
            html: mailLayout(content, actionUrl ? {
                text: 'Review in Admin Panel',
                url: actionUrl
            } : undefined)
        };
    },

    coAuthorNotification: (name: string, title: string, correspondingAuthor: string, paperId: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${name}</strong>,</p>
            <p>This is to inform you that you have been named as a co-author for a manuscript submission by <strong>${correspondingAuthor}</strong> to <em>${JOURNAL.name}</em>.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px; margin: 30px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="display: inline-block; background: ${JOURNAL.primaryColor}10; color: ${JOURNAL.primaryColor}; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                    Manuscript Contributor
                </div>
                <h3 style="margin: 0; color: ${JOURNAL.secondaryColor}; font-size: 18px; line-height: 1.4;">${title}</h3>
                <p style="margin: 15px 0 0 0; font-size: 13px; color: #64748b; font-weight: 600;">Paper ID: ${paperId}</p>
            </div>

            <p>As a co-author, you will be notified of major editorial milestones regarding this submission. If you believe this is an error, please contact our editorial office immediately.</p>
        `;

        return {
            subject: `Submission Notification: ${paperId} (Co-author Enrollment)`,
            html: mailLayout(content)
        };
    },

    staffNotification: (staffName: string, title: string, details: string, actionUrl: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${staffName}</strong>,</p>
            <p>This is a system notification regarding a new action on the <strong>${JOURNAL.shortName}</strong> editorial workflow.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px; margin: 30px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="display: inline-block; background: ${JOURNAL.secondaryColor}; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                    Workflow Update
                </div>
                <h3 style="margin: 0; color: ${JOURNAL.secondaryColor}; font-size: 17px; font-weight: 800;">${title}</h3>
                <p style="margin: 15px 0 0 0; font-size: 14px; color: #475569; line-height: 1.6;">${details}</p>
            </div>
        `;

        return {
            subject: `[${JOURNAL.shortName}] Action Required: ${title}`,
            html: mailLayout(content, {
                text: 'View Submission & Details',
                url: actionUrl
            })
        };
    },

    boardApplicationReceipt: (name: string, role: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${name}</strong>,</p>
            <p>Thank you for your interest in joining the <strong>${role.charAt(0).toUpperCase() + role.slice(1)} Board</strong> of <em>${JOURNAL.name}</em>.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 35px; border-radius: 20px; text-align: center; margin: 30px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="width: 50px; height: 50px; background: #f0fdf4; border-radius: 50%; margin: 0 auto 15px auto; line-height: 50px; color: #16a34a; font-size: 20px;">✓</div>
                <h3 style="margin: 0; color: ${JOURNAL.secondaryColor}; font-size: 18px;">Application Under Review</h3>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">We have successfully received your credentials and technical profile.</p>
            </div>

            <p>Our senior editorial team will evaluate your expertise against our current board requirements. You will receive a formal update regarding the status of your enrollment within 2-3 business days.</p>
        `;

        return {
            subject: `Application Received | IJITEST ${role.charAt(0).toUpperCase() + role.slice(1)} Board`,
            html: mailLayout(content)
        };
    },

    copyrightSubmitted: (authorName: string, paperTitle: string, paperId: string, subId: number) => {
        const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || 'https://www.ijitest.org';
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Hello Editor,</p>
            <p>The corresponding author <strong>${authorName}</strong> has submitted the signed copyright transfer agreement for manuscript <strong>${paperId}</strong>.</p>
            <p>The signed document has been attached to this email and is also available in the administration panel.</p>
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 25px; border-radius: 16px; margin: 30px 0;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Manuscript Details</p>
                <p style="margin: 10px 0 0 0; font-weight: 800; font-size: 18px; color: ${JOURNAL.primaryColor};">${paperId}</p>
                <p style="margin: 10px 0 0 0; font-style: italic; color: #475569; font-size: 14px;">"${paperTitle}"</p>
            </div>
        `;
        return {
            subject: `[${JOURNAL.shortName}] Copyright Transfer Agreement Submitted: ${paperId}`,
            html: mailLayout(content, {
                text: 'Review Submission Details',
                url: `${baseUrl}/admin/submissions/${subId}`
            })
        };
    }
};
