"use client";

import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useActionState, useState, useEffect } from 'react';
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
    const [state, formAction, isPending] = useActionState(
        async (_prevState: ActionResponse | null, data: FormData): Promise<ActionResponse | null> => {
            const result = await submitContactMessage(data);
            return result;
        },
        null
    );

    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (state) {
            if (state.success) {
                setSuccess(true);
            }
        }
    }, [state]);

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
            <div className="flex flex-col items-center justify-center p-6 xl:p-8 2xl:p-10 text-center space-y-4 xl:space-y-6 animate-in fade-in zoom-in duration-500 bg-white rounded-2xl border border-primary/5 shadow-sm">
                <div className="size-12 xxl:size-16 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner border border-emerald-100">
                    <CheckCircle className="size-6 xl:size-8" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-primary text-base sm:text-lg xl:text-xl 2xl:text-2xl lowercase">message <span className="text-emerald-600">transmitted</span></h3>
                    <p className="text-primary/60 font-medium max-w-xs xl:max-w-md mx-auto text-[10px] xl:text-xs 2xl:text-sm leading-relaxed lowercase">our editorial team will get back to you within 24-48 hours via email.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setSuccess(false);
                    form.reset();
                  }} 
                  className="rounded-lg border border-primary/10 text-primary hover:bg-primary/5 font-bold lowercase text-[10px] xl:text-xs 2xl:text-sm mt-2 px-4 py-2 xl:px-6 xl:py-3 transition-all"
                >
                  send another message
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 xl:space-y-6">
            <div>
                <h3 className="font-bold text-primary text-base sm:text-lg xl:text-xl 2xl:text-2xl">Direct enquiry form</h3>
                <p className="text-primary/60 text-[10px] xl:text-xs 2xl:text-sm font-medium mt-0.5 lowercase">fill out the form below and we&apos;ll get back to you shortly.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6 xl:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 xl:gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-2 text-left">
                                    <FormLabel className="text-xs sm:text-sm xl:text-base 2xl:text-lg text-primary/70 uppercase tracking-widest pl-1">Full Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="h-12 xl:h-14 2xl:h-16 bg-white border-slate-200 rounded-xl text-primary text-sm xl:text-base 2xl:text-lg focus-visible:ring-primary/20 shadow-sm px-4 2xl:px-6" placeholder="Author Name" />
                                    </FormControl>
                                    <FormMessage className="text-[10px] xl:text-xs 2xl:text-sm font-bold text-rose-500 px-1" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-2 text-left">
                                    <FormLabel className="text-xs sm:text-sm xl:text-base 2xl:text-lg text-primary/70 uppercase tracking-widest pl-1">Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} className="h-12 xl:h-14 2xl:h-16 bg-white border-slate-200 rounded-xl text-primary text-sm xl:text-base 2xl:text-lg focus-visible:ring-primary/20 shadow-sm px-4 2xl:px-6" placeholder="researcher@university.edu" />
                                    </FormControl>
                                    <FormMessage className="text-[10px] xl:text-xs 2xl:text-sm font-bold text-rose-500 px-1" />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem className="space-y-2 text-left">
                                <FormLabel className="text-xs sm:text-sm xl:text-base 2xl:text-lg text-primary/70 uppercase tracking-widest pl-1">Subject</FormLabel>
                                <FormControl>
                                    <Input {...field} className="h-12 xl:h-14 2xl:h-16 bg-white border-slate-200 rounded-xl text-primary text-sm xl:text-base 2xl:text-lg focus-visible:ring-primary/20 shadow-sm px-4 2xl:px-6" placeholder="Status Inquiry for Paper ID: IJITEST-X" />
                                </FormControl>
                                <FormMessage className="text-[10px] xl:text-xs 2xl:text-sm font-bold text-rose-500 px-1" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem className="space-y-2 text-left">
                                <FormLabel className="text-xs sm:text-sm xl:text-base 2xl:text-lg text-primary/70 uppercase tracking-widest pl-1">Message Content</FormLabel>
                                <FormControl>
                                    <Textarea {...field} rows={5} className="bg-white border-slate-200 rounded-xl text-primary text-sm xl:text-base 2xl:text-lg focus-visible:ring-primary/20 shadow-sm p-4 xl:p-5 2xl:p-6 resize-none" placeholder="Provide details of your inquiry here..." />
                                </FormControl>
                                <FormMessage className="text-[10px] xl:text-xs 2xl:text-sm font-bold text-rose-500 px-1" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-11 xl:h-14 2xl:h-16 bg-primary text-white rounded-lg font-bold text-sm xl:text-base 2xl:text-lg shadow-sm hover:bg-primary/95 transition-all lowercase"
                    >
                        {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                transmitting <Loader2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 animate-spin" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                submit message <Send className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" />
                            </div>
                        )}
                    </Button>

                    {state && !state.success && (
                        <p className="text-rose-500 text-center font-bold text-[10px] xl:text-xs 2xl:text-sm lowercase">
                            {state.error || "failed to transmit. please try again."}
                        </p>
                    )}
                </form>
            </Form>
        </div>
    );
}
