"use client";

import { Trash2, Loader2 } from "lucide-react";
import { deleteSubmissionPermanently } from "@/actions/submissions";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteSubmissionButtonProps {
    submissionId: number;
    variant?: "icon" | "full";
}

export default function DeleteSubmissionButton({ submissionId, variant = "icon" }: DeleteSubmissionButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("DANGER: This will permanently delete this submission and all associated files. This cannot be undone. Proceed?")) {
            return;
        }

        setLoading(true);
        try {
            const res = await deleteSubmissionPermanently(submissionId);
            if (res.success) {
                if (variant === "full") {
                    router.push("/admin/submissions");
                } else {
                    router.refresh();
                }
            } else {
                alert(res.error || "Failed to delete submission");
            }
        } catch (error) {
            alert("An error occurred while deleting the submission");
        } finally {
            setLoading(false);
        }
    }

    if (variant === "full") {
        return (
            <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white text-red-400 py-3 rounded-xl font-bold border border-red-50 hover:bg-red-50 hover:text-red-500 transition-all text-xs disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
                Permanent Delete (Junk)
            </button>
        );
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-3 bg-red-50 text-red-300 rounded-xl hover:bg-red-100 hover:text-red-500 transition-all disabled:opacity-50"
            title="Permanently Delete"
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Trash2 className="w-5 h-5" />
            )}
        </button>
    );
}
