"use client";

import { useState, useRef } from 'react';
import { Camera, Save, AlertCircle, CheckCircle2, User, Building2, Briefcase, Phone, FileText, Mail, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { updateUserProfile } from '@/actions/users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from '@/components/ui/label';

interface ProfileFormProps {
    user: {
        id: number;
        email: string;
        full_name: string;
        designation?: string;
        institute?: string;
        phone?: string;
        bio?: string;
        photo_url?: string;
        role: string;
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ success?: boolean; error?: string } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.photo_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleAction(formData: FormData) {
        setIsSubmitting(true);
        setStatus(null);

        try {
            const result = await updateUserProfile(formData);
            if (result.success) {
                setStatus({ success: true });
                setTimeout(() => setStatus(null), 5000);
            } else {
                setStatus({ error: result.error });
            }
        } catch (error) {
            setStatus({ error: "An unexpected error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <form action={handleAction} className="space-y-6">
                {/* Profile Header Card */}
                <Card className="border-border/50 shadow-lg overflow-hidden relative bg-muted/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <CardContent className="p-8 relative z-10">
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                            {/* Photo Upload Area */}
                            <div className="relative group">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-muted border border-border shadow-sm overflow-hidden flex items-center justify-center transition-all group-hover:shadow-md">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-muted-foreground/30" />
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-lg shadow-lg border border-border bg-background hover:bg-muted"
                                    aria-label="Change profile photo"
                                    title="Change profile photo"
                                >
                                    <Camera className="w-4 h-4" />
                                </Button>
                                <input
                                    id="profile-photo-input"
                                    type="file"
                                    name="photo"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    aria-label="Upload profile photo"
                                    title="Choose a profile photo"
                                />
                                <input type="hidden" name="existingPhotoUrl" value={user.photo_url || ''} title="Existing Photo URL" />
                            </div>

                            <div className="flex-1 space-y-2">
                                <h2 className="text-xl font-black text-foreground tracking-tight">{user.full_name}</h2>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <Badge variant="outline" className="h-5 px-1.5 text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                                        {user.role} portal access
                                    </Badge>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                                        <Mail className="w-3.5 h-3.5 text-primary/40" />
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-primary/5 shadow-vip bg-white">
                        <CardHeader className="p-6 pb-0">
                            <CardTitle className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Shield className="w-4 h-4 text-secondary" /> Identity Protocol
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-6 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1">Full Identity</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    defaultValue={user.full_name}
                                    required
                                    placeholder="Enter your full name"
                                    title="Full Identity"
                                    className="bg-primary/5 border-primary/5 h-12 text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/20 shadow-inner rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="designation" className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1">Professional Status</Label>
                                <Input
                                    id="designation"
                                    name="designation"
                                    defaultValue={user.designation}
                                    placeholder="e.g. Senior Researcher"
                                    title="Professional Status"
                                    className="bg-primary/5 border-primary/5 h-12 text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/20 shadow-inner rounded-xl"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/5 shadow-vip bg-white">
                        <CardHeader className="p-6 pb-0">
                            <CardTitle className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-secondary" /> Institutional Provenance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-6 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="institute" className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1">Organization / University</Label>
                                <Input
                                    id="institute"
                                    name="institute"
                                    defaultValue={user.institute}
                                    placeholder="e.g. Oxford University"
                                    title="Organization / University"
                                    className="bg-primary/5 border-primary/5 h-12 text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/20 shadow-inner rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1">Reference Protocol</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={user.phone}
                                    placeholder="+1 (555) 000-0000"
                                    title="Reference Protocol (Phone)"
                                    className="bg-primary/5 border-primary/5 h-12 text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/20 shadow-inner rounded-xl"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bio / About Section */}
                <Card className="border-primary/5 shadow-vip bg-white">
                    <CardHeader className="p-6 pb-0">
                        <CardTitle className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] flex items-center gap-2">
                            <FileText className="w-4 h-4 text-secondary" /> Expertise Dossier
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-6 space-y-2">
                        <Label htmlFor="bio" className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1">Expertise Summary</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            defaultValue={user.bio}
                            placeholder="Detail your academic background and technical research interests..."
                            rows={4}
                            title="Expertise Summary"
                            className="bg-primary/5 border-primary/5 text-xs font-medium resize-none focus-visible:ring-1 focus-visible:ring-primary/20 shadow-inner rounded-2xl p-6"
                        />
                    </CardContent>
                </Card>

                {/* Feedback Messages */}
                {status && (
                    <div className={`p-6 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-2 border ${status.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-secondary/10 border-secondary/20 text-secondary'}`}>
                        {status.success ? <CheckCircle className="w-5 h-5 shadow-sm" /> : <AlertTriangle className="w-5 h-5 shadow-sm" />}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{status.success ? 'Update Authorized' : 'Transmission Failure'}</p>
                            <p className="text-xs font-bold">{status.success ? 'Your account profile has been successfully synchronized.' : status.error}</p>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-16 px-10 gap-3 font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 rounded-[1.5rem] bg-primary hover:scale-[1.02] transition-all"
                        title="Update Private Profile"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isSubmitting ? "Synchronizing Asset..." : "Update Private Profile"}
                    </Button>
                </div>
            </form>
        </div>
    );
}