'use client';

import { useCallback, useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { submitPaper } from "@/actions/submit-paper";
import { type ActionResponse } from "@/db/types";
import { useSettingsContext } from "@/components/providers/SettingsContext";
import { formSchema, type FormValues } from "../schemas/submission.schema";
import { SubmissionSuccessCard } from "./form/SubmissionSuccessCard";
import { AuthorDetailsFields } from "./form/AuthorDetailsFields";
import { CoAuthorsSection } from "./form/CoAuthorsSection";
import { ManuscriptUploadDropzone } from "./form/ManuscriptUploadDropzone";

export default function SubmissionForm() {
    const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
    const settings = useSettingsContext();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            authorName: "",
            authorEmail: "",
            authorPhone: "",
            authorDesignation: "",
            affiliation: "",
            abstract: "",
            keywords: "",
            coAuthors: [],
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
            if (key === "coAuthors") {
                formData.append(key, JSON.stringify(value));
            } else if (key === "termsAccepted") {
                formData.append(key, value ? "on" : "off");
            } else {
                formData.append(key, value as string);
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
                <AuthorDetailsFields form={form} />
                <CoAuthorsSection control={form.control} />
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
