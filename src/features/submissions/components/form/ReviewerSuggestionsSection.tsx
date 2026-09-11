import { useFieldArray, type Control } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, ShieldAlert, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import type { FormValues } from "../../schemas/submission.schema";

interface ReviewerSuggestionsSectionProps {
    control: Control<FormValues>;
}

export function ReviewerSuggestionsSection({ control }: ReviewerSuggestionsSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "reviewerSuggestions" as const,
    });

    const addSuggestion = (type: 'suggested' | 'opposed') => {
        if (fields.length >= 6) return;
        append({
            type,
            givenName: "",
            familyName: "",
            email: "",
            affiliation: "",
            orcidId: "",
            suggestionReason: "",
        });
    };

    return (
        <div className="space-y-8 pt-12 border-t border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="m-0">Reviewer Suggestions & Oppositions</h3>
                        <p className="text-xs text-muted-foreground m-0 mt-0.5">
                            Optional: Suggest qualified peers or specify individuals with competing interests.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSuggestion('suggested')}
                        disabled={fields.length >= 6}
                        className="h-9 px-3 rounded-lg border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all shadow-xs"
                    >
                        <ThumbsUp className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                        Suggest Reviewer
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSuggestion('opposed')}
                        disabled={fields.length >= 6}
                        className="h-9 px-3 rounded-lg border-rose-500/30 text-rose-700 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shadow-xs"
                    >
                        <ThumbsDown className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                        Oppose Reviewer
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                    {fields.map((field, index) => {
                        const isOpposed = field.type === 'opposed';
                        return (
                            <motion.div
                                key={field.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className={`relative bg-card border rounded-xl overflow-hidden transition-all p-1 shadow-xs ${
                                    isOpposed ? 'border-rose-300 dark:border-rose-900/60' : 'border-emerald-300 dark:border-emerald-900/60'
                                }`}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="absolute top-3 right-3 text-destructive hover:bg-destructive/5 rounded-lg transition-all z-20 h-8 w-8"
                                        aria-label="Remove suggestion"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>

                                    <CardContent className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
                                            {isOpposed ? (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold">
                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                    Opposed Reviewer
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                    Preferred Reviewer
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            <FormField
                                                control={control}
                                                name={`reviewerSuggestions.${index}.givenName`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium">First / Given Name *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="First Name" {...f} value={f.value ?? ""} className="input-standard h-9 text-xs" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name={`reviewerSuggestions.${index}.familyName`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium">Last / Family Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Last Name" {...f} value={f.value ?? ""} className="input-standard h-9 text-xs" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <FormField
                                                control={control}
                                                name={`reviewerSuggestions.${index}.email`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium">Email Address *</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="email@institution.edu" {...f} value={f.value ?? ""} className="input-standard h-9 text-xs" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name={`reviewerSuggestions.${index}.affiliation`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium">Institution / Affiliation</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="University / Organization" {...f} value={f.value ?? ""} className="input-standard h-9 text-xs" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <FormField
                                                control={control}
                                                name={`reviewerSuggestions.${index}.orcidId`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium">ORCID iD (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="0000-0002-1825-0097" {...f} value={f.value ?? ""} className="input-standard h-9 text-xs font-mono" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name={`reviewerSuggestions.${index}.suggestionReason`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-medium">
                                                            {isOpposed ? "Reason for Opposition *" : "Reason / Expertise"}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={isOpposed ? "e.g., Direct competitor, financial COI" : "e.g., Domain expert in robotics"}
                                                                {...f}
                                                                value={f.value ?? ""}
                                                                className="input-standard h-9 text-xs"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {fields.length === 0 && (
                <div className="py-8 border-2 border-dashed border-border/50 rounded-xl bg-muted/10 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-10 h-10 bg-card border border-border/50 rounded-xl flex items-center justify-center text-muted-foreground/40 mb-3 shadow-xs">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <h4 className="m-0 text-sm">No Reviewer Preferences Added</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                        Optional. You may recommend qualified experts or list opposed reviewers with conflicts of interest. The editorial desk will review your suggestions.
                    </p>
                </div>
            )}
        </div>
    );
}
