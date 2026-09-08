"use client";

import { useState, useEffect } from "react";
import { type EmailTemplate } from "@/db/types";
import {
    getEmailTemplates,
    updateEmailTemplate,
    resetEmailTemplate,
    renderTemplateText
} from "@/actions/email-templates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Mail,
    Save,
    RotateCcw,
    Eye,
    Code2,
    CheckCircle2,
    Loader2,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function EmailTemplatesManager() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await getEmailTemplates();
            if (res.success && res.data) {
                setTemplates(res.data);
                if (res.data.length > 0) {
                    const first = res.data[0]!;
                    setSelectedId(first.id);
                    setSubject(first.subjectTemplate);
                    setBody(first.bodyTemplate);
                }
            } else {
                toast.error("Failed to load email templates.");
            }
        } catch {
            toast.error("Error connecting to template registry.");
        } finally {
            setLoading(false);
        }
    };

    const selectedTemplate = templates.find((t) => t.id === selectedId);

    const handleSelectTemplate = (tpl: EmailTemplate) => {
        setSelectedId(tpl.id);
        setSubject(tpl.subjectTemplate);
        setBody(tpl.bodyTemplate);
        setPreviewMode(false);
    };

    const handleSave = async () => {
        if (!selectedId) return;
        setSaving(true);
        try {
            const res = await updateEmailTemplate(selectedId, subject, body);
            if (res.success && res.data) {
                toast.success("Email Template Updated", {
                    description: `Template "${res.data.name}" has been saved.`,
                });
                setTemplates((prev) =>
                    prev.map((t) => (t.id === selectedId ? res.data! : t))
                );
            } else {
                toast.error("Update Failed", { description: res.error });
            }
        } catch {
            toast.error("Failed to update template.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!selectedId) return;
        if (!confirm("Are you sure you want to reset this template to the default version?")) return;
        setResetting(true);
        try {
            const res = await resetEmailTemplate(selectedId);
            if (res.success && res.data) {
                toast.success("Template Reset to Default");
                setSubject(res.data.subjectTemplate);
                setBody(res.data.bodyTemplate);
                setTemplates((prev) =>
                    prev.map((t) => (t.id === selectedId ? res.data! : t))
                );
            } else {
                toast.error("Reset Failed", { description: res.error });
            }
        } catch {
            toast.error("Failed to reset template.");
        } finally {
            setResetting(false);
        }
    };

    const insertVariable = (varName: string) => {
        const token = `{{${varName}}}`;
        setBody((prev) => prev + token);
    };

    // Realistic sample data for preview rendering
    const sampleData: Record<string, string> = {
        authorName: "Dr. Arvind Kumar",
        reviewerName: "Prof. Sarah Jenkins",
        paperTitle: "Advancements in Quantum Neural Networks for Distributed Systems",
        paperId: "IJITEST-2026-084",
        trackUrl: "https://ijitest.org/track",
        portalUrl: "https://ijitest.org/reviewer",
        actionUrl: "https://ijitest.org/author",
        proofUrl: "https://ijitest.org/author/submissions/84",
        articleUrl: "https://ijitest.org/archives/volume1/issue1/IJITEST-2026-084",
        certificateUrl: "https://ijitest.org/api/certificate/IJITEST-2026-084",
        volumeNumber: "1",
        issueNumber: "1",
        year: "2026",
        reviewDeadline: "April 15, 2026",
        editorialFeedback: "The manuscript demonstrates solid empirical contributions. Revise figure 4 clarity and bibliography references.",
        journalName: "International Journal of Innovative Trends in Engineering Science and Technology",
        journalShortName: "IJITEST",
    };

    const previewSubject = renderTemplateText(subject, sampleData);
    const previewBody = renderTemplateText(body, sampleData);

    if (loading) {
        return (
            <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading Email Template System...</span>
            </div>
        );
    }

    return (
        <Card className="bg-white/60 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="p-6 sm:p-8 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 m-0">
                                Customizable Email Templates (OJS Parity)
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500 m-0 mt-0.5">
                                Customize automated notification subjects, bodies, and placeholder variables.
                            </CardDescription>
                        </div>
                    </div>
                    {selectedTemplate && (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPreviewMode(!previewMode)}
                                className="h-9 gap-1.5 text-xs font-semibold"
                            >
                                {previewMode ? <Code2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                {previewMode ? "Edit Mode" : "Live Preview"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                disabled={resetting || saving}
                                className="h-9 gap-1.5 text-xs text-slate-600 hover:text-red-600 font-semibold"
                            >
                                {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                Reset
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                                className="h-9 gap-1.5 text-xs bg-primary text-white font-bold"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                Save Template
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Template Selector List */}
                    <div className="lg:col-span-4 space-y-2 border-r border-slate-100 pr-0 lg:pr-6">
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                            Notification Events
                        </Label>
                        <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                            {templates.map((tpl) => {
                                const isSelected = tpl.id === selectedId;
                                return (
                                    <button
                                        key={tpl.id}
                                        type="button"
                                        onClick={() => handleSelectTemplate(tpl)}
                                        className={`w-full text-left p-3 rounded-xl transition-all border ${
                                            isSelected
                                                ? "bg-primary/5 border-primary/30 shadow-xs"
                                                : "bg-white hover:bg-slate-50 border-slate-100"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                            <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-slate-800"}`}>
                                                {tpl.name}
                                            </span>
                                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                                        </div>
                                        <p className="text-[11px] text-slate-500 line-clamp-1 m-0">
                                            {tpl.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Template Editor or Live Preview */}
                    <div className="lg:col-span-8 space-y-4 pl-0 lg:pl-2">
                        {selectedTemplate ? (
                            <>
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label htmlFor="tpl-subject" className="text-xs font-bold text-slate-700">
                                            Email Subject Template
                                        </Label>
                                        <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                                            {selectedTemplate.templateKey}
                                        </Badge>
                                    </div>
                                    <Input
                                        id="tpl-subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Email Subject with {{variables}}"
                                        className="font-medium text-sm"
                                        disabled={previewMode}
                                    />
                                </div>

                                {/* Placeholder Variables Bar */}
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3 text-amber-500" /> Click to Insert Placeholder Variable:
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedTemplate.variables?.map((v) => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => insertVariable(v)}
                                                disabled={previewMode}
                                                className="px-2 py-0.5 bg-white hover:bg-primary/5 hover:border-primary/30 border border-slate-200 rounded-md text-[11px] font-mono font-medium text-slate-700 transition-colors cursor-pointer"
                                                title={`Insert {{${v}}}`}
                                            >
                                                {`{{${v}}}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {previewMode ? (
                                    /* Live Preview Mode */
                                    <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                                        <div className="pb-3 border-b border-slate-100">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                Simulated Subject Line
                                            </span>
                                            <p className="text-sm font-bold text-slate-900 m-0">
                                                {previewSubject}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                                Simulated Body
                                            </span>
                                            <div className="p-4 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans border border-slate-100">
                                                {previewBody}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Edit Mode */
                                    <div>
                                        <Label htmlFor="tpl-body" className="text-xs font-bold text-slate-700 block mb-1.5">
                                            Email Body Template (Plain Text & Placeholders)
                                        </Label>
                                        <Textarea
                                            id="tpl-body"
                                            rows={12}
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            placeholder="Write your email body template using {{placeholder}} variables..."
                                            className="font-mono text-xs leading-relaxed"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                Select an email notification event from the left to edit its template.
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
