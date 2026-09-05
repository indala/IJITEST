import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Submission } from "@/db/types";

interface SubmissionSuccessCardProps {
    paperId?: Submission['paperId'] | undefined;
    onReset: () => void;
}

export function SubmissionSuccessCard({ paperId, onReset }: SubmissionSuccessCardProps) {
    return (
        <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/5 text-primary rounded-xl flex items-center justify-center border border-primary/10 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2 text-center">
                <h2 className="m-0">Submission Successful</h2>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Your paper has been successfully submitted. We have sent a confirmation email to the primary author.
                </p>
                {paperId && (
                    <p className="text-xs font-bold text-primary mt-4">
                        Submission ID: {paperId}
                    </p>
                )}
            </div>
            <Button
                onClick={onReset}
                variant="outline"
                className="h-10 px-6 rounded-lg border-border/50 text-primary hover:bg-primary/5 font-semibold text-xs transition-all"
            >
                Submit Another Paper
            </Button>
        </div>
    );
}
