"use client";

import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useActionState, useState } from 'react';
import { contactSchema, type ContactFormData } from "@/lib/validations/contact";
import { submitContactMessage } from '@/actions/messages';
import { type ActionResponse } from '@/db/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

export default function ContactForm() {
    const [success, setSuccess] = useState(false);

    const [state, formAction, isPending] = useActionState(
        async (_prevState: ActionResponse | null, data: FormData): Promise<ActionResponse | null> => {
            const result = await submitContactMessage(data);
            if (result.success) {
                setSuccess(true);
            }
            return result;
        },
        null
    );

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = useCallback(async (values: ContactFormData) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formAction(formData);
    }, [formAction]);

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4 animate-in fade-in zoom-in duration-500 bg-white rounded-xl border border-primary/10 shadow-2xs">
                <div className="size-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner border border-emerald-100">
                    <CheckCircle className="size-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="m-0 font-bold">Message <span className="text-emerald-600">Transmitted</span></h3>
                    <p className="text-muted-foreground max-w-md mx-auto m-0">Our editorial team will get back to you within 24-48 hours via email.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setSuccess(false);
                    form.reset();
                  }} 
                  className="rounded-lg border border-primary/15 text-primary hover:bg-primary/5 font-bold text-xs mt-2 px-4 py-2 transition-all cursor-pointer"
                >
                  Send another message
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="m-0">Direct Enquiry Form</h3>
                <p className="text-muted-foreground m-0 text-xs">Fill out the form below and we will get back to you shortly.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5 text-left">
                                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-0.5">Full Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="h-10 bg-white border-border/70 rounded-lg text-primary text-xs focus-visible:ring-primary/20 shadow-2xs px-3" placeholder="Author Name" />
                                    </FormControl>
                                    <FormMessage className="text-xs font-bold text-rose-500 px-1" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5 text-left">
                                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-0.5">Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} className="h-10 bg-white border-border/70 rounded-lg text-primary text-xs focus-visible:ring-primary/20 shadow-2xs px-3" placeholder="researcher@university.edu" />
                                    </FormControl>
                                    <FormMessage className="text-xs font-bold text-rose-500 px-1" />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5 text-left">
                                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-0.5">Subject</FormLabel>
                                <FormControl>
                                    <Input {...field} className="h-10 bg-white border-border/70 rounded-lg text-primary text-xs focus-visible:ring-primary/20 shadow-2xs px-3" placeholder="Status Inquiry for Paper ID: IJITEST-X" />
                                </FormControl>
                                <FormMessage className="text-xs font-bold text-rose-500 px-1" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5 text-left">
                                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-0.5">Message Content</FormLabel>
                                <FormControl>
                                    <Textarea {...field} rows={4} className="bg-white border-border/70 rounded-lg text-primary text-xs focus-visible:ring-primary/20 shadow-2xs p-3 resize-none" placeholder="Provide details of your inquiry here..." />
                                </FormControl>
                                <FormMessage className="text-xs font-bold text-rose-500 px-1" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-10 bg-primary text-white rounded-lg font-bold text-xs shadow-xs hover:bg-primary/95 transition-all cursor-pointer"
                    >
                        {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                Transmitting <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                Submit Message <Send className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </Button>

                    {state && !state.success && (
                        <p className="text-rose-500 text-center font-bold text-xs m-0">
                            {state.error || "Failed to transmit. Please try again."}
                        </p>
                    )}
                </form>
            </Form>
        </div>
    );
}
