export interface DefaultTemplateDefinition {
    templateKey: string;
    name: string;
    description: string;
    category: "submissions" | "review" | "editorial" | "applications" | "system";
    subjectTemplate: string;
    bodyTemplate: string;
    variables: string[];
}

export type TemplateCategory = "submissions" | "review" | "editorial" | "applications" | "system";

export const DEFAULT_EMAIL_TEMPLATES: DefaultTemplateDefinition[] = [
    // 1. SUBMISSIONS & AUTHORS
    {
        templateKey: "SUBMISSION_ACK",
        name: "Submission Acknowledgment",
        description: "Sent to the corresponding author immediately upon submitting a new manuscript.",
        category: "submissions",
        subjectTemplate: "[{{journalShortName}}] Acknowledgment of Submission: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nThank you for submitting your manuscript entitled \"{{paperTitle}}\" to {{journalName}}.\n\nYour manuscript ID is {{paperId}}.\n\nOur editorial team has commenced technical screening. You may track manuscript progress through the author portal:\n{{trackUrl}}\n\nSincerely,\nEditorial Office\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "trackUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "CO_AUTHOR_NOTIFICATION",
        name: "Co-Author Contributor Notification",
        description: "Sent to co-authors informing them that they were listed on a new manuscript submission.",
        category: "submissions",
        subjectTemplate: "[{{journalShortName}}] Manuscript Co-Author Notification: {{paperId}}",
        bodyTemplate: "Dear {{name}},\n\nThis is to inform you that you have been named as a co-author for the manuscript entitled \"{{paperTitle}}\" (ID: {{paperId}}) submitted by {{correspondingAuthor}} to {{journalName}}.\n\nAs a co-author, you will receive updates regarding major editorial milestones. If you did not authorize this submission, please contact our editorial office immediately.\n\nSincerely,\nEditorial Office\n{{journalName}}",
        variables: ["name", "paperTitle", "correspondingAuthor", "paperId", "journalName", "journalShortName"],
    },
    {
        templateKey: "REVISION_REQUEST",
        name: "Manuscript Revision Requested",
        description: "Sent to author when editor requests minor or major revisions based on peer review.",
        category: "submissions",
        subjectTemplate: "[{{journalShortName}}] Revision Requested: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nThe technical review for your manuscript entitled \"{{paperTitle}}\" (ID: {{paperId}}) has concluded. The reviewers and editorial board request revisions before a final decision can be made.\n\nEditorial & Reviewer Comments:\n{{comments}}\n\nPlease revise your manuscript and submit the revised files within 28 days via your author portal:\n{{resubmitUrl}}\n\nSincerely,\nManaging Editor\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "comments", "resubmitUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "REVISION_RECEIVED",
        name: "Revised Manuscript Uploaded",
        description: "Sent to editorial staff when an author uploads a revised manuscript with changelog.",
        category: "submissions",
        subjectTemplate: "[{{journalShortName}}] Revised Manuscript Uploaded: {{paperId}} (by {{authorName}})",
        bodyTemplate: "Hello Editorial Desk,\n\nA revised version of manuscript \"{{paperTitle}}\" (ID: {{paperId}}) has been uploaded by {{authorName}}.\n\nPlease inspect the revised files, rebuttal letter, and response to reviewer remarks in the editorial portal:\n{{dashboardUrl}}\n\nSincerely,\nAutomated Workflow System\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "dashboardUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "COPYRIGHT_SUBMITTED",
        name: "Copyright Agreement Form Submitted",
        description: "Sent to editorial office when author signs and uploads the formal copyright agreement form.",
        category: "submissions",
        subjectTemplate: "[{{journalShortName}}] Copyright Transfer Agreement Uploaded: {{paperId}}",
        bodyTemplate: "Hello Editorial Office,\n\nThe corresponding author {{authorName}} has signed and submitted the formal Copyright Transfer Agreement for manuscript \"{{paperTitle}}\" (ID: {{paperId}}).\n\nThe document has been attached and logged in the submission management panel:\n{{submissionUrl}}\n\nSincerely,\nPublication Workflow System\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "submissionUrl", "journalName", "journalShortName"],
    },

    // 2. PEER REVIEW
    {
        templateKey: "REVIEW_INVITATION",
        name: "Reviewer Invitation",
        description: "Sent to invited peer reviewers requesting their technical evaluation.",
        category: "review",
        subjectTemplate: "[{{journalShortName}}] Invitation to Review Manuscript: {{paperId}}",
        bodyTemplate: "Dear {{reviewerName}},\n\nBased on your distinguished research expertise, the Editorial Board of {{journalName}} cordially invites you to evaluate the following manuscript:\n\nTitle: \"{{paperTitle}}\"\nManuscript ID: {{paperId}}\nReview Deadline: {{reviewDeadline}}\n\nPlease access your reviewer portal to accept or decline the assignment and view the abstract:\n{{portalUrl}}\n\nSincerely,\nManaging Editor\n{{journalName}}",
        variables: ["reviewerName", "paperTitle", "paperId", "reviewDeadline", "portalUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "REVIEW_COMPLETED",
        name: "Peer Review Report Submitted",
        description: "Sent to editor/admin when a peer reviewer submits their completed rubric and report.",
        category: "review",
        subjectTemplate: "[{{journalShortName}}] Peer Review Completed: {{paperId}} ({{recommendation}})",
        bodyTemplate: "Dear {{editorName}},\n\nReviewer {{reviewerName}} has completed their peer review report and recommendations for manuscript \"{{paperTitle}}\" (ID: {{paperId}}).\n\nRecommendation: {{recommendation}}\n\nPlease inspect the evaluation scores, confidential editor notes, and author feedback in the editorial portal:\n{{evaluationUrl}}\n\nSincerely,\nEditorial System\n{{journalName}}",
        variables: ["editorName", "reviewerName", "paperTitle", "paperId", "recommendation", "evaluationUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "REVIEW_DEADLINE_REMINDER",
        name: "Review Deadline Approaching / Overdue",
        description: "Automated reminder sent to reviewers when a review deadline is approaching, due today, or overdue.",
        category: "review",
        subjectTemplate: "[{{journalShortName}}] Review Deadline {{timeText}}: {{paperId}}",
        bodyTemplate: "Dear {{reviewerName}},\n\nThis is an automated reminder regarding your peer review assignment for manuscript \"{{paperTitle}}\" (ID: {{paperId}}).\n\nYour review evaluation {{timeText}} (Scheduled Deadline: {{deadline}}).\n\nPlease access your reviewer portal to complete and submit your review report:\n{{portalUrl}}\n\nYour timely evaluation is vital to maintaining our publication schedule. Thank you for your service.\n\nSincerely,\nEditorial Office\n{{journalName}}",
        variables: ["reviewerName", "paperTitle", "paperId", "deadline", "timeText", "portalUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "REVIEW_OVERDUE_ESCALATION",
        name: "Late Review Assignment Escalation",
        description: "Automated escalation alert sent to handling editor when an assigned review is overdue.",
        category: "review",
        subjectTemplate: "[{{journalShortName}}] [ESCALATION] Review Overdue for {{paperId}}",
        bodyTemplate: "Dear {{editorName}},\n\nThis is a system escalation alert regarding an overdue review assignment for manuscript \"{{paperTitle}}\" (ID: {{paperId}}).\n\nAssigned Reviewer: {{reviewerName}}\nOriginal Deadline: {{deadline}}\nDays Overdue: {{daysOverdue}} days\n\nPlease check the reviewer status or consider assigning an alternate reviewer:\n{{dashboardUrl}}\n\nSincerely,\nEditorial Workflow Monitor\n{{journalName}}",
        variables: ["editorName", "reviewerName", "paperTitle", "paperId", "daysOverdue", "deadline", "dashboardUrl", "journalName", "journalShortName"],
    },

    // 3. EDITORIAL & PRODUCTION
    {
        templateKey: "DECISION_ACCEPT",
        name: "Manuscript Acceptance",
        description: "Sent to the author when the editor formally accepts the manuscript for publication.",
        category: "editorial",
        subjectTemplate: "[{{journalShortName}}] MANUSCRIPT ACCEPTANCE: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nWe are pleased to inform you that your manuscript entitled \"{{paperTitle}}\" (ID: {{paperId}}) has been ACCEPTED for publication in {{journalName}}.\n\nTo complete publication scheduling and APC processing, please proceed to your author portal:\n{{actionUrl}}\n\nCongratulations on your successful research contribution.\n\nSincerely,\nEditor-in-Chief\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "actionUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "DECISION_REJECT",
        name: "Manuscript Rejection",
        description: "Sent to the author when the paper is declined after peer review or initial screening.",
        category: "editorial",
        subjectTemplate: "[{{journalShortName}}] Editorial Decision: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nThank you for submitting your manuscript \"{{paperTitle}}\" (ID: {{paperId}}) to {{journalName}}.\n\nAfter thorough evaluation by our editorial board and reviewers, we regret to inform you that we are unable to accept your manuscript for publication in its current form.\n\nEditorial Feedback & Review Summary:\n{{editorialFeedback}}\n\nWe thank you for considering {{journalName}} and wish you success with your ongoing research endeavors.\n\nSincerely,\nEditorial Board\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "editorialFeedback", "journalName", "journalShortName"],
    },
    {
        templateKey: "GALLEY_PROOF_REQUEST",
        name: "Galley Proof Review Request",
        description: "Sent to authors when typeset PDF proofs are ready for review before final publication.",
        category: "editorial",
        subjectTemplate: "[{{journalShortName}}] Action Required: Galley Proof for {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nThe typeset galley proof of your manuscript \"{{paperTitle}}\" (ID: {{paperId}}) is now ready for your final inspection.\n\nPlease review the formatted PDF and either approve it or submit typographical corrections within 48 hours:\n{{proofUrl}}\n\nSincerely,\nProduction Team\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "proofUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "PAPER_PUBLISHED",
        name: "Article Published Announcement",
        description: "Sent to authors upon publication and issue release.",
        category: "editorial",
        subjectTemplate: "[{{journalShortName}}] Published & Live in Archives: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nWe are thrilled to inform you that your research paper \"{{paperTitle}}\" (ID: {{paperId}}) is now officially PUBLISHED in Volume {{volumeNumber}}, Issue {{issueNumber}} ({{year}}).\n\nArticle Permanent Record:\n{{articleUrl}}\n\nDownload Official Publication Certificate:\n{{certificateUrl}}\n\nThank you for contributing your scholarly research to {{journalName}}.\n\nSincerely,\nEditor-in-Chief\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "volumeNumber", "issueNumber", "year", "articleUrl", "certificateUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "PAYMENT_VERIFIED",
        name: "APC Payment Verified",
        description: "Sent to author when Article Processing Charge is confirmed.",
        category: "editorial",
        subjectTemplate: "[{{journalShortName}}] APC Payment Verified: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nWe are pleased to confirm that the Article Processing Charge for your manuscript \"{{paperTitle}}\" (ID: {{paperId}}) has been verified successfully.\n\nYour article has entered the final production and typesetting queue.\n\nSincerely,\nFinance & Editorial Desk\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "journalName", "journalShortName"],
    },

    // 4. BOARD & APPLICATIONS
    {
        templateKey: "BOARD_INVITATION",
        name: "Staff / Board Appointment Invitation",
        description: "Sent when an editor or reviewer application is approved or staff member is appointed.",
        category: "applications",
        subjectTemplate: "Welcome to {{journalShortName}} | {{role}} Portal Invitation",
        bodyTemplate: "Dear {{name}},\n\nOn behalf of the Editorial Board, we are pleased to invite you to join {{journalName}} as an official {{role}}.\n\nYou have been selected based on your academic excellence and technical expertise to help shape high-impact scholarly research.\n\nTo finalize your appointment and access your administrative portal, please configure your account credentials:\n{{setupUrl}}\n\nNote: This security link is valid for 7 days.\n\nSincerely,\nEditorial Governance Board\n{{journalName}}",
        variables: ["name", "role", "setupUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "BOARD_REJECTION",
        name: "Board Application Decision",
        description: "Sent when an applicant's editorial board or reviewer application is declined.",
        category: "applications",
        subjectTemplate: "Application Update | {{journalShortName}} {{role}} Board",
        bodyTemplate: "Dear {{name}},\n\nThank you for your interest in joining the {{journalShortName}} {{role}} Board.\n\nAfter a thorough evaluation of your professional profile and academic background, we regret to inform you that we cannot proceed with your enrollment at this time.\n\nEvaluation Summary:\n{{reason}}\n\nWe appreciate your expertise and welcome your continued engagement with our journal through manuscript submissions.\n\nSincerely,\nEditorial Board\n{{journalName}}",
        variables: ["name", "role", "reason", "journalName", "journalShortName"],
    },
    {
        templateKey: "BOARD_APP_RECEIPT",
        name: "Board Application Received",
        description: "Sent to applicant upon submitting an application to join the editorial or reviewer board.",
        category: "applications",
        subjectTemplate: "Application Received | {{journalShortName}} {{role}} Board",
        bodyTemplate: "Dear {{name}},\n\nThank you for applying to join the {{role}} Board of {{journalName}}.\n\nWe have successfully received your credentials and curriculum vitae. Our senior editorial team will evaluate your background against our board requirements.\n\nYou will receive a formal status update regarding your application within 2-3 business days.\n\nSincerely,\nEditorial Office\n{{journalName}}",
        variables: ["name", "role", "journalName", "journalShortName"],
    },

    // 5. INQUIRIES, AUTH & SYSTEM ALERTS
    {
        templateKey: "PASSWORD_RESET",
        name: "Password Recovery / Reset",
        description: "Sent to users who request a password reset link.",
        category: "system",
        subjectTemplate: "Reset Your Password | {{journalShortName}}",
        bodyTemplate: "Dear {{name}},\n\nWe received a request to reset your password for the {{journalName}} portal.\n\nTo set a new secure password, please click the link below:\n{{resetUrl}}\n\nThis recovery link is valid for 1 hour. If you did not request a password reset, you can safely disregard this message.\n\nSincerely,\nIT Security Desk\n{{journalName}}",
        variables: ["name", "resetUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "CONTACT_RECEIPT",
        name: "Contact Inquiry Receipt",
        description: "Sent to website visitors immediately upon submitting the contact inquiry form.",
        category: "system",
        subjectTemplate: "Receipt Confirmation: {{subject}}",
        bodyTemplate: "Dear {{name}},\n\nThis is an automated confirmation that we have successfully received your inquiry regarding \"{{subject}}\".\n\nOur editorial office will review your message and provide a detailed response within 2-3 business days.\n\nThank you for your interest in {{journalName}}.\n\nSincerely,\nEditorial Office\n{{journalName}}",
        variables: ["name", "subject", "journalName", "journalShortName"],
    },
    {
        templateKey: "CONTACT_REPLY",
        name: "Contact Inquiry Response",
        description: "Sent by administrator when replying to a visitor contact message.",
        category: "system",
        subjectTemplate: "Re: {{originalSubject}}",
        bodyTemplate: "Dear {{name}},\n\nThank you for reaching out to {{journalName}}. Please find our response to your inquiry below:\n\n{{replyContent}}\n\n---\nOriginal Inquiry (On {{date}}):\n\"{{originalMessage}}\"\n\nSincerely,\nSupport & Editorial Desk\n{{journalName}}",
        variables: ["name", "originalSubject", "replyContent", "originalMessage", "date", "journalName", "journalShortName"],
    },
    {
        templateKey: "STAFF_NOTIFICATION",
        name: "Staff Workflow Assignment Alert",
        description: "Sent to staff members or handling editors when assigned to a submission or workflow task.",
        category: "system",
        subjectTemplate: "[{{journalShortName}}] Action Required: {{title}}",
        bodyTemplate: "Dear {{staffName}},\n\nThis is a notification regarding a workflow task on the {{journalShortName}} editorial management platform.\n\nUpdate: {{title}}\n\nDetails:\n{{details}}\n\nPlease access the submission workspace to proceed with the next editorial step:\n{{actionUrl}}\n\nSincerely,\nEditorial Management System\n{{journalName}}",
        variables: ["staffName", "title", "details", "actionUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "ADMIN_NOTIFICATION",
        name: "System Administrative Alert",
        description: "Sent to administrators on system events requiring attention.",
        category: "system",
        subjectTemplate: "[SYSTEM ALERT] {{title}}",
        bodyTemplate: "Hello Administrator,\n\nA new event requires your attention on the {{journalShortName}} management platform.\n\nEvent: {{title}}\n\nDetails:\n{{details}}\n\nPlease review the item in the admin panel:\n{{actionUrl}}\n\nSincerely,\nSystem Monitor\n{{journalName}}",
        variables: ["title", "details", "actionUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "NEW_SUBMISSION_EDITOR_ALERT",
        name: "Editor New Submission Alert",
        description: "Sent to handling editors and administrators when a new manuscript is submitted and requires screening.",
        category: "editorial",
        subjectTemplate: "[{{journalShortName}}] New Submission Received: {{paperId}} (Screening Required)",
        bodyTemplate: "Dear {{editorName}},\n\nA new manuscript entitled \"{{paperTitle}}\" (ID: {{paperId}}) has been submitted by {{authorName}} to {{journalName}}.\n\nThe manuscript has passed automated validation and requires initial editorial screening before assigning peer reviewers.\n\nSubmission Details:\nTitle: {{paperTitle}}\nManuscript ID: {{paperId}}\nCorresponding Author: {{authorName}}\nDate: {{submissionDate}}\n\nPlease access the editorial desk to screen the manuscript and assign reviewers:\n{{dashboardUrl}}\n\nSincerely,\nEditorial Workflow System\n{{journalName}}",
        variables: ["editorName", "paperTitle", "paperId", "authorName", "submissionDate", "dashboardUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "BOARD_APPLICATION_ALERT",
        name: "New Board Application Alert",
        description: "Sent to editorial directorate when an applicant submits credentials to join the Editorial or Reviewer Board.",
        category: "applications",
        subjectTemplate: "[{{journalShortName}}] New {{role}} Board Application: {{applicantName}}",
        bodyTemplate: "Dear Editorial Directorate,\n\nA new candidate has submitted an application to join the {{journalShortName}} {{role}} Board.\n\nApplicant: {{applicantName}}\nEmail: {{applicantEmail}}\nRole Applied: {{role}}\n\nPlease inspect the applicant's technical credentials and curriculum vitae in the administrative portal:\n{{adminUrl}}\n\nSincerely,\nEditorial Governance System\n{{journalName}}",
        variables: ["applicantName", "applicantEmail", "role", "adminUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "CONTACT_INQUIRY_ALERT",
        name: "Visitor Contact Inquiry Alert",
        description: "Sent to editors and support desk when a website visitor submits an inquiry.",
        category: "system",
        subjectTemplate: "[{{journalShortName}}] New Inquiry: {{subject}}",
        bodyTemplate: "Dear Editorial & Support Desk,\n\nA new inquiry has been submitted through the public {{journalShortName}} portal.\n\nFrom: {{visitorName}} ({{visitorEmail}})\nSubject: {{subject}}\n\nInquiry Message:\n\"{{message}}\"\n\nPlease review and reply to this inquiry in the administrative messaging center:\n{{inquiryUrl}}\n\nSincerely,\nCommunications Desk\n{{journalName}}",
        variables: ["visitorName", "visitorEmail", "subject", "message", "inquiryUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "PAYMENT_RECEIVED_ALERT",
        name: "APC Payment Verified Alert",
        description: "Sent to editors and finance desk when an author successfully completes the Article Processing Charge.",
        category: "editorial",
        subjectTemplate: "[{{journalShortName}}] APC Payment Confirmed: {{paperId}}",
        bodyTemplate: "Dear Editorial & Production Desk,\n\nThe Article Processing Charge (APC) for manuscript \"{{paperTitle}}\" (ID: {{paperId}}) has been verified successfully.\n\nAuthor: {{authorName}}\nAmount Paid: {{amount}} {{currency}}\nTransaction ID: {{transactionId}}\n\nThe manuscript has been cleared for final typeset galley proofing and issue scheduling:\n{{dashboardUrl}}\n\nSincerely,\nFinance & Publication System\n{{journalName}}",
        variables: ["paperTitle", "paperId", "authorName", "amount", "currency", "transactionId", "dashboardUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "GALLEY_PROOF_RESPONSE_ALERT",
        name: "Author Galley Proof Response",
        description: "Sent to handling editors when author responds to typeset galley proof with approval or typographical correction notes.",
        category: "editorial",
        subjectTemplate: "[{{journalShortName}}] Galley Proof {{statusText}}: {{paperId}}",
        bodyTemplate: "Dear Editorial Desk,\n\nThe corresponding author {{authorName}} has responded to the typeset galley proof for manuscript \"{{paperTitle}}\" (ID: {{paperId}}).\n\nAuthor Decision: {{statusText}}\n\nNotes / Typographical Corrections:\n{{correctionNotes}}\n\nPlease review the response and proceed with publication scheduling:\n{{dashboardUrl}}\n\nSincerely,\nProduction System\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "statusText", "correctionNotes", "dashboardUrl", "journalName", "journalShortName"],
    },
];

/**
 * Get category for a templateKey
 */
export function getTemplateCategory(key: string): TemplateCategory {
    const def = DEFAULT_EMAIL_TEMPLATES.find(t => t.templateKey === key);
    return def ? def.category : "system";
}
