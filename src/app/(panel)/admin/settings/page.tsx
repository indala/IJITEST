"use client";

import {
    Save,
    Globe, 
    FileText, 
    Upload, 
    Shield, 
    CreditCard, 
    Headphones, 
    Sparkles, 
    Layout, 
    ExternalLink,
    Loader2,
    CheckCircle2,
    Mail,
    Activity,
    BarChart3,
    Copy,
    Check
} from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useSettings } from '@/hooks/queries/useSettings';
import { useState, useActionState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { updateSettings, togglePromotionStatus, getSystemTelemetry } from '@/actions/settings';
import type { ActionResponse } from '@/db/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

interface JournalSettings {
    journalName?: string;
    publisherName?: string;
    journalShortName?: string;
    issnNumber?: string;
    apcInr?: string;
    apcUsd?: string;
    apcDescription?: string;
    startingYear?: string;
    publicationFrequency?: string;
    journalLanguage?: string;
    udyamRegistration?: string;
    journalSubject?: string;
    supportEmail?: string;
    supportPhone?: string;
    officeAddress?: string;
    templateUrl?: string;
    copyrightUrl?: string;
    isPromotionActive?: string;
    doiPrefix?: string;
    doiAssignmentMode?: string;
    sushiPlatformId?: string;
    sushiCustomerId?: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            staggerChildren: 0.1,
            duration: 0.8,
            ease: "circOut" 
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

export default function SystemSettings() {
    const { data: settingsData = {}, isLoading: loading } = useSettings();
    const settings = settingsData as JournalSettings;
    const queryClient = useQueryClient();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [selectedCopyright, setSelectedCopyright] = useState<string | null>(null);
    const [isPromotionActive, setIsPromotionActive] = useState<boolean>(true);
    const [isTogglingPromotion, setIsTogglingPromotion] = useState<boolean>(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [telemetry, setTelemetry] = useState<{
        counterMetrics: {
            totalInvestigations: number;
            uniqueInvestigations: number;
            totalRequests: number;
            uniqueRequests: number;
        };
        storageStats: {
            sizeBytes: number;
            sizeMB: number;
            fileCount: number;
        } | null;
        sushiStatus: {
            Description: string;
            Service_Active: boolean;
            Release: string;
        };
    } | null>(null);

    useEffect(() => {
        getSystemTelemetry().then((res) => {
            if (res.success && res.data) {
                setTelemetry(res.data);
            }
        });
    }, []);

    const copyToClipboard = (endpoint: string) => {
        const fullUrl = `${window.location.origin}${endpoint}`;
        navigator.clipboard.writeText(fullUrl);
        setCopiedUrl(endpoint);
        toast.success("SUSHI Endpoint Copied", { description: fullUrl });
        setTimeout(() => setCopiedUrl(null), 2500);
    };

    useEffect(() => {
        if (settings.isPromotionActive !== undefined) {
            setIsPromotionActive(settings.isPromotionActive !== 'false');
        }
    }, [settings.isPromotionActive]);

    const handleTogglePromotion = async (checked: boolean) => {
        setIsPromotionActive(checked);
        setIsTogglingPromotion(true);
        try {
            const res = await togglePromotionStatus(checked);
            if (res.success) {
                toast.success(checked ? "Promotion Modal Enabled" : "Promotion Modal Disabled", {
                    description: checked
                        ? "Visitors will now see the 100% APC Waiver popup on the homepage."
                        : "The promotional popup is now suppressed site-wide."
                });
                queryClient.invalidateQueries({ queryKey: ['settings'] });
            } else {
                setIsPromotionActive(!checked);
                toast.error("Update Failed", {
                    description: res.error || "Failed to update promotion status."
                });
            }
        } catch {
            setIsPromotionActive(!checked);
            toast.error("Update Failed", {
                description: "An unexpected error occurred while toggling promotion status."
            });
        } finally {
            setIsTogglingPromotion(false);
        }
    };

    const [_, formAction, isPending] = useActionState(async (_prevState: ActionResponse | null, formData: FormData) => {
        try {
            const result = await updateSettings(formData);
            if (result.success) {
                toast.success("System Synchronized", {
                    description: "Core environment successfully synchronized & architectural assets locked."
                });
                queryClient.invalidateQueries({ queryKey: ['settings'] });
                setSelectedTemplate(null);
                setSelectedCopyright(null);
            } else {
                toast.error("Synchronization Failed", {
                    description: result.error || "Failed to update core environment."
                });
            }
            return result;
        } catch {
            toast.error("Synchronization Error", {
                description: "An unexpected error occurred during synchronization."
            });
            return { success: false, error: "Unexpected error" };
        }
    }, null);

    const handleSubmit = () => {
        // Validation or pre-submit checks if needed
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
                        <div className="absolute inset-0 w-20 h-20 -m-2 blur-xl bg-primary/20 animate-pulse rounded-full" />
                    </div>
                    <p className="opacity-40 animate-pulse">Accessing System Core...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.section 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6"
        >
            <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
                {/* Header Section */}
                <motion.header 
                    variants={itemVariants}
                    className="relative group p-6 sm:p-8 bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <Badge variant="outline" className="px-3 py-1 rounded-full border-primary/20 text-primary bg-primary/5 text-[9px] font-bold tracking-wider uppercase">
                                Root Administrator Console
                            </Badge>
                            <h1 className="m-0">
                                System <span className="text-primary underline decoration-primary/10 underline-offset-8">Settings</span>
                            </h1>
                            <p className="text-muted-foreground m-0">
                                Configure the bedrock parameters of your journal environment.
                            </p>
                        </div>
                        <div className="flex gap-4 shrink-0">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="h-12 px-8 gap-3 bg-primary text-white font-bold text-[10px] tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group/save"
                            >
                                {isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 group-hover/save:rotate-12 transition-transform" />
                                )}
                                {isPending ? "SYNCING..." : "SYNC PREFERENCES"}
                            </Button>
                        </div>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 2xl:gap-12">
                    {/* Journal Identity */}
                    <motion.div variants={itemVariants}>
                        <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-2xl p-2 transition-all hover:shadow-2xl hover:shadow-primary/5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            <CardHeader className="p-6 pb-2">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-slate-900">Journal Identity</CardTitle>
                                        <CardDescription className="text-slate-500 text-xs">Branding & metadata protocols.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Full Publication Handle</Label>
                                    <Input
                                        name="journalName"
                                        defaultValue={settings.journalName}
                                        className="h-12 bg-white/50 border-slate-200 focus-visible:ring-primary/20 font-bold text-sm shadow-sm rounded-xl px-4 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Publishing Syndicate</Label>
                                    <Input
                                        name="publisherName"
                                        defaultValue={settings.publisherName}
                                        className="h-12 bg-white/50 border-slate-200 focus-visible:ring-primary/20 font-bold text-sm shadow-sm rounded-xl px-4"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">SEO Cipher</Label>
                                        <Input
                                            name="journalShortName"
                                            defaultValue={settings.journalShortName}
                                            className="h-12 bg-white/50 border-slate-200 focus-visible:ring-primary/20 font-black text-sm shadow-sm rounded-xl px-4 tracking-widest"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">ISSN Protocol</Label>
                                        <Input
                                            name="issnNumber"
                                            defaultValue={settings.issnNumber}
                                            className="h-12 bg-white/50 border-slate-200 focus-visible:ring-primary/20 font-bold text-sm font-mono shadow-sm rounded-xl px-4"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2 border-t border-slate-100">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Official DOI Prefix Protocol</Label>
                                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">Registered Prefix</span>
                                        </div>
                                        <Input
                                            name="doiPrefix"
                                            defaultValue={settings.doiPrefix || '10.68139'}
                                            placeholder="e.g. 10.68139"
                                            className="h-12 bg-white/50 border-slate-200 focus-visible:ring-primary/20 font-bold text-sm font-mono shadow-sm rounded-xl px-4"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">DOI Assignment Policy</Label>
                                        <select
                                            name="doiAssignmentMode"
                                            defaultValue={settings.doiAssignmentMode || 'manual'}
                                            className="w-full h-12 bg-white/50 border border-slate-200 focus-visible:ring-2 focus-visible:ring-primary/20 font-medium text-xs rounded-xl px-4 appearance-none outline-none shadow-sm cursor-pointer"
                                        >
                                            <option value="manual">Selective / Manual Mode (Assign per paper to selected articles — Recommended)</option>
                                            <option value="auto">Automatic Mode (Auto-assign 10.68139/[paperId] to all papers on publish)</option>
                                        </select>
                                        <p className="text-[10px] text-slate-500 px-1 leading-relaxed">
                                            In <strong>Selective Mode</strong>, your team decides which accepted papers receive the official CrossRef DOI, a Zenodo DOI, or remain without a DOI. Existing papers are never modified automatically.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Financial Infrastructure */}
                    <motion.div variants={itemVariants}>
                        <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-2xl p-2 transition-all hover:shadow-2xl hover:shadow-emerald-500/5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            <CardHeader className="p-6 pb-2">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-inner">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-slate-900">Econometrics</CardTitle>
                                        <CardDescription className="text-slate-500 text-xs">Transmission fees & parameters.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Domestic (INR)</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-600/50 text-base">₹</span>
                                            <Input
                                                name="apcInr"
                                                defaultValue={settings.apcInr}
                                                className="h-12 bg-white/50 border-slate-200 focus-visible:ring-emerald-500/20 font-black text-lg pl-8 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">International (USD)</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-600/50 text-base">$</span>
                                            <Input
                                                name="apcUsd"
                                                defaultValue={settings.apcUsd}
                                                className="h-12 bg-white/50 border-slate-200 focus-visible:ring-emerald-500/20 font-black text-lg pl-8 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Financial Disclosure Text</Label>
                                    <Textarea
                                        name="apcDescription"
                                        defaultValue={settings.apcDescription}
                                        rows={3}
                                        className="bg-white/50 border-slate-200 focus-visible:ring-emerald-500/20 font-medium text-xs p-4 rounded-xl resize-none min-h-[100px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    {/* Academic Metadata */}
                    <motion.div variants={itemVariants}>
                        <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-2xl p-2 transition-all hover:shadow-2xl hover:shadow-blue-500/5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                            <CardHeader className="p-6 pb-2">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-inner">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-slate-900">Academic Metadata</CardTitle>
                                        <CardDescription className="text-slate-500 text-xs">Scholarly indexing & registration.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Starting Year</Label>
                                        <Input
                                            name="startingYear"
                                            defaultValue={settings.startingYear}
                                            className="h-12 bg-white/50 border-slate-200 focus-visible:ring-blue-500/20 font-bold text-sm rounded-xl px-4"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Frequency</Label>
                                        <Input
                                            name="publicationFrequency"
                                            defaultValue={settings.publicationFrequency}
                                            className="h-12 bg-white/50 border-slate-200 focus-visible:ring-blue-500/20 font-bold text-sm rounded-xl px-4"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Language</Label>
                                        <Input
                                            name="journalLanguage"
                                            defaultValue={settings.journalLanguage}
                                            className="h-12 bg-white/50 border-slate-200 focus-visible:ring-blue-500/20 font-bold text-sm rounded-xl px-4"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">UDYAM / MSME</Label>
                                        <Input
                                            name="udyamRegistration"
                                            defaultValue={settings.udyamRegistration}
                                            className="h-12 bg-white/50 border-slate-200 focus-visible:ring-blue-500/20 font-bold text-sm rounded-xl px-4"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Subject Area</Label>
                                    <Input
                                        name="journalSubject"
                                        defaultValue={settings.journalSubject}
                                        className="h-12 bg-white/50 border-slate-200 focus-visible:ring-blue-500/20 font-bold text-sm rounded-xl px-4"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Operational Support */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="group relative overflow-hidden bg-white/40 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl p-2 transition-all hover:shadow-2xl hover:shadow-amber-500/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
                            <CardHeader className="p-6 pb-2">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-inner">
                                        <Headphones className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-slate-900">Operations Center</CardTitle>
                                        <CardDescription className="text-slate-500 text-xs">Support pathways & physical logistics.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Editorial Council Inbox</Label>
                                        <Input
                                            name="supportEmail"
                                            defaultValue={settings.supportEmail}
                                            className="h-12 bg-white/50 border-slate-200 focus-visible:ring-amber-500/20 font-bold text-sm rounded-xl px-4"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">Direct Operations Phone</Label>
                                        <Input
                                            name="supportPhone"
                                            defaultValue={settings.supportPhone}
                                            className="h-12 bg-white/50 border-slate-200 focus-visible:ring-amber-500/20 font-bold text-sm rounded-xl px-4"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-900 tracking-wider px-1 uppercase">HQ Physical Architecture</Label>
                                    <Textarea
                                        name="officeAddress"
                                        defaultValue={settings.officeAddress}
                                        rows={2}
                                        className="bg-white/50 border-slate-200 focus-visible:ring-amber-500/20 font-bold text-sm p-4 rounded-xl resize-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Resources */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="group relative bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
                            <CardHeader className="p-6 pb-2 border-b border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                                        <Layout className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-slate-900">Asset Repository</CardTitle>
                                        <CardDescription className="text-slate-500 text-xs">Manage templates & covenants.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Template Asset */}
                                    <div className="group/asset bg-slate-50/50 p-6 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="space-y-1">
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-bold text-[8px] tracking-wider uppercase rounded-lg px-2 py-0.5">
                                                    MS-DOCX / PDF
                                                </Badge>
                                                <h4 className="m-0">Upload Template</h4>
                                            </div>
                                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                        </div>
                                        
                                        <div className={cn(
                                            "relative group/field h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all overflow-hidden",
                                            selectedTemplate ? "border-blue-400 bg-blue-50/50 " : "border-slate-200  hover:border-blue-300 hover:bg-blue-50/30"
                                        )}>
                                            <Input
                                                type="file"
                                                name="templateUrl"
                                                onChange={(e) => setSelectedTemplate(e.target.files?.[0]?.name || null)}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-20 h-full w-full"
                                            />
                                            {isPending && selectedTemplate ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Uploading...</span>
                                                </div>
                                            ) : selectedTemplate ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Staged: {selectedTemplate}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-slate-300 group-hover/field:text-blue-500 group-hover/field:scale-110 transition-all" />
                                                    <span className="text-xs font-bold text-slate-500 group-hover/field:text-blue-600 uppercase tracking-tighter">Select Asset</span>
                                                </>
                                            )}

                                            {isPending && selectedTemplate && (
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 2, ease: "easeInOut" }}
                                                    className="absolute bottom-0 left-0 h-1 bg-blue-500" 
                                                />
                                            )}
                                        </div>

                                        {settings.templateUrl && (
                                            <div className="mt-4 flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                        <FileText className="w-3.5 h-3.5" />
                                                    </div>
                                                    <p className="truncate text-xs font-medium text-slate-600">{settings.templateUrl.split('/').pop()}</p>
                                                </div>
                                                <Button asChild variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                                                    <a href={settings.templateUrl} target="_blank" download="IJITEST-Manuscript-Template.docx" title="Download Template"><ExternalLink className="w-3.5 h-3.5" /></a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Copyright Asset */}
                                    <div className="group/asset bg-slate-50/50 p-6 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="space-y-1">
                                                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-bold text-[8px] tracking-wider uppercase rounded-lg px-2 py-0.5">
                                                    Legal Covenant
                                                </Badge>
                                                <h4 className="m-0">Upload Copyright Form</h4>
                                            </div>
                                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                        </div>
                                        
                                        <div className={cn(
                                            "relative group/field h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all overflow-hidden",
                                            selectedCopyright ? "border-indigo-400 bg-indigo-50/50 " : "border-slate-200  hover:border-indigo-300 hover:bg-indigo-50/30"
                                        )}>
                                            <Input
                                                type="file"
                                                name="copyrightUrl"
                                                onChange={(e) => setSelectedCopyright(e.target.files?.[0]?.name || null)}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-20 h-full w-full"
                                            />
                                            {isPending && selectedCopyright ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Uploading...</span>
                                                </div>
                                            ) : selectedCopyright ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Staged: {selectedCopyright}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-slate-300 group-hover/field:text-indigo-500 group-hover/field:scale-110 transition-all" />
                                                    <span className="text-xs font-bold text-slate-500 group-hover/field:text-indigo-600 uppercase tracking-tighter">Select Asset</span>
                                                </>
                                            )}

                                            {isPending && selectedCopyright && (
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 2, ease: "easeInOut" }}
                                                    className="absolute bottom-0 left-0 h-1 bg-indigo-500" 
                                                />
                                            )}
                                        </div>

                                        {settings.copyrightUrl && (
                                            <div className="mt-4 flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                        <FileText className="w-3.5 h-3.5" />
                                                    </div>
                                                    <p className="truncate text-xs font-medium text-slate-600">{settings.copyrightUrl.split('/').pop()}</p>
                                                </div>
                                                <Button asChild variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-indigo-50 hover:text-indigo-600">
                                                    <a href={settings.copyrightUrl} target="_blank" download="IJITEST-Publication-License-Agreement.docx" title="Download Copyright Form"><ExternalLink className="w-3.5 h-3.5" /></a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="relative overflow-hidden bg-white/60 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-2xl hover:shadow-purple-500/5">
                            <div className="absolute top-0 left-0 w-2 h-full bg-purple-500" />
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-md border border-purple-100 shrink-0">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-slate-900 font-bold text-base m-0">Visitor Promotion Popup</h3>
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                            100% APC Waiver
                                        </Badge>
                                    </div>
                                    <p className="text-slate-600 text-xs max-w-xl font-medium leading-relaxed m-0">
                                        Controls the introductory modal popup shown to first-time visitors after 5 seconds, offering the 100% Article Processing Charge (APC) waiver for the 2026 volume.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end bg-slate-50/90 border border-slate-200/80 px-4 py-3 rounded-2xl shadow-xs shrink-0">
                                <div className="flex flex-col text-left md:text-right">
                                    <div className="flex items-center gap-1.5 justify-start md:justify-end">
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            isPromotionActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                                        )} />
                                        <span className="text-xs font-bold text-slate-900">
                                            {isPromotionActive ? "Popup Active" : "Popup Disabled"}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-500">
                                        {isTogglingPromotion ? "Auto-saving..." : (isPromotionActive ? "Visible to new visitors" : "Hidden site-wide")}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                    {isTogglingPromotion && (
                                        <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                                    )}
                                    <Switch
                                        id="promotion-switch"
                                        checked={isPromotionActive}
                                        disabled={isTogglingPromotion}
                                        onCheckedChange={handleTogglePromotion}
                                        aria-label="Toggle visitor promotion popup"
                                    />
                                </div>
                                <input type="hidden" name="isPromotionActive" value={isPromotionActive ? "true" : "false"} />
                            </div>
                        </Card>
                    </motion.div>

                    {/* 10. Institutional Metrics & SUSHI / COUNTER R5 Standards */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
                            <CardHeader className="p-6 pb-4 border-b border-slate-50">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                                            <BarChart3 className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-slate-900">Institutional Metrics & SUSHI (COUNTER R5)</CardTitle>
                                                <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[9px] px-2 py-0.5">
                                                    Release 5 Compliant
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-slate-500 text-xs">
                                                Automated harvesting endpoints for university libraries, indexers, and consortium metrics.
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs px-2.5 py-1">
                                            <Activity className="w-3 h-3 text-emerald-500 mr-1.5 animate-pulse" />
                                            SUSHI Active
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Live COUNTER & Storage Metrics Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Investigations</span>
                                        <p className="text-xl font-black text-slate-800 m-0">
                                            {telemetry ? telemetry.counterMetrics.totalInvestigations.toLocaleString() : "--"}
                                        </p>
                                        <span className="text-[10px] text-slate-400 mt-1 block">Article Page Views</span>
                                    </div>
                                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Unique Investigations</span>
                                        <p className="text-xl font-black text-slate-800 m-0">
                                            {telemetry ? telemetry.counterMetrics.uniqueInvestigations.toLocaleString() : "--"}
                                        </p>
                                        <span className="text-[10px] text-slate-400 mt-1 block">Unique Daily Readers</span>
                                    </div>
                                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Requests</span>
                                        <p className="text-xl font-black text-emerald-700 m-0">
                                            {telemetry ? telemetry.counterMetrics.totalRequests.toLocaleString() : "--"}
                                        </p>
                                        <span className="text-[10px] text-emerald-600 mt-1 block">Full-Text PDF Downloads</span>
                                    </div>
                                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Unique Requests</span>
                                        <p className="text-xl font-black text-emerald-700 m-0">
                                            {telemetry ? telemetry.counterMetrics.uniqueRequests.toLocaleString() : "--"}
                                        </p>
                                        <span className="text-[10px] text-emerald-600 mt-1 block">Unique PDF Downloads</span>
                                    </div>
                                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 col-span-2 sm:col-span-1">
                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">Storage-Service</span>
                                        <p className="text-xl font-black text-indigo-900 m-0">
                                            {telemetry?.storageStats ? `${telemetry.storageStats.sizeMB} MB` : "Connected"}
                                        </p>
                                        <span className="text-[10px] text-indigo-600 mt-1 block">
                                            {telemetry?.storageStats ? `${telemetry.storageStats.fileCount} Managed Files` : "Fastify Backend Active"}
                                        </span>
                                    </div>
                                </div>

                                {/* SUSHI Harvest Endpoints */}
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold text-slate-700">Automated Harvesting Endpoints</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { name: "Service Status", path: "/api/sushi/status", desc: "SUSHI protocol operational check" },
                                            { name: "Reports Catalog", path: "/api/sushi/reports", desc: "List of supported COUNTER R5 reports" },
                                            { name: "Title Master Report (TR)", path: "/api/sushi/reports/tr", desc: "Journal-level monthly investigations & requests" },
                                            { name: "Journal Article Requests (IR_A1)", path: "/api/sushi/reports/ir_a1", desc: "Granular article-by-article download counts" },
                                        ].map((ep) => (
                                            <div key={ep.path} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all">
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-xs font-bold text-slate-800 m-0">{ep.name}</p>
                                                    <code className="text-[11px] text-indigo-600 font-mono block truncate mt-0.5">{ep.path}</code>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(ep.path)}
                                                        className="h-8 px-2.5 text-xs text-slate-600 hover:text-indigo-600 cursor-pointer"
                                                        title="Copy endpoint URL"
                                                    >
                                                        {copiedUrl === ep.path ? (
                                                            <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5 mr-1" />
                                                        )}
                                                        {copiedUrl === ep.path ? "Copied" : "Copy"}
                                                    </Button>
                                                    <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs text-slate-500 hover:text-indigo-600">
                                                        <a href={ep.path} target="_blank" rel="noreferrer" title="Open in new tab">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Configurable Identifiers */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="sushiPlatformId" className="text-xs font-bold text-slate-700">SUSHI Platform Identifier</Label>
                                        <Input
                                            id="sushiPlatformId"
                                            name="sushiPlatformId"
                                            defaultValue={settings.sushiPlatformId || "ijitest"}
                                            placeholder="ijitest"
                                            className="h-10 text-xs"
                                        />
                                        <p className="text-[10px] text-slate-400 m-0">Used as the platform identifier in standard COUNTER headers.</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="sushiCustomerId" className="text-xs font-bold text-slate-700">Default Customer ID</Label>
                                        <Input
                                            id="sushiCustomerId"
                                            name="sushiCustomerId"
                                            defaultValue={settings.sushiCustomerId || "0"}
                                            placeholder="0"
                                            className="h-10 text-xs"
                                        />
                                        <p className="text-[10px] text-slate-400 m-0">Use &apos;0&apos; to represent open-access / global public access (The World).</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Bottom Save Action Bar */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm mt-2">
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Ready to persist changes across journal configurations?</span>
                        </div>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto h-11 px-8 gap-3 bg-primary text-white font-bold text-xs tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all group/save cursor-pointer"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 group-hover/save:rotate-12 transition-transform" />
                            )}
                            {isPending ? "SAVING..." : "SAVE ALL SETTINGS"}
                        </Button>
                    </motion.div>
                </div>
            </form>

            {/* 6.1 Email Templates Management Link */}
            <motion.div variants={itemVariants} className="pt-2">
                <Card className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 m-0">Customizable Email Templates (OJS Parity)</h3>
                                <p className="text-xs text-slate-500 m-0 mt-1">
                                    Configure automated notifications, placeholders, I-beam cursor insertion, undo/redo history, and live branded previews.
                                </p>
                            </div>
                        </div>
                        <Button asChild variant="outline" className="shrink-0 h-10 px-5 font-bold text-xs bg-white hover:bg-slate-50 border-slate-300 shadow-xs cursor-pointer">
                            <Link href="/admin/email-templates">
                                Open Email Templates Manager &rarr;
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.section>

    );
}
