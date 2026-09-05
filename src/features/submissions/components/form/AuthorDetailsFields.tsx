import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, User, Mail, Phone, Briefcase, School, BookOpen, Tag } from "lucide-react";
import type { FormValues } from "../../schemas/submission.schema";

interface AuthorDetailsFieldsProps {
    form: UseFormReturn<FormValues>;
}

export function AuthorDetailsFields({ form }: AuthorDetailsFieldsProps) {
    return (
        <div className="space-y-6 sm:space-y-8">
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-primary" />
                            <FormLabel className="form-label-brand">Research Paper Title</FormLabel>
                        </div>
                        <FormControl>
                            <Input
                                placeholder="Full title of your research paper..."
                                {...field}
                                value={field.value ?? ""}
                                className="input-standard"
                            />
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-destructive px-1" />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="authorName"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-primary" />
                                <FormLabel className="form-label-brand">Author Name</FormLabel>
                            </div>
                            <FormControl>
                                <Input
                                    placeholder="Full Name"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="input-standard"
                                />
                            </FormControl>
                            <FormMessage className="text-xs font-medium text-destructive px-1" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="authorEmail"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Mail className="w-4 h-4 text-primary" />
                                <FormLabel className="form-label-brand">Email Address</FormLabel>
                            </div>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="email@example.com"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="input-standard"
                                />
                            </FormControl>
                            <FormMessage className="text-xs font-medium text-destructive px-1" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="authorPhone"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Phone className="w-4 h-4 text-primary" />
                                <FormLabel className="form-label-brand">Phone Number (Optional)</FormLabel>
                            </div>
                            <FormControl>
                                <Input
                                    type="tel"
                                    placeholder="+1 234 567 890"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="input-standard"
                                />
                            </FormControl>
                            <FormMessage className="text-xs font-medium text-destructive px-1" />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="authorDesignation"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-primary" />
                                <FormLabel className="form-label-brand">Designation</FormLabel>
                            </div>
                            <FormControl>
                                <Input
                                    placeholder="e.g. Professor"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="input-standard"
                                />
                            </FormControl>
                            <FormMessage className="text-xs font-medium text-destructive px-1" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="affiliation"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <School className="w-4 h-4 text-primary" />
                                <FormLabel className="form-label-brand">Affiliation / Institution</FormLabel>
                            </div>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Department, University, City, Country"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="input-standard"
                                />
                            </FormControl>
                            <FormMessage className="text-xs font-medium text-destructive px-1" />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="abstract"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <FormLabel className="form-label-brand">Abstract</FormLabel>
                        </div>
                        <FormControl>
                            <Textarea
                                placeholder="Summarize your research paper here..."
                                className="bg-muted/20 border-border/50 rounded-lg font-medium text-foreground p-4 resize-none min-h-[150px] text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-primary/30 transition-all leading-relaxed"
                                {...field}
                                value={field.value ?? ""}
                            />
                        </FormControl>
                        <div className="flex justify-between items-center px-1">
                            <FormDescription className="text-meta uppercase font-bold tracking-tight">Requirement: 100 - 500 Words</FormDescription>
                            <span className="text-meta font-bold text-primary uppercase">{(field.value || "").length} Characters</span>
                        </div>
                        <FormMessage className="text-xs font-medium text-destructive px-1" />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Tag className="w-4 h-4 text-primary" />
                            <FormLabel className="form-label-brand">Keywords</FormLabel>
                        </div>
                        <FormControl>
                            <Input
                                placeholder="e.g., AI, Machine Learning, Metallurgy..."
                                {...field}
                                value={field.value ?? ""}
                                className="input-standard"
                            />
                        </FormControl>
                        <FormDescription className="text-meta font-bold uppercase px-1">Separate keywords with commas.</FormDescription>
                        <FormMessage className="text-xs font-medium text-destructive px-1" />
                    </FormItem>
                )}
            />
        </div>
    );
}
