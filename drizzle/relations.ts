import { relations } from "drizzle-orm/relations";
import { users, activityLogs, applications, applicationInterests, masterInterests, notifications, submissions, payments, volumesIssues, publications, reviewAssignments, submissionVersions, reviews, submissionAuthors, submissionEditors, submissionFiles, userInvitations, userProfiles } from "./schema";

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	user: one(users, {
		fields: [activityLogs.performedBy],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	activityLogs: many(activityLogs),
	applications: many(applications),
	notifications: many(notifications),
	reviewAssignments_assignedBy: many(reviewAssignments, {
		relationName: "reviewAssignments_assignedBy_users_id"
	}),
	reviewAssignments_reviewerId: many(reviewAssignments, {
		relationName: "reviewAssignments_reviewerId_users_id"
	}),
	submissionEditors: many(submissionEditors),
	submissions_correspondingAuthorId: many(submissions, {
		relationName: "submissions_correspondingAuthorId_users_id"
	}),
	submissions_decisionBy: many(submissions, {
		relationName: "submissions_decisionBy_users_id"
	}),
	userInvitations: many(userInvitations),
	userProfiles: many(userProfiles),
}));

export const applicationInterestsRelations = relations(applicationInterests, ({one}) => ({
	application: one(applications, {
		fields: [applicationInterests.applicationId],
		references: [applications.id]
	}),
	masterInterest: one(masterInterests, {
		fields: [applicationInterests.interestId],
		references: [masterInterests.id]
	}),
}));

export const applicationsRelations = relations(applications, ({one, many}) => ({
	applicationInterests: many(applicationInterests),
	user: one(users, {
		fields: [applications.reviewedBy],
		references: [users.id]
	}),
}));

export const masterInterestsRelations = relations(masterInterests, ({many}) => ({
	applicationInterests: many(applicationInterests),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	submission: one(submissions, {
		fields: [payments.submissionId],
		references: [submissions.id]
	}),
}));

export const submissionsRelations = relations(submissions, ({one, many}) => ({
	payments: many(payments),
	publications: many(publications),
	reviewAssignments: many(reviewAssignments),
	submissionAuthors: many(submissionAuthors),
	submissionEditors: many(submissionEditors),
	submissionVersions: many(submissionVersions),
	user_correspondingAuthorId: one(users, {
		fields: [submissions.correspondingAuthorId],
		references: [users.id],
		relationName: "submissions_correspondingAuthorId_users_id"
	}),
	user_decisionBy: one(users, {
		fields: [submissions.decisionBy],
		references: [users.id],
		relationName: "submissions_decisionBy_users_id"
	}),
	volumesIssue: one(volumesIssues, {
		fields: [submissions.issueId],
		references: [volumesIssues.id]
	}),
}));

export const publicationsRelations = relations(publications, ({one}) => ({
	volumesIssue: one(volumesIssues, {
		fields: [publications.issueId],
		references: [volumesIssues.id]
	}),
	submission: one(submissions, {
		fields: [publications.submissionId],
		references: [submissions.id]
	}),
}));

export const volumesIssuesRelations = relations(volumesIssues, ({many}) => ({
	publications: many(publications),
	submissions: many(submissions),
}));

export const reviewAssignmentsRelations = relations(reviewAssignments, ({one, many}) => ({
	user_assignedBy: one(users, {
		fields: [reviewAssignments.assignedBy],
		references: [users.id],
		relationName: "reviewAssignments_assignedBy_users_id"
	}),
	user_reviewerId: one(users, {
		fields: [reviewAssignments.reviewerId],
		references: [users.id],
		relationName: "reviewAssignments_reviewerId_users_id"
	}),
	submission: one(submissions, {
		fields: [reviewAssignments.submissionId],
		references: [submissions.id]
	}),
	submissionVersion: one(submissionVersions, {
		fields: [reviewAssignments.versionId],
		references: [submissionVersions.id]
	}),
	reviews: many(reviews),
}));

export const submissionVersionsRelations = relations(submissionVersions, ({one, many}) => ({
	reviewAssignments: many(reviewAssignments),
	submissionFiles: many(submissionFiles),
	submission: one(submissions, {
		fields: [submissionVersions.submissionId],
		references: [submissions.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	reviewAssignment: one(reviewAssignments, {
		fields: [reviews.assignmentId],
		references: [reviewAssignments.id]
	}),
}));

export const submissionAuthorsRelations = relations(submissionAuthors, ({one}) => ({
	submission: one(submissions, {
		fields: [submissionAuthors.submissionId],
		references: [submissions.id]
	}),
}));

export const submissionEditorsRelations = relations(submissionEditors, ({one}) => ({
	user: one(users, {
		fields: [submissionEditors.editorId],
		references: [users.id]
	}),
	submission: one(submissions, {
		fields: [submissionEditors.submissionId],
		references: [submissions.id]
	}),
}));

export const submissionFilesRelations = relations(submissionFiles, ({one}) => ({
	submissionVersion: one(submissionVersions, {
		fields: [submissionFiles.versionId],
		references: [submissionVersions.id]
	}),
}));

export const userInvitationsRelations = relations(userInvitations, ({one}) => ({
	user: one(users, {
		fields: [userInvitations.invitedBy],
		references: [users.id]
	}),
}));

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id]
	}),
}));