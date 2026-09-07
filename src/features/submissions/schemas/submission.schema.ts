import * as z from "zod";

const phoneRegex = /^[+]?[\d\s\-().]{7,25}$/;

export const coAuthorSchema = z.object({
    name: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().regex(phoneRegex, "Invalid phone number").optional().or(z.literal('')),
    designation: z.string().min(2, "Designation required"),
    institution: z.string().min(2, "Institution required"),
});

export const formSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    authorName: z.string().min(2, "Author name must be at least 2 characters"),
    authorEmail: z.string().email("Invalid email address"),
    authorPhone: z.string().regex(phoneRegex, "Invalid phone number (e.g., +91 9876543210)").optional().or(z.literal('')),
    authorDesignation: z.string().min(2, "Designation required"),
    affiliation: z.string().min(2, "Affiliation must be at least 2 characters"),
    abstract: z.string().min(50, "Abstract must be at least 50 characters"),
    keywords: z.string().min(5, "Please provide keywords for your research"),
    coAuthors: z.array(coAuthorSchema).max(5, "Maximum 5 authors allowed").optional(),
    termsAccepted: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and guidelines"
    }),
});

export type FormValues = z.infer<typeof formSchema>;
export type CoAuthorValues = z.infer<typeof coAuthorSchema>;
