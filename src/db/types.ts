import { 
    users, 
    userProfiles, 
    submissions, 
    submissionVersions, 
    submissionFiles, 
    submissionAuthors, 
    reviewAssignments, 
    reviews, 
    payments, 
    volumesIssues, 
    publications, 
    applications,
    applicationInterests,
    contactMessages,
    notifications, 
    activityLogs, 
    settings 
} from "./schema";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// 🏷️ Global Literal Types (Enums)
export type UserRole = 'admin' | 'editor' | 'reviewer' | 'author';

export type SubmissionStatus = 
    | 'submitted' 
    | 'editor_assigned' 
    | 'under_review' 
    | 'revision_requested' 
    | 'accepted' 
    | 'rejected' 
    | 'payment_pending' 
    | 'published'
    | 'retracted';

export type ReviewStatus = 'assigned' | 'accepted' | 'declined' | 'completed';

export type ReviewDecision = 'accept' | 'minor_revision' | 'major_revision' | 'reject';

export type PaymentStatus = 'pending' | 'paid' | 'verified' | 'failed' | 'waived';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// 👤 Users & Profiles
export type User = Omit<InferSelectModel<typeof users>, 'role'> & {
    role: UserRole;
};
export type NewUser = Omit<InferInsertModel<typeof users>, 'role'> & {
    role: UserRole;
};
export type UserProfile = InferSelectModel<typeof userProfiles>;
export type NewUserProfile = InferInsertModel<typeof userProfiles>;

export type UserWithProfile = User & {
    profile: UserProfile | null;
};

// 🔒 Safe types (excluding password indices/hashes)
export type SafeUser = Omit<User, 'passwordHash'>;
export type SafeUserWithProfile = SafeUser & {
    profile: UserProfile | null;
};

// 📄 Submissions
export type ShortSubmission = Omit<InferSelectModel<typeof submissions>, 'status'> & {
    status: SubmissionStatus;
};
export type NewSubmission = InferInsertModel<typeof submissions>;

export type Version = InferSelectModel<typeof submissionVersions>;
export type NewVersion = InferInsertModel<typeof submissionVersions>;
export type SubmissionFile = InferSelectModel<typeof submissionFiles>;
export type Author = InferSelectModel<typeof submissionAuthors>;

export type SubmissionDetail = ShortSubmission & {
    correspondingAuthor?: UserWithProfile | undefined;
    versions: (Version & { files: SubmissionFile[] })[];
    authors: Author[];
    payment?: (Omit<InferSelectModel<typeof payments>, 'status'> & { status: PaymentStatus }) | null | undefined;
    publication: InferSelectModel<typeof publications> | null;
    issue: InferSelectModel<typeof volumesIssues> | null;
    reviewAssignments: ReviewWithReviewer[];
};

export type SubmissionUI = SubmissionDetail & {
    paper_id: string;
    submitted_at: Date | null;
    updated_at: Date | null;
    title: string;
    abstract: string | null;
    keywords: string | null;
    file_path: string;
    pdf_url: string;
    author_name: string;
    author_email: string;
    co_authors: string; // JSON string
    volume_number?: number | undefined;
    issue_number?: number | undefined;
    start_page?: number | null | undefined;
    end_page?: number | null | undefined;
    issue_id?: number | null | undefined;
    latestVersion?: (Version & { files: SubmissionFile[] }) | undefined;
    allFiles: SubmissionFile[];
    allReviews: ReviewWithReviewer[];
    completed_reviews?: number | undefined;
    deletedAt?: Date | null | undefined;
};

// 🧪 Reviews
export type ReviewAssignment = Omit<InferSelectModel<typeof reviewAssignments>, 'status'> & {
    status: ReviewStatus;
};
export type Review = Omit<InferSelectModel<typeof reviews>, 'decision'> & {
    decision: ReviewDecision;
};

export type ReviewWithReviewer = ReviewAssignment & {
    reviewer: UserWithProfile;
    review: Review | null;
};

// 📚 Publications
export type Publication = InferSelectModel<typeof publications>;
export type Issue = InferSelectModel<typeof volumesIssues>;

// 📩 Applications
export type Application = Omit<InferSelectModel<typeof applications>, 'status' | 'type'> & {
    status: ApplicationStatus;
    type: 'reviewer' | 'editor';
    research_interests?: string[] | undefined;
};
export type NewApplication = Omit<InferInsertModel<typeof applications>, 'status' | 'type'> & {
    status: ApplicationStatus;
    type: 'reviewer' | 'editor';
};
export type ApplicationInterest = InferSelectModel<typeof applicationInterests>;
export type NewApplicationInterest = InferInsertModel<typeof applicationInterests>;

// 📝 Author Dashboard / Details
export type AuthorDashboardSubmission = {
    id: number;
    paperId: string;
    status: SubmissionStatus;
    submittedAt: Date | null;
    updatedAt: Date | null;
    title: string | null;
    paymentStatus: PaymentStatus | null;
    paymentAmount: string | null;
    finalPdfUrl: string | null;
    volumeNumber: number | null;
    issueNumber: number | null;
    issueYear: number | null;
    views: number | null;
    downloads: number | null;
    citations: number | null;
};

export type AuthorSubmissionDetail = {
    id: number;
    paperId: string;
    status: SubmissionStatus;
    submittedAt: Date | null;
    updatedAt: Date | null;
    versionId: number;
    versionNumber: number;
    title: string;
    abstract: string;
    keywords: string;
    subjectArea: string | null;
    changelog: string | null;
    files: (SubmissionFile)[];
    authors: (Author)[];
    reviewComments: Array<{
        commentsToAuthor: string | null;
        decision: ReviewDecision | null;
        submittedAt: Date | null;
        reviewRound: number;
        deadline: string | null;
    }>;
    payment: (Omit<InferSelectModel<typeof payments>, 'status'> & { status: PaymentStatus }) | null | undefined;
    publication: (Publication & {
        issue?: Issue | undefined;
    }) | null | undefined;
};

// 📬 Correspondence
export type ContactMessage = Omit<InferSelectModel<typeof contactMessages>, 'status'> & {
    status: 'pending' | 'resolved' | 'archived';
};
export type Notification = InferSelectModel<typeof notifications>;

// 📜 System
export type ActivityLog = InferSelectModel<typeof activityLogs>;
export type Setting = InferSelectModel<typeof settings>;

// 📰 UI / Public View Types
export type PublishedPaperUI = {
    id: number;
    paper_id: string;
    title: string;
    abstract: string;
    keywords: string;
    author_name: string;
    status: SubmissionStatus;
    doi: string | null;
    file_path: string;
    pdf_url: string;
    start_page: number | null;
    end_page: number | null;
    page_range: string | null;
    published_at: string | Date | null;
    updated_at: Date | null;
    volume_number: number | null;
    issue_number: number | null;
    publication_year: number | null;
    month_range: string | null;
    co_authors: string | null | undefined;
    affiliation: string | null;
    author_email: string | null;
};

export interface TrackedManuscript {
    id: number;
    paperId: string;
    paper_id: string;
    status: SubmissionStatus;
    submittedAt: Date | null;
    submitted_at: Date | null;
    updatedAt: Date | null;
    updated_at: Date | null;
    title: string;
    authorName: string;
    author_name: string;
    authorEmail: string;
    author_email: string;
    review_started_at: Date | null;
    reviewer_feedback?: (string | null)[] | undefined;
}

export interface ActiveReview {
    id: number;
    status: ReviewStatus;
    assignedAt: Date | null;
    deadline: Date | null;
    reviewRound: number;
    submissionId: number;
    paperId: string;
    submissionStatus: SubmissionStatus;
    title: string;
    reviewerName: string | null;
    decision: ReviewDecision | null;
    commentsToAuthor: string | null;
    submittedAt: Date | null;
    manuscriptPath: string | null;
    feedbackFilePath: string | null;
}

export interface UnassignedPaper {
    id: number;
    paperId: string;
    title: string;
    pdfUrl: string | null;
}

// 🧪 Common Return Types
export type ActionResponse<T = undefined> = {
    success: boolean;
    data?: T | undefined;
    error?: string | undefined;
    message?: string | undefined;
};
