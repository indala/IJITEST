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














































// 🏷️ Global Literal Types (Enums derived from Schema)
export type UserRole = InferSelectModel<typeof users>['role'];
export type SubmissionStatus = InferSelectModel<typeof submissions>['status'];
export type ReviewStatus = InferSelectModel<typeof reviewAssignments>['status'];
export type ReviewDecision = InferSelectModel<typeof reviews>['decision'];
export type PaymentStatus = InferSelectModel<typeof payments>['status'];
export type ApplicationStatus = InferSelectModel<typeof applications>['status'];
export type ApplicationType = InferSelectModel<typeof applications>['type'];
export type ContactStatus = InferSelectModel<typeof contactMessages>['status'];
export type VolumeIssueStatus = InferSelectModel<typeof volumesIssues>['status'];
export type FileType = InferSelectModel<typeof submissionFiles>['fileType'];
export type FinalDecision = InferSelectModel<typeof submissions>['finalDecision'];

// 👤 Users & Profiles
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type UserProfile = InferSelectModel<typeof userProfiles>;
export type NewUserProfile = InferInsertModel<typeof userProfiles>;

export type UserWithProfile = User & {
    profile: UserProfile | null;
};

// 🔒 Safe types (excluding sensitive fields)
export type SafeUser = Omit<User, 'passwordHash'>;
export type SafeUserWithProfile = SafeUser & {
    profile: UserProfile | null;
};

// 📄 Submissions
export type Submission = InferSelectModel<typeof submissions>;
export type NewSubmission = InferInsertModel<typeof submissions>;

export type Version = InferSelectModel<typeof submissionVersions>;
export type NewVersion = InferInsertModel<typeof submissionVersions>;

export type SubmissionFile = InferSelectModel<typeof submissionFiles>;
export type Author = InferSelectModel<typeof submissionAuthors>;

export type SubmissionDetail = Submission & {
    correspondingAuthor?: UserWithProfile | undefined;
    versions: (Version & { files: SubmissionFile[] })[];
    authors: Author[];
    payment?: Payment | null | undefined;
    publication: Publication | null;
    issue: Issue | null;
    reviewAssignments: ReviewWithReviewer[];
};

export type SubmissionUI = SubmissionDetail & {
    // Computed/Mapped Properties (Standardized to camelCase)
    title: string;
    abstract: string | null;
    keywords: string | null;
    filePath: string;
    pdfUrl: string;
    authorName: string;
    authorEmail: string;
    coAuthors: Author[]; 
    volumeNumber?: number | undefined;
    issueNumber?: number | undefined;
    startPage?: number | null | undefined;
    endPage?: number | null | undefined;
    latestVersion?: (Version & { files: SubmissionFile[] }) | undefined;
    allFiles: SubmissionFile[];
    allReviews: ReviewWithReviewer[];
    completedReviews?: number | undefined;
};

// 🧪 Reviews
export type ReviewAssignment = InferSelectModel<typeof reviewAssignments>;
export type NewReviewAssignment = InferInsertModel<typeof reviewAssignments>;

export type Review = InferSelectModel<typeof reviews>;
export type NewReview = InferInsertModel<typeof reviews>;

export type ReviewWithReviewer = ReviewAssignment & {
    reviewer: UserWithProfile;
    review: Review | null;
};

// 💰 Payments
export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;

// 📚 Publications
export type Publication = InferSelectModel<typeof publications>;
export type Issue = InferSelectModel<typeof volumesIssues>;

// 📩 Applications
export type Application = InferSelectModel<typeof applications> & {
    researchInterests?: string[] | undefined;
};
export type NewApplication = InferInsertModel<typeof applications>;

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
    payment: Payment | null | undefined;
    publication: (Publication & {
        volumeNumber?: number | null;
        issueNumber?: number | null;
        year?: number | null;
    }) | null | undefined;
};

// 📬 Correspondence
export type ContactMessage = InferSelectModel<typeof contactMessages>;
export type NewContactMessage = InferInsertModel<typeof contactMessages>;

export type Notification = InferSelectModel<typeof notifications>;

// 📜 System
export type ActivityLog = InferSelectModel<typeof activityLogs>;
export type Setting = InferSelectModel<typeof settings>;

// 📰 UI / Public View Types
export type PublishedPaperUI = {
    id: number;
    paperId: string;
    title: string;
    abstract: string;
    keywords: string;
    authorName: string;
    status: SubmissionStatus;
    doi: string | null;
    filePath: string;
    pdfUrl: string;
    startPage: number | null;
    endPage: number | null;
    pageRange: string | null;
    publishedAt: string | Date | null;
    updatedAt: Date | null;
    volumeNumber: number | null;
    issueNumber: number | null;
    publicationYear: number | null;
    monthRange: string | null;
    coAuthors: Author[];
    affiliation: string | null;
    authorEmail: string | null;
    authorsList: string[];
    views: number;
    downloads: number;
    citations: number;
};

export interface TrackedManuscript {
    id: number;
    paperId: string;
    status: SubmissionStatus;
    submittedAt: Date | null;
    updatedAt: Date | null;
    title: string;
    authorName: string;
    authorEmail: string;
    reviewStartedAt: Date | null;
    reviewerFeedback?: (string | null)[] | undefined;
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
