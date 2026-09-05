import * as z from "zod";

export const coAuthorSchema = z.object({
    name: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional().or(z.literal('')),
    designation: z.string().min(2, "Designation required"),
    institution: z.string().min(2, "Institution required"),
});

export const formSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    authorName: z.string().min(2, "Author name must be at least 2 characters"),
    authorEmail: z.string().email("Invalid email address"),
    authorPhone: z.string().optional().or(z.literal('')),
    authorDesignation: z.string().min(2, "Designation required"),
    affiliation: z.string().min(5, "Affiliation must be at least 5 characters"),
    abstract: z.string().min(100, "Abstract must be at least 100 characters"),
    keywords: z.string().min(10, "Provide at least 5 keywords"),
    coAuthors: z.array(coAuthorSchema).max(5, "Maximum 5 authors allowed").optional(),
    termsAccepted: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and guidelines"
    }),
});

export type FormValues = z.infer<typeof formSchema>;
export type CoAuthorValues = z.infer<typeof coAuthorSchema>;
