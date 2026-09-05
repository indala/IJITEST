import Link from "next/link";
import { type Control } from "react-hook-form";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Check, Upload, Loader2, ChevronRight } from "lucide-react";
import type { FormValues } from "../../schemas/submission.schema";
import type { JournalSettings } from "@/db/types";

interface ManuscriptUploadDropzoneProps {
    control: Control<FormValues>;
    manuscriptFile: File | null;
    onManuscriptChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    templateUrl?: JournalSettings['templateUrl'];
    isPending: boolean;
}

export function ManuscriptUploadDropzone({
    control,
    manuscriptFile,
    onManuscriptChange,
    templateUrl,
    isPending,
}: ManuscriptUploadDropzoneProps) {
    return (
        <>
            {/* Upload Infrastructure - Manuscript Upload */}
            <div className="pt-10 border-t border-border/50">
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 ml-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                                <FileText className="w-5 h-5" />
                            </div>
                            <FormLabel className="form-label-brand m-0">
                                Manuscript Upload
                            </FormLabel>
                        </div>
                        {templateUrl && (
                            <Button asChild variant="ghost" size="sm" className="h-8 text-primary font-bold text-label hover:bg-primary/5">
                                <a href={templateUrl} download>
                                    <Download className="w-3 h-3 mr-2" />
                                    Template
                                </a>
                            </Button>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            type="file"
                            onChange={onManuscriptChange}
                            className="hidden"
                            id="manuscript-upload"
                            accept=".docx"
                        />
                        <label
                            htmlFor="manuscript-upload"
                            className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-xl transition-all cursor-pointer shadow-sm relative overflow-hidden ${
                                manuscriptFile
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5"
                            }`}
                        >
                            {manuscriptFile ? (
                                <div className="text-center px-4">
                                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-semibold text-gray-900 truncate max-w-[200px]">{manuscriptFile.name}</p>
                                    <p className="text-[10px] font-bold text-primary/60 uppercase mt-1">Ready to upload</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-muted/20 border border-border/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-5 h-5 text-primary/40" />
                                    </div>
                                    <p className="text-xs font-semibold text-gray-900">Upload Research Paper</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">DOCX Only</p>
                                </div>
                            )}
                        </label>
                    </div>
                </div>
            </div>

            {/* Terms and Submission Control */}
            <div className="space-y-8 pt-10 border-t border-border/50">
                <FormField
                    control={control}
                    name="termsAccepted"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-4 space-y-0 p-6 rounded-xl bg-muted/20 border border-border/50 shadow-sm">
                            <FormControl>
                                <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                    className="w-5 h-5 rounded border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                />
                            </FormControl>
                            <div className="space-y-1 m-0!">
                                <div className="flex flex-wrap items-center gap-x-1.5 text-xs font-medium text-foreground">
                                    <span>I verify that I have read the</span>
                                    <Link href="/guidelines" target="_blank" className="text-primary font-bold hover:underline">
                                        Guidelines
                                    </Link>
                                    <span>and comply with all</span>
                                    <Link href="/guidelines#terms" target="_blank" className="text-primary font-bold hover:underline">
                                        Terms of Use
                                    </Link>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                    Mandatory verification for all research submissions.
                                </p>
                            </div>
                            <FormMessage className="text-[10px] font-bold text-destructive px-2" />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-12 btn-primary rounded-xl active:scale-[0.99] shadow-md"
                >
                    {isPending ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing Submission...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            Complete Submission
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    )}
                </Button>
            </div>
        </>
    );
}
