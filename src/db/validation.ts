import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
    users,
    userProfiles,
    submissions,
    submissionVersions,
    submissionAuthors,
    applications,
    contactMessages
} from "./schema";
import { z } from "zod";

// 👤 User & Profile Validation
export const insertUserSchema = createInsertSchema(users, {
    email: z.email("Invalid email address"),
});

export const insertProfileSchema = createInsertSchema(userProfiles, {
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
    orcidId: z.string().regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, "Invalid ORCID iD format").optional().nullable(),
});

// 📄 Submission Validation
export const insertSubmissionSchema = createInsertSchema(submissions);

export const insertVersionSchema = createInsertSchema(submissionVersions, {
    title: z.string().min(5, "Title is too short").max(500, "Title is too long"),
    abstract: z.string().min(50, "Abstract must be at least 50 characters").max(5000, "Abstract is too long"),
});

export const insertAuthorSchema = createInsertSchema(submissionAuthors, {
    email: z.email("Invalid author email"),
});

// 📩 Application Validation
export const insertApplicationSchema = createInsertSchema(applications, {
    email: z.email("Invalid application email"),
    fullName: z.string().min(3, "Full name required"),
});

// 📬 Contact Validation
export const insertContactSchema = createInsertSchema(contactMessages, {
    email: z.email("Invalid contact email"),
    message: z.string().min(10, "Message is too short"),
});

// 🔍 Select Schemas (Useful for type-safe filtering/querying)
export const selectUserSchema = createSelectSchema(users);
export const selectProfileSchema = createSelectSchema(userProfiles);
export const selectSubmissionSchema = createSelectSchema(submissions);
