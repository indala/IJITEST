'use client';

import { useCallback, useActionState, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { submitPaper } from "@/actions/submit-paper";
import { getSections } from "@/actions/sections";
import { type ActionResponse, type Section } from "@/db/types";
import { useSettingsContext } from "@/components/providers/SettingsContext";
import { formSchema, type FormValues } from "../schemas/submission.schema";
import { SubmissionSuccessCard } from "./form/SubmissionSuccessCard";
import { AuthorDetailsFields } from "./form/AuthorDetailsFields";
import { CoAuthorsSection } from "./form/CoAuthorsSection";
import { ReviewerSuggestionsSection } from "./form/ReviewerSuggestionsSection";
import { ManuscriptUploadDropzone } from "./form/ManuscriptUploadDropzone";

interface SubmissionFormProps {
    initialSections?: Section[] | undefined;
}

export default function SubmissionForm({ initialSections }: SubmissionFormProps) {
    const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
    const [sections, setSections] = useState<Section[]>(initialSections || []);
    const settings = useSettingsContext();

    useEffect(() => {
        if (!initialSections || initialSections.length === 0) {
            getSections().then((res) => {
                if (res.success && res.data) {
                    setSections(res.data);
                }
            }).catch(console.error);
        }
    }, [initialSections]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            sectionId: "",
            authorName: "",
            authorEmail: "",
            authorPhone: "",
            authorDesignation: "",
            affiliation: "",
            abstract: "",
            keywords: "",
            coAuthors: [],
            reviewerSuggestions: [],
            termsAccepted: false,
        },
    });

    const [localState, setLocalState] = useState<ActionResponse<{ paperId: string }> | null>(null);

    const [, formAction, isPending] = useActionState(
        async (_prevState: ActionResponse<{ paperId: string }> | null, data: FormData): Promise<ActionResponse<{ paperId: string }> | null> => {
            setLocalState(null);
            const result = await submitPaper(data);
            if (result.success) {
                toast.success("Form submitted check your mail", {
                    className: "bg-linear-to-r from-emerald-500 to-emerald-600 border-none text-white px-6 py-4 rounded-2xl shadow-xl shadow-emerald-500/20",
                });
                form.reset();
                setManuscriptFile(null);
            } else if (result.error) {
                toast.error(result.error);
            }
            setLocalState(result);
            return result;
        },
        null
    );

    const onSubmit = useCallback(async (values: FormValues) => {
        if (!manuscriptFile) {
            toast.error("Manuscript Missing", {
                description: "Primary research document is required."
            });
            return;
        }

        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") return;
            if (key === "coAuthors") {
                formData.append(key, JSON.stringify(value));
            } else if (key === "reviewerSuggestions") {
                if (Array.isArray(value) && value.length > 0) {
                    formData.append(key, JSON.stringify(value));
                }
            } else if (key === "termsAccepted") {
                formData.append(key, value ? "on" : "off");
            } else {
                formData.append(key, String(value));
            }
        });
        
        formData.append("manuscript", manuscriptFile);

        formAction(formData);
    }, [manuscriptFile, formAction]);

    const onInvalid = useCallback(() => {
        toast.error("Please fill missing forms", {
            className: "bg-linear-to-r from-rose-500 to-rose-600 border-none text-white px-6 py-4 rounded-2xl shadow-xl shadow-rose-500/20",
        });
    }, []);

    const handleManuscriptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && !file.name.toLowerCase().endsWith('.docx')) {
            toast.error("Invalid File Type", {
                description: "Only .docx files are accepted for manuscripts as per journal policy."
            });
            e.target.value = '';
            setManuscriptFile(null);
            return;
        }
        setManuscriptFile(file);
    }, []);

    if (localState?.success) {
        return (
            <SubmissionSuccessCard
                paperId={localState.data?.paperId}
                onReset={() => setLocalState(null)}
            />
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8 sm:space-y-12">
                <AuthorDetailsFields form={form} sections={sections} />
                <CoAuthorsSection control={form.control} />
                <ReviewerSuggestionsSection control={form.control} />
                <ManuscriptUploadDropzone
                    control={form.control}
                    manuscriptFile={manuscriptFile}
                    onManuscriptChange={handleManuscriptChange}
                    templateUrl={settings['templateUrl']}
                    isPending={isPending}
                />
            </form>
        </Form>
    );
}
