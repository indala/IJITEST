import { useFieldArray, type Control } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2 } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import type { FormValues } from "../../schemas/submission.schema";

interface CoAuthorsSectionProps {
    control: Control<FormValues>;
}

export function CoAuthorsSection({ control }: CoAuthorsSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "coAuthors" as const,
    });

    return (
        <div className="space-y-8 pt-12 border-t border-border/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
                        <Users className="w-5 h-5" />
                    </div>
                    <h3 className="m-0">Co-Authors</h3>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ name: "", email: "", phone: "", designation: "", institution: "" })}
                    disabled={fields.length >= 5}
                    className="h-10 px-4 rounded-lg border-border/50 text-primary font-bold text-label hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Author
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence>
                    {fields.map((field, index) => (
                        <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="relative bg-card border border-border/50 shadow-sm rounded-xl overflow-hidden transition-all p-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="absolute top-4 right-4 text-destructive hover:bg-destructive/5 rounded-lg transition-all z-20"
                                    aria-label="Remove co-author"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <CardContent className="p-6 sm:p-8 space-y-6">
                                    <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="m-0">Author Details</h4>
                                            <p className="text-label text-muted-foreground">Affiliated contributor</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <FormField
                                            control={control}
                                            name={`coAuthors.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Full Name" {...field} value={field.value ?? ""} className="input-standard h-10 shadow-none" aria-label={`Co-author ${index + 1} name`} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name={`coAuthors.${index}.email`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="email" placeholder="Email Address" {...field} value={field.value ?? ""} className="input-standard h-10 shadow-none" aria-label={`Co-author ${index + 1} email`} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <FormField
                                                control={control}
                                                name={`coAuthors.${index}.phone`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="tel" placeholder="Phone (Optional)" {...field} value={field.value ?? ""} className="input-standard h-10 shadow-none" aria-label={`Co-author ${index + 1} phone`} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name={`coAuthors.${index}.designation`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Designation" {...field} value={field.value ?? ""} className="input-standard h-10 shadow-none" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={control}
                                            name={`coAuthors.${index}.institution`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Institution / Organization" {...field} value={field.value ?? ""} className="input-standard h-10 shadow-none" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {fields.length === 0 && (
                <div className="py-12 border-2 border-dashed border-border/50 rounded-xl bg-muted/20 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-12 h-12 bg-card border border-border/50 rounded-xl flex items-center justify-center text-muted-foreground/30 mb-4 shadow-sm">
                        <Users className="w-6 h-6" />
                    </div>
                    <h4 className="m-0">Single Author Submission</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-xs mt-1">
                        No co-authors listed. Up to 5 allowed.
                    </p>
                </div>
            )}
        </div>
    );
}
