import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, int, varchar, foreignKey, text, timestamp, unique, mysqlEnum, index, decimal, date, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const userIdMapping = mysqlTable("_user_id_mapping", {
	oldId: int("old_id").notNull(),
	newUuid: varchar("new_uuid", { length: 36 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.oldId], name: "_user_id_mapping_old_id"}),
]);

export const activityLogs = mysqlTable("activity_logs", {
	id: int().autoincrement().notNull(),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: varchar("entity_id", { length: 255 }).notNull(),
	action: varchar({ length: 100 }).notNull(),
	performedBy: varchar("performed_by", { length: 36 }).references(() => users.id),
	metadata: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "activity_logs_id"}),
]);

export const applicationInterests = mysqlTable("application_interests", {
	id: int().autoincrement().notNull(),
	applicationId: int("application_id").notNull().references(() => applications.id, { onDelete: "cascade" } ),
	interestId: int("interest_id").notNull().references(() => masterInterests.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.id], name: "application_interests_id"}),
]);

export const applications = mysqlTable("applications", {
	id: int().autoincrement().notNull(),
	type: mysqlEnum(['reviewer','editor']).notNull(),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	designation: varchar({ length: 255 }).notNull(),
	institute: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['pending','approved','rejected']).default('pending').notNull(),
	reviewedBy: varchar("reviewed_by", { length: 36 }).references(() => users.id),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	cvUrl: varchar("cv_url", { length: 500 }),
	photoUrl: varchar("photo_url", { length: 500 }),
	nationality: varchar({ length: 100 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "applications_id"}),
	unique("app_email_type_unique").on(table.email, table.type),
]);

export const contactMessages = mysqlTable("contact_messages", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 255 }),
	message: text().notNull(),
	status: mysqlEnum(['pending','resolved','archived']).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "contact_messages_id"}),
]);

export const masterInterests = mysqlTable("master_interests", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "master_interests_id"}),
	unique("master_interests_name_unique").on(table.name),
]);

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	type: varchar({ length: 50 }).notNull(),
	message: text().notNull(),
	actionLink: varchar("action_link", { length: 255 }),
	isRead: tinyint("is_read").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("notif_user_idx").on(table.userId, table.isRead),
	primaryKey({ columns: [table.id], name: "notifications_id"}),
]);

export const payments = mysqlTable("payments", {
	id: int().autoincrement().notNull(),
	submissionId: int("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" } ),
	amount: decimal({ precision: 10, scale: 2 }).notNull(),
	currency: varchar({ length: 10 }).default('INR').notNull(),
	status: mysqlEnum(['pending','paid','verified','failed','waived']).default('pending').notNull(),
	provider: varchar({ length: 50 }),
	transactionId: varchar("transaction_id", { length: 255 }),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "payments_id"}),
	unique("payments_submission_id_unique").on(table.submissionId),
	unique("payments_transaction_id_unique").on(table.transactionId),
]);

export const publications = mysqlTable("publications", {
	id: int().autoincrement().notNull(),
	submissionId: int("submission_id").notNull().references(() => submissions.id),
	issueId: int("issue_id").notNull().references(() => volumesIssues.id),
	finalPdfUrl: varchar("final_pdf_url", { length: 500 }).notNull(),
	startPage: int("start_page"),
	endPage: int("end_page"),
	doi: varchar({ length: 100 }),
	publishedAt: timestamp("published_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "publications_id"}),
	unique("publications_submission_id_unique").on(table.submissionId),
	unique("publications_doi_unique").on(table.doi),
]);

export const reviewAssignments = mysqlTable("review_assignments", {
	id: int().autoincrement().notNull(),
	submissionId: int("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" } ),
	reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
	versionId: int("version_id").notNull().references(() => submissionVersions.id, { onDelete: "cascade" } ),
	assignedBy: varchar("assigned_by", { length: 36 }).notNull().references(() => users.id),
	reviewRound: int("review_round").default(1).notNull(),
	status: mysqlEnum(['assigned','accepted','declined','completed']).default('assigned').notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	deadline: date({ mode: 'string' }),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
	respondedAt: timestamp("responded_at", { mode: 'string' }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "review_assignments_id"}),
	unique("unique_assignment").on(table.submissionId, table.reviewerId, table.versionId, table.reviewRound),
]);

export const reviews = mysqlTable("reviews", {
	id: int().autoincrement().notNull(),
	assignmentId: int("assignment_id").notNull().references(() => reviewAssignments.id, { onDelete: "cascade" } ),
	decision: mysqlEnum(['accept','minor_revision','major_revision','reject']).notNull(),
	score: int(),
	confidence: int(),
	commentsToAuthor: text("comments_to_author"),
	commentsToEditor: text("comments_to_editor"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "reviews_id"}),
	unique("reviews_assignment_id_unique").on(table.assignmentId),
]);

export const settings = mysqlTable("settings", {
	settingKey: varchar("setting_key", { length: 100 }).notNull(),
	settingValue: text("setting_value"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.settingKey], name: "settings_setting_key"}),
]);

export const submissionAuthors = mysqlTable("submission_authors", {
	id: int().autoincrement().notNull(),
	submissionId: int("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	isCorresponding: tinyint("is_corresponding").default(0).notNull(),
	orderIndex: int("order_index").default(0).notNull(),
	phone: varchar({ length: 20 }),
	designation: varchar({ length: 255 }),
	institution: varchar({ length: 500 }),
},
(table) => [
	index("sub_author_idx").on(table.submissionId),
	index("author_order_idx").on(table.submissionId, table.orderIndex),
	primaryKey({ columns: [table.id], name: "submission_authors_id"}),
]);

export const submissionEditors = mysqlTable("submission_editors", {
	submissionId: int("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" } ),
	editorId: varchar("editor_id", { length: 36 }).notNull().references(() => users.id),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.submissionId, table.editorId], name: "submission_editors_submission_id_editor_id"}),
]);

export const submissionFiles = mysqlTable("submission_files", {
	id: int().autoincrement().notNull(),
	versionId: int("version_id").notNull().references(() => submissionVersions.id, { onDelete: "cascade" } ),
	fileType: mysqlEnum("file_type", ['main_manuscript','pdf_version','copyright_form','supplementary','feedback','payment_proof']).notNull(),
	fileUrl: varchar("file_url", { length: 500 }).notNull(),
	originalName: varchar("original_name", { length: 255 }),
	fileSize: int("file_size"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("file_version_idx").on(table.versionId),
	primaryKey({ columns: [table.id], name: "submission_files_id"}),
]);

export const submissionVersions = mysqlTable("submission_versions", {
	id: int().autoincrement().notNull(),
	submissionId: int("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" } ),
	versionNumber: int("version_number").default(1).notNull(),
	title: text().notNull(),
	abstract: text(),
	keywords: text(),
	subjectArea: varchar("subject_area", { length: 255 }),
	changelog: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "submission_versions_id"}),
	unique("submission_version_unique").on(table.submissionId, table.versionNumber),
]);

export const submissions = mysqlTable("submissions", {
	id: int().autoincrement().notNull(),
	paperId: varchar("paper_id", { length: 100 }).notNull(),
	slug: varchar({ length: 255 }),
	status: mysqlEnum(['submitted','editor_assigned','under_review','revision_requested','accepted','rejected','payment_pending','published']).default('submitted').notNull(),
	finalDecision: mysqlEnum("final_decision", ['accept','reject','withdrawn']),
	decisionAt: timestamp("decision_at", { mode: 'string' }),
	decisionBy: varchar("decision_by", { length: 36 }).references(() => users.id),
	correspondingAuthorId: varchar("corresponding_author_id", { length: 36 }).notNull().references(() => users.id),
	issueId: int("issue_id").references(() => volumesIssues.id),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
},
(table) => [
	index("status_idx").on(table.status),
	index("author_idx").on(table.correspondingAuthorId),
	primaryKey({ columns: [table.id], name: "submissions_id"}),
	unique("submissions_paper_id_unique").on(table.paperId),
	unique("submissions_slug_unique").on(table.slug),
]);

export const userInvitations = mysqlTable("user_invitations", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: mysqlEnum(['editor','reviewer','author']).notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	invitedBy: varchar("invited_by", { length: 36 }).references(() => users.id),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "user_invitations_id"}),
	unique("user_invitations_token_unique").on(table.token),
]);

export const userProfiles = mysqlTable("user_profiles", {
	id: int().autoincrement().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	designation: varchar({ length: 255 }),
	institute: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	orcidId: varchar("orcid_id", { length: 50 }),
	nationality: varchar({ length: 100 }).default('India'),
	bio: text(),
	photoUrl: varchar("photo_url", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "user_profiles_id"}),
	unique("user_profiles_user_id_unique").on(table.userId),
]);

export const users = mysqlTable("users", {
	id: varchar({ length: 36 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }),
	role: mysqlEnum(['admin','editor','reviewer','author']).default('author').notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	isEmailVerified: tinyint("is_email_verified").default(0).notNull(),
	emailVerifiedAt: timestamp("email_verified_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	hasSeenPromotion: tinyint("has_seen_promotion").default(0).notNull(),
},
(table) => [
	index("role_idx").on(table.role),
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("users_email_unique").on(table.email),
]);

export const volumesIssues = mysqlTable("volumes_issues", {
	id: int().autoincrement().notNull(),
	volumeNumber: int("volume_number").notNull(),
	issueNumber: int("issue_number").notNull(),
	year: int().notNull(),
	monthRange: varchar("month_range", { length: 100 }),
	status: mysqlEnum(['open','published']).default('open').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "volumes_issues_id"}),
	unique("vol_issue_year").on(table.volumeNumber, table.issueNumber, table.year),
]);
