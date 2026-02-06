import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface SendEmailProps {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailProps) {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'IJITEST Editor'}" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error("--- SMTP Error Diagnosis ---");
        console.error("Host:", process.env.SMTP_HOST);
        console.error("User:", process.env.SMTP_USER);
        console.error("Error Code:", error.code);
        console.error("SMTP Response:", error.response);
        console.error("---------------------------");
        return { success: false, error: error.message };
    }
}

// Helper templates
export const emailTemplates = {
    submissionReceived: (authorName: string, paperTitle: string, paperId: string) => ({
        subject: `Submission Received: ${paperId}`,
        html: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                <p>Dear <strong>${authorName}</strong>,</p>
                <p>Thank you for submitting your manuscript to the <strong>International Journal of Innovative Trends in Engineering Science and Technology (IJITEST)</strong>.</p>
                <div style="background: #fdf2f2; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold;">Paper ID: ${paperId}</p>
                    <p style="margin: 5px 0 0 0;">Title: ${paperTitle}</p>
                </div>
                <p>Your submission is currently under initial screening. You will be notified of further progress via email.</p>
                <p>Warm regards,<br>Editorial Office, IJITEST</p>
            </div>
        `
    }),
    statusUpdate: (authorName: string, paperTitle: string, status: string, paperId: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';
        const isAccepted = status === 'accepted';

        return {
            subject: `Manuscript Status Update: ${status.toUpperCase()}`,
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                    <p>Dear <strong>${authorName}</strong>,</p>
                    <p>The status of your manuscript "<em>${paperTitle}</em>" has been updated to:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <h2 style="color: ${isAccepted ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#2563eb'}; text-transform: uppercase;">${status.replace('_', ' ')}</h2>
                    </div>
                    
                    ${isAccepted ? `
                        <div style="background: #f0fdf4; padding: 30px; border-radius: 15px; text-align: center; border: 1px solid #dcfce7;">
                            <p style="margin-top: 0; font-weight: bold; color: #166534;">Congratulations on your acceptance!</p>
                            <p style="font-size: 14px; color: #166534; margin-bottom: 25px;">To finalize the publication process, please complete the Article Processing Charge (APC) payment.</p>
                            <a href="${baseUrl}/payment/${paperId}" style="background: #16a34a; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">Proceed to Payment & Publish</a>
                        </div>
                    ` : `
                        <p>Please log in to the portal or check your records for more details.</p>
                    `}
                    
                    <p style="margin-top: 30px;">Warm regards,<br>Editor-in-Chief, IJITEST</p>
                </div>
            `
        };
    },
    reviewAssignment: (reviewerName: string, paperTitle: string, deadline: string) => ({
        subject: `New Peer Review Assignment`,
        html: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                <p>Dear <strong>${reviewerName}</strong>,</p>
                <p>You have been assigned as a peer reviewer for the following manuscript:</p>
                <p><strong>Title:</strong> ${paperTitle}</p>
                <p><strong>Deadline for Feedback:</strong> ${new Date(deadline).toLocaleDateString()}</p>
                <p>Please review the document and upload your feedback via the reviewer portal or reply to this email.</p>
                <p>Thank you for your contribution to technical excellence.<br>Editorial Board, IJITEST</p>
            </div>
        `
    }),
    manuscriptAcceptance: (authorName: string, paperTitle: string, paperId: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';
        return {
            subject: `MANUSCRIPT ACCEPTED: ${paperId}`,
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                    <p>Dear <strong>${authorName}</strong>,</p>
                    <p>I am pleased to inform you that your manuscript, "<strong>${paperTitle}</strong>" (ID: ${paperId}), has been <strong>ACCEPTED</strong> for publication in the <em>International Journal of Innovative Trends in Engineering Science and Technology (IJITEST)</em>.</p>
                    
                    <div style="background: #f0fdf4; padding: 30px; border-radius: 15px; text-align: center; border: 1px solid #dcfce7; margin: 30px 0;">
                        <p style="margin-top: 0; font-weight: bold; color: #166534; font-size: 18px;">Congratulations on your achievement!</p>
                        <p style="font-size: 14px; color: #166534; margin-bottom: 25px;">To finalize the publication and include your paper in the upcoming issue, please complete the Article Processing Charge (APC) payment.</p>
                        <a href="${baseUrl}/payment/${paperId}" style="background: #16a34a; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">Proceed to Payment & Publish</a>
                    </div>
                    
                    <p>After payment, our technical team will reach out for the final camera-ready copy formatting.</p>
                    <p>Warm regards,<br><strong>Editor-in-Chief, IJITEST</strong></p>
                </div>
            `
        };
    },
    manuscriptRejection: (authorName: string, paperTitle: string, paperId: string, feedback: string) => ({
        subject: `MANUSCRIPT STATUS: ${paperId}`,
        html: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                <p>Dear <strong>${authorName}</strong>,</p>
                <p>Thank you for submitting your manuscript, "<strong>${paperTitle}</strong>" (ID: ${paperId}), to IJITEST.</p>
                <p>After a thorough evaluation by our editorial board and peer reviewers, we regret to inform you that your manuscript has been <strong>REJECTED</strong> for publication in our journal.</p>
                
                <div style="background: #f9fafb; padding: 25px; border-radius: 15px; border: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="margin-top: 0; font-weight: black; uppercase; font-size: 10px; color: #6b7280; letter-spacing: 0.1em;">Reviewer Comments & Feedback</p>
                    <div style="color: #374151; line-height: 1.6; font-style: italic;">
                        ${feedback || 'The submission did not meet the technical criteria for our current focus areas.'}
                    </div>
                </div>
                
                <p>We appreciate your interest in IJITEST and wish you the best for your future research endeavors.</p>
                <p>Sincerely,<br><strong>Editorial Board, IJITEST</strong></p>
            </div>
        `
    })
};
