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
    settings,
    chatMessages,
    pushSubscriptions
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
export type NotificationType = InferSelectModel<typeof notifications>['type'];

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
export type ProfileData = Pick<User, 'id' | 'email'> &
    Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt' | 'fullName' | 'id'> & {
        name: UserProfile['fullName'];
        application?: {
            institute: Application['institute'];
            country: Application['nationality'];
            status: Application['status'];
            rejectionReason: string | null;
            reviewedAt: Application['reviewedAt'];
        };
        researchInterests: string[];
        history: Array<{
            title: Pick<Version, 'title'>['title'];
            submittedAt?: Submission['submittedAt'];
            updatedAt?: Submission['updatedAt'];
            status?: Submission['status'] | null;
            decision?: Review['decision'] | null;
        }>;
        completeness: {
            score: number;
            total: number;
            percentage: number;
            missing: string[];
        };
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

export type SubmissionUI = SubmissionDetail &
    Pick<Version, 'title' | 'abstract' | 'keywords'> & {
        filePath: Pick<SubmissionFile, 'fileUrl'>['fileUrl'];
        pdfUrl: Pick<Publication, 'finalPdfUrl'>['finalPdfUrl'];
        authorName: Pick<Author, 'name'>['name'];
        authorEmail: Pick<Author, 'email'>['email'];
        coAuthors: Author[];
        volumeNumber?: Pick<Issue, 'volumeNumber'>['volumeNumber'] | undefined;
        issueNumber?: Pick<Issue, 'issueNumber'>['issueNumber'] | undefined;
        startPage?: Pick<Publication, 'startPage'>['startPage'] | undefined;
        endPage?: Pick<Publication, 'endPage'>['endPage'] | undefined;
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

export type PaymentRow = Payment & {
    title: Pick<Version, 'title'>['title'];
    paperId: Submission['paperId'];
    authorName: UserProfile['fullName'];
    authorEmail: User['email'];
};

export type UnpaidPaperRow = Pick<Submission, 'id' | 'paperId'> & {
    title: Pick<Version, 'title'>['title'];
    authorName: UserProfile['fullName'];
};

// 📚 Publications
export type Publication = InferSelectModel<typeof publications>;
export type Issue = InferSelectModel<typeof volumesIssues>;

export type PaperWithPublication = Pick<Submission, 'id' | 'paperId' | 'status'> & {
    title: Version['title'];
    publication: Publication | null;
};

// 📩 Applications
export type Application = InferSelectModel<typeof applications> & {
    researchInterests?: string[] | undefined;
};
export type NewApplication = InferInsertModel<typeof applications>;

export type ApplicationInterest = InferSelectModel<typeof applicationInterests>;
export type NewApplicationInterest = InferInsertModel<typeof applicationInterests>;

// 📝 Author Dashboard / Details
export type AuthorDashboardSubmission = Pick<Submission, 'id' | 'paperId' | 'status' | 'submittedAt' | 'updatedAt'> & {
    title: Pick<Version, 'title'>['title'] | null;
    paymentStatus: PaymentStatus | null;
    paymentAmount: Pick<Payment, 'amount'>['amount'] | null;
    finalPdfUrl: Pick<Publication, 'finalPdfUrl'>['finalPdfUrl'] | null;
    volumeNumber: Pick<Issue, 'volumeNumber'>['volumeNumber'] | null;
    issueNumber: Pick<Issue, 'issueNumber'>['issueNumber'] | null;
    issueYear: Pick<Issue, 'year'>['year'] | null;
    views: Pick<Publication, 'views'>['views'] | null;
    downloads: Pick<Publication, 'downloads'>['downloads'] | null;
    citations: Pick<Publication, 'citations'>['citations'] | null;
};

export type AuthorSubmissionDetail = Pick<Submission, 'id' | 'paperId' | 'status' | 'submittedAt' | 'updatedAt'> &
    Pick<Version, 'versionNumber' | 'title' | 'abstract' | 'keywords' | 'subjectArea' | 'changelog'> & {
        versionId: Pick<Version, 'id'>['id'];
        files: SubmissionFile[];
        authors: Author[];
        reviewComments: Array<Pick<Review, 'commentsToAuthor' | 'decision' | 'submittedAt'> &
            Pick<ReviewAssignment, 'reviewRound' | 'deadline'>>;
        payment: Payment | null | undefined;
        publication: (Publication & Pick<Issue, 'volumeNumber' | 'issueNumber' | 'year'>) | null | undefined;
    };

// 📬 Correspondence
export type ContactMessage = InferSelectModel<typeof contactMessages>;
export type NewContactMessage = InferInsertModel<typeof contactMessages>;

export type ContactMessageRow = Pick<ContactMessage, 'id' | 'name' | 'email' | 'subject' | 'message' | 'status' | 'createdAt'>;

export type Notification = InferSelectModel<typeof notifications>;

// 📜 System
export type ActivityLog = InferSelectModel<typeof activityLogs>;
export type Setting = InferSelectModel<typeof settings>;

// 📰 UI / Public View Types
export type PublishedPaperUI = Pick<Submission, 'status' | 'updatedAt'> &
    Omit<Publication, 'submissionId' | 'issueId'> &
    Pick<Issue, 'volumeNumber' | 'issueNumber' | 'monthRange'> & {
        paperId: Pick<Submission, 'paperId'>['paperId'];
        title: Pick<Version, 'title'>['title'];
        abstract: Pick<Version, 'abstract'>['abstract'];
        keywords: Pick<Version, 'keywords'>['keywords'];
        authorName: Pick<Author, 'name'>['name'];
        authorEmail: Pick<Author, 'email'>['email'] | null;
        affiliation: Pick<Author, 'institution'>['institution'] | null;
        filePath: Pick<Publication, 'finalPdfUrl'>['finalPdfUrl'];
        pdfUrl: Pick<Publication, 'finalPdfUrl'>['finalPdfUrl'];
        pageRange: string | null; // Fully computed UI field (start-end)
        publicationYear: Pick<Issue, 'year'>['year'] | null;
        coAuthors: Author[];
        authorsList: string[];
    };

// 🗺️ Route Param Types (for Next.js [dynamic] pages — derived from schema)
// volume/issue use template literals over the schema integer types so the
// shape stays tied to Issue.volumeNumber / Issue.issueNumber.
export type PaperDetailParams = {
    volume: `volume${Issue['volumeNumber']}`;
    issue: `issue${Issue['issueNumber']}`;
    paperId: Submission['paperId'];
};

// Panel pages that receive a numeric submission ID as a URL string
export type SubmissionIdParam = {
    id: string;
};

export type TrackedManuscript = Pick<Submission, 'id' | 'paperId' | 'status' | 'submittedAt' | 'updatedAt'> & {
    title: Pick<Version, 'title'>['title'];
    authorName: Pick<Author, 'name'>['name'];
    authorEmail: Pick<Author, 'email'>['email'];
    reviewStartedAt: Pick<ReviewAssignment, 'assignedAt'>['assignedAt'] | null;
    reviewerFeedback?: (string | null)[] | undefined;
};

export type ActiveReview = Pick<ReviewAssignment, 'id' | 'status' | 'assignedAt' | 'deadline' | 'reviewRound' | 'submissionId'> &
    Pick<Review, 'decision' | 'commentsToAuthor' | 'submittedAt'> & {
        paperId: Pick<Submission, 'paperId'>['paperId'];
        submissionStatus: SubmissionStatus;
        title: Pick<Version, 'title'>['title'];
        reviewerName: Pick<UserProfile, 'fullName'>['fullName'] | null;
        manuscriptPath: Pick<SubmissionFile, 'fileUrl'>['fileUrl'] | null;
        feedbackFilePath: Pick<SubmissionFile, 'fileUrl'>['fileUrl'] | null;
    };

export type UnassignedPaper = Pick<Submission, 'id' | 'paperId'> & {
    title: Pick<Version, 'title'>['title'];
    pdfUrl: Pick<SubmissionFile, 'fileUrl'>['fileUrl'] | null;
};

// 🧪 Common Return Types (Discriminated Union)
// 🛡️ Elite: Discriminated union with conditional requirement for 'data'
export type ActionResponse<T = void> =
    | (T extends void
        ? { success: true; data?: T; message?: string }
        : { success: true; data: T; message?: string })
    | { success: false; error: string; data?: never; message?: string };

// 🛠️ Utility Helpers
export type SuccessResponse<T> = Extract<ActionResponse<T>, { success: true }>;
export type ErrorResponse = Extract<ActionResponse, { success: false }>;

/**
 * 🛡️ Elite: Helper to create a successful ActionResponse
 */
export function actionSuccess<T = void>(data: T, message?: string): ActionResponse<T>;
export function actionSuccess(data?: undefined, message?: string): ActionResponse<void>;
export function actionSuccess<T>(data?: T, message?: string): ActionResponse<T> {
    return { success: true, data: data as T, message } as ActionResponse<T>;
}

/**
 * 🛡️ Elite: Helper to create a failed ActionResponse
 */
export function actionError<T = void>(error: string): ActionResponse<T> {
    return { success: false, error } as ActionResponse<T>;
}

// 💬 Live Chat Types
export type ChatMessage = InferSelectModel<typeof chatMessages>;
export type NewChatMessage = InferInsertModel<typeof chatMessages>;

export type ChatMessageRow = ChatMessage & {
    senderName?: UserProfile['fullName'] | null;
    receiverName?: UserProfile['fullName'] | null;
};

export type ChatUser = {
    id: User['id'];
    email: User['email'];
    fullName: UserProfile['fullName'];
    role: User['role'];
};

// 🔌 WebSocket Event Types (Strongly coupled with NestJS chat.gateway.ts)
export interface ServerToClientEvents {
    authenticated: (data: { userId: User['id']; role: User['role'] }) => void;
    onlineUsers: (userIds: User['id'][]) => void;
    receiveMessage: (message: ChatMessageRow) => void;
}

export interface ClientToServerEvents {
    sendMessage: (message: ChatMessageRow) => void;
    getOnlineUsers: () => void;
}

// 🔀 Web Push Types
export type PushSubscriptionRow = InferSelectModel<typeof pushSubscriptions>;
export type NewPushSubscriptionRow = InferInsertModel<typeof pushSubscriptions>;



