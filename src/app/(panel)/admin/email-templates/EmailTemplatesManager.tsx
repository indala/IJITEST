"use client";

import { useState, useEffect, useRef } from "react";
import { type EmailTemplate } from "@/db/types";
import {
    getEmailTemplates,
    updateEmailTemplate,
    resetEmailTemplate
} from "@/actions/email-templates";
import { renderTemplateText } from "@/lib/utils";
import { JOURNAL_EMAIL_CONFIG, formatEmailBodyToHtml } from "@/lib/email-layout";
import { getTemplateCategory, type TemplateCategory } from "@/lib/email-templates-defaults";
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
    Sparkles,
    Undo2,
    Redo2,
    Search
} from "lucide-react";
import { toast } from "sonner";

interface HistorySnapshot {
    subject: string;
    body: string;
    field: "subject" | "body";
    cursor: number;
}

const CATEGORIES: { id: "all" | TemplateCategory; label: string }[] = [
    { id: "all", label: "All" },
    { id: "submissions", label: "Submissions" },
    { id: "review", label: "Peer Review" },
    { id: "editorial", label: "Editorial" },
    { id: "applications", label: "Applications" },
    { id: "system", label: "System" },
];

export default function EmailTemplatesManager() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<"all" | TemplateCategory>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const subjectInputRef = useRef<HTMLInputElement>(null);
    const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [lastFocusedField, setLastFocusedField] = useState<"subject" | "body">("body");
    const [hasUserFocused, setHasUserFocused] = useState(false);

    // History stack for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
    const [history, setHistory] = useState<HistorySnapshot[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const historyRef = useRef<HistorySnapshot[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const subjectRef = useRef(subject);
    const bodyRef = useRef(body);
    const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => { subjectRef.current = subject; }, [subject]);
    useEffect(() => { bodyRef.current = body; }, [body]);
    useEffect(() => { historyRef.current = history; }, [history]);
    useEffect(() => { historyIndexRef.current = historyIndex; }, [historyIndex]);

    useEffect(() => {
        return () => {
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
        };
    }, []);

    const initHistory = (initialSubject: string, initialBody: string) => {
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
        }
        const initialSnapshot: HistorySnapshot = {
            subject: initialSubject,
            body: initialBody,
            field: "body",
            cursor: initialBody.length,
        };
        historyRef.current = [initialSnapshot];
        historyIndexRef.current = 0;
        setHistory([initialSnapshot]);
        setHistoryIndex(0);
    };

    const pushHistory = (snapshot: HistorySnapshot) => {
        const currIndex = historyIndexRef.current;
        const currentHist = historyRef.current;

        // Prevent pushing duplicate identical snapshots
        if (currIndex >= 0 && currentHist[currIndex]) {
            const top = currentHist[currIndex]!;
            if (top.subject === snapshot.subject && top.body === snapshot.body) {
                return;
            }
        }

        // Truncate any future redo branch beyond current index
        const nextHist = currentHist.slice(0, currIndex + 1);
        nextHist.push(snapshot);

        // Cap history to 50 snapshots
        if (nextHist.length > 50) {
            nextHist.shift();
        }

        const nextIndex = nextHist.length - 1;
        historyRef.current = nextHist;
        historyIndexRef.current = nextIndex;
        setHistory(nextHist);
        setHistoryIndex(nextIndex);
    };

    const handleUndo = () => {
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
        }

        const currIndex = historyIndexRef.current;
        if (currIndex <= 0) return;

        const targetIndex = currIndex - 1;
        const target = historyRef.current[targetIndex];
        if (!target) return;

        historyIndexRef.current = targetIndex;
        setHistoryIndex(targetIndex);

        setSubject(target.subject);
        setBody(target.body);
        subjectRef.current = target.subject;
        bodyRef.current = target.body;
        setLastFocusedField(target.field);
        setHasUserFocused(true);

        requestAnimationFrame(() => {
            const el = target.field === "subject" ? subjectInputRef.current : bodyTextareaRef.current;
            if (el) {
                el.focus();
                const pos = Math.min(target.cursor, el.value.length);
                el.setSelectionRange(pos, pos);
            }
        });
    };

    const handleRedo = () => {
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
        }

        const currIndex = historyIndexRef.current;
        if (currIndex < 0 || currIndex >= historyRef.current.length - 1) return;

        const targetIndex = currIndex + 1;
        const target = historyRef.current[targetIndex];
        if (!target) return;

        historyIndexRef.current = targetIndex;
        setHistoryIndex(targetIndex);

        setSubject(target.subject);
        setBody(target.body);
        subjectRef.current = target.subject;
        bodyRef.current = target.body;
        setLastFocusedField(target.field);
        setHasUserFocused(true);

        requestAnimationFrame(() => {
            const el = target.field === "subject" ? subjectInputRef.current : bodyTextareaRef.current;
            if (el) {
                el.focus();
                const pos = Math.min(target.cursor, el.value.length);
                el.setSelectionRange(pos, pos);
            }
        });
    };

    const flushTypingSnapshot = (field: "subject" | "body") => {
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
            const el = field === "subject" ? subjectInputRef.current : bodyTextareaRef.current;
            const cursor = el?.selectionStart ?? (field === "subject" ? subjectRef.current.length : bodyRef.current.length);
            pushHistory({
                subject: subjectRef.current,
                body: bodyRef.current,
                field,
                cursor,
            });
        }
    };

    const handleSubjectChange = (val: string) => {
        setSubject(val);
        subjectRef.current = val;
        const cursor = subjectInputRef.current?.selectionStart ?? val.length;

        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            pushHistory({
                subject: val,
                body: bodyRef.current,
                field: "subject",
                cursor,
            });
        }, 400);
    };

    const handleBodyChange = (val: string) => {
        setBody(val);
        bodyRef.current = val;
        const cursor = bodyTextareaRef.current?.selectionStart ?? val.length;

        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            pushHistory({
                subject: subjectRef.current,
                body: val,
                field: "body",
                cursor,
            });
        }, 400);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (previewMode) return;
        const isMac = typeof window !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        const modKey = isMac ? e.metaKey : e.ctrlKey;

        if (modKey && !e.altKey) {
            const key = e.key.toLowerCase();
            // Undo: Ctrl+Z (Cmd+Z)
            if (key === "z" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleUndo();
                return;
            }
            // Redo: Ctrl+Y OR Ctrl+Shift+Z (Cmd+Shift+Z)
            if (key === "y" || (key === "z" && e.shiftKey)) {
                e.preventDefault();
                e.stopPropagation();
                handleRedo();
                return;
            }
        }
    };

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
                    initHistory(first.subjectTemplate, first.bodyTemplate);
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
        setHasUserFocused(false);
        setLastFocusedField("body");
        initHistory(tpl.subjectTemplate, tpl.bodyTemplate);
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
                setHasUserFocused(false);
                setLastFocusedField("body");
                initHistory(res.data.subjectTemplate, res.data.bodyTemplate);
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
        // Commit any pending typing buffer before inserting
        flushTypingSnapshot(lastFocusedField);

        const token = `{{${varName}}}`;
        const targetRef = lastFocusedField === "subject" ? subjectInputRef : bodyTextareaRef;
        const el = targetRef.current;

        if (el) {
            // If user has focused the field, use selectionStart/End (the I-beam cursor position)
            // Otherwise, default to appending at the end of the field
            const start = hasUserFocused && typeof el.selectionStart === "number"
                ? el.selectionStart
                : el.value.length;
            const end = hasUserFocused && typeof el.selectionEnd === "number"
                ? el.selectionEnd
                : el.value.length;

            const currentVal = lastFocusedField === "subject" ? subject : body;
            const before = currentVal.slice(0, start);
            const after = currentVal.slice(end);
            const updated = `${before}${token}${after}`;
            const newPos = start + token.length;

            if (lastFocusedField === "subject") {
                setSubject(updated);
                subjectRef.current = updated;
                pushHistory({
                    subject: updated,
                    body: bodyRef.current,
                    field: "subject",
                    cursor: newPos,
                });
            } else {
                setBody(updated);
                bodyRef.current = updated;
                pushHistory({
                    subject: subjectRef.current,
                    body: updated,
                    field: "body",
                    cursor: newPos,
                });
            }

            // Restore focus and advance cursor right after the inserted placeholder token
            requestAnimationFrame(() => {
                el.focus();
                el.setSelectionRange(newPos, newPos);
                setHasUserFocused(true);
            });
        } else {
            const updated = body + token;
            setBody(updated);
            bodyRef.current = updated;
            pushHistory({
                subject: subjectRef.current,
                body: updated,
                field: "body",
                cursor: updated.length,
            });
        }
    };

    const currentKey = selectedTemplate?.templateKey;
    const sampleActionUrl = currentKey === "ADMIN_NOTIFICATION"
        ? "https://ijitest.org/admin/submissions/84"
        : currentKey === "STAFF_NOTIFICATION"
        ? "https://ijitest.org/editor/submissions/84"
        : "https://ijitest.org/author";

    // Realistic sample data for all 22 templates in preview rendering
    const sampleData: Record<string, string> = {
        authorName: "Dr. Arvind Kumar",
        reviewerName: "Prof. Sarah Jenkins",
        paperTitle: "Advancements in Quantum Neural Networks for Distributed Systems",
        paperId: "IJITEST-2026-084",
        trackUrl: "https://ijitest.org/track",
        portalUrl: "https://ijitest.org/reviewer",
        actionUrl: sampleActionUrl,
        title: "New Manuscript Screening Required [IJITEST-2026-084]",
        proofUrl: "https://ijitest.org/author/submissions/84",
        articleUrl: "https://ijitest.org/archives/volume1/issue1/IJITEST-2026-084",
        certificateUrl: "https://ijitest.org/api/certificate/IJITEST-2026-084",
        volumeNumber: "1",
        issueNumber: "1",
        year: "2026",
        reviewDeadline: "April 15, 2026",
        deadline: "April 15, 2026",
        timeText: "is due in 3 days",
        editorialFeedback: "The manuscript demonstrates solid empirical contributions. Revise figure 4 clarity and bibliography references.",
        journalName: "International Journal of Innovative Trends in Engineering Science and Technology",
        journalShortName: "IJITEST",
        // Additional template placeholders
        role: "Associate Editor",
        setupUrl: "https://ijitest.org/auth/setup-password?token=sample-invitation-token-123",
        resetUrl: "https://ijitest.org/auth/setup-password?token=sample-reset-token-123&ctx=reset",
        reason: "At this time, we have filled our editorial board openings for this domain.",
        comments: "Please clarify the empirical evaluation in Section 4 and revise the bibliography format.",
        resubmitUrl: "https://ijitest.org/author/submissions/84",
        dashboardUrl: "https://ijitest.org/editor/submissions/84",
        adminUrl: "https://ijitest.org/admin/submissions/84",
        daysOverdue: "3",
        days: "3",
        originalSubject: "Query regarding indexed journals",
        replyContent: "Thank you for reaching out. IJITEST is actively indexed with Google Scholar, Crossref, and DOAJ.",
        originalMessage: "Could you please confirm the current indexing status and APC rates?",
        date: "September 9, 2026",
        staffName: "Editorial Office",
        details: "A new manuscript submission has arrived and is awaiting initial editorial screening.",
        evaluationUrl: "https://ijitest.org/admin/submissions/84",
        submissionUrl: "https://ijitest.org/admin/submissions/84",
        subject: "New Inquiry: Contact Form",
        eventTitle: "Editorial Alert",
        editorName: "Prof. Michael Brooks",
        coAuthorName: "Dr. Elena Rostova",
        submittingAuthor: "Dr. Arvind Kumar",
        correspondingAuthor: "Dr. Arvind Kumar",
        name: "Dr. Elena Rostova",
        submissionDate: "September 9, 2026",
        applicantName: "Dr. Vikram Seth",
        applicantEmail: "vikram.seth@oxford.edu",
        visitorName: "Sarah Miller",
        visitorEmail: "sarah.miller@stanford.edu",
        inquiryUrl: "https://ijitest.org/admin/messages",
        message: "Could you please confirm the current indexing status and APC rates for multidisciplinary engineering submissions?",
        amount: "12000.00",
        currency: "INR",
        transactionId: "pay_Rzp1234567890",
        statusText: "APPROVED",
        correctionNotes: "Author approved typeset proof without changes.",
        recommendation: "Accept with Minor Revisions",
    };

    const previewSubject = renderTemplateText(subject, sampleData);
    const previewBody = renderTemplateText(body, sampleData);

    const getTemplateCta = (key?: string): { text: string; url: string } | null => {
        switch (key) {
            case "SUBMISSION_ACK": return { text: "Track Manuscript Status", url: sampleData['trackUrl'] || "https://ijitest.org/track" };
            case "SUBMISSION_COAUTHOR": return { text: "Track Manuscript Status", url: sampleData['trackUrl'] || "https://ijitest.org/track" };
            case "NEW_SUBMISSION_EDITOR_ALERT": return { text: "Screen Manuscript & Assign Reviewers", url: sampleData['dashboardUrl'] || "https://ijitest.org/editor" };
            case "STAFF_NOTIFICATION": return { text: "Open Staff Dashboard", url: sampleData['dashboardUrl'] || "https://ijitest.org/editor" };
            case "REVIEW_INVITATION": return { text: "Review Invitation & Actions", url: sampleData['portalUrl'] || "https://ijitest.org/reviewer" };
            case "REVIEW_ASSIGNMENT": return { text: "Accept / Access Review Assignment", url: sampleData['setupUrl'] || sampleData['portalUrl'] || "https://ijitest.org/reviewer" };
            case "REVIEW_REMINDER": return { text: "Submit Peer Review Evaluation", url: sampleData['portalUrl'] || "https://ijitest.org/reviewer" };
            case "REVIEW_OVERDUE_ESCALATION": return { text: "Inspect Reviewer Assignment", url: sampleData['dashboardUrl'] || "https://ijitest.org/editor" };
            case "REVIEW_COMPLETED": return { text: "Inspect Review Decision", url: sampleData['evaluationUrl'] || "https://ijitest.org/admin" };
            case "DECISION_ACCEPT": return { text: "Proceed to Author Portal", url: sampleData['actionUrl'] || "https://ijitest.org/author" };
            case "DECISION_REJECT": return { text: "View Editorial Decision", url: sampleData['actionUrl'] || "https://ijitest.org/author" };
            case "REVISION_REQUEST": return { text: "Submit Revised Manuscript", url: sampleData['resubmitUrl'] || "https://ijitest.org/author" };
            case "REVISION_RECEIVED": return { text: "Review Revised Manuscript", url: sampleData['dashboardUrl'] || "https://ijitest.org/editor" };
            case "GALLEY_PROOF_REQUEST": return { text: "Inspect Galley Proof (PDF)", url: sampleData['proofUrl'] || "https://ijitest.org/author" };
            case "GALLEY_PROOF_RESPONSE_ALERT": return { text: "Inspect Proof Response in Editorial Desk", url: sampleData['dashboardUrl'] || "https://ijitest.org/editor" };
            case "COPYRIGHT_SUBMITTED": return { text: "Inspect Copyright & Final Files", url: sampleData['dashboardUrl'] || "https://ijitest.org/editor" };
            case "PAPER_PUBLISHED": return { text: "View Published Paper in Archives", url: sampleData['articleUrl'] || "https://ijitest.org/archives" };
            case "PAYMENT_VERIFIED": return { text: "View Author Dashboard", url: sampleData['actionUrl'] || "https://ijitest.org/author" };
            case "PAYMENT_RECEIVED_ALERT": return { text: "Schedule for Issue & Typesetting", url: sampleData['dashboardUrl'] || "https://ijitest.org/editor" };
            case "CONTACT_RECEIPT": return { text: "Visit Support Portal", url: "https://ijitest.org/contact" };
            case "CONTACT_REPLY": return { text: "Visit IJITEST Website", url: "https://ijitest.org" };
            case "CONTACT_INQUIRY_ALERT": return { text: "Reply via Admin Portal", url: sampleData['inquiryUrl'] || "https://ijitest.org/admin/messages" };
            case "ADMIN_NOTIFICATION": return { text: "Open Administrative Dashboard", url: sampleData['adminUrl'] || "https://ijitest.org/admin" };
            case "BOARD_APPLICATION_RECEIPT": return { text: "Visit Editorial Board", url: "https://ijitest.org/editorial-board" };
            case "BOARD_APPLICATION_ALERT": return { text: "Review Candidate Dossier", url: sampleData['adminUrl'] || "https://ijitest.org/admin" };
            case "BOARD_INVITATION": return { text: "Complete Account Setup", url: sampleData['setupUrl'] || "https://ijitest.org/auth/setup-password" };
            case "BOARD_REJECTION": return { text: "Visit Editorial Board", url: "https://ijitest.org/editorial-board" };
            case "PASSWORD_RESET": return { text: "Reset Account Password", url: sampleData['resetUrl'] || "https://ijitest.org/auth/setup-password" };
            default: return null;
        }
    };

    const filteredTemplates = templates.filter((tpl) => {
        const matchesCategory = selectedCategory === "all" || getTemplateCategory(tpl.templateKey) === selectedCategory;
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch = !query || 
            tpl.name.toLowerCase().includes(query) || 
            tpl.templateKey.toLowerCase().includes(query) || 
            (tpl.description && tpl.description.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });

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
                            {/* Undo / Redo Toolbar */}
                            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleUndo}
                                    disabled={historyIndex <= 0 || previewMode}
                                    className="h-8 px-2.5 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-white disabled:opacity-40 cursor-pointer"
                                    title="Undo (Ctrl+Z)"
                                >
                                    <Undo2 className="w-3.5 h-3.5 mr-1" />
                                    <span className="hidden sm:inline">Undo</span>
                                </Button>
                                <div className="w-[1px] h-4 bg-slate-200 my-auto" />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRedo}
                                    disabled={historyIndex >= history.length - 1 || previewMode}
                                    className="h-8 px-2.5 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-white disabled:opacity-40 cursor-pointer"
                                    title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
                                >
                                    <Redo2 className="w-3.5 h-3.5 mr-1" />
                                    <span className="hidden sm:inline">Redo</span>
                                </Button>
                            </div>

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
                    <div className="lg:col-span-4 space-y-3 border-r border-slate-100 pr-0 lg:pr-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                Notification Events
                            </Label>
                            <Badge variant="secondary" className="text-[10px] font-semibold text-slate-500">
                                {filteredTemplates.length} of {templates.length}
                            </Badge>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search templates..."
                                className="pl-8 h-8 text-xs bg-slate-50/50 border-slate-200"
                            />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap gap-1">
                            {CATEGORIES.map((cat) => {
                                const count = cat.id === "all"
                                    ? templates.length
                                    : templates.filter(t => getTemplateCategory(t.templateKey) === cat.id).length;
                                const isActive = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                                            isActive
                                                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        <span>{cat.label}</span>
                                        <span className={`text-[9px] px-1 py-0.2 rounded-full ${isActive ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-600"}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Template List */}
                        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                            {filteredTemplates.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                                    No notification templates match your search.
                                </div>
                            ) : (
                                filteredTemplates.map((tpl) => {
                                    const isSelected = tpl.id === selectedId;
                                    return (
                                        <button
                                            key={tpl.id}
                                            type="button"
                                            onClick={() => handleSelectTemplate(tpl)}
                                            className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer ${
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
                                })
                            )}
                        </div>
                    </div>

                    {/* Right: Template Editor or Live Preview */}
                    <div className="lg:col-span-8 space-y-4 pl-0 lg:pl-2" onKeyDown={handleKeyDown}>
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
                                        ref={subjectInputRef}
                                        id="tpl-subject"
                                        value={subject}
                                        onChange={(e) => handleSubjectChange(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={() => flushTypingSnapshot("subject")}
                                        onFocus={() => {
                                            setLastFocusedField("subject");
                                            setHasUserFocused(true);
                                        }}
                                        placeholder="Email Subject with {{variables}}"
                                        className="font-medium text-sm"
                                        disabled={previewMode}
                                    />
                                </div>

                                {/* Placeholder Variables Bar */}
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                            <Sparkles className="w-3 h-3 text-amber-500" /> Click to Insert Placeholder Variable:
                                        </div>
                                        <div className="flex items-center gap-2.5 text-[10px] text-slate-400">
                                            <span className="hidden sm:inline font-medium">
                                                <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono text-slate-600 shadow-2xs">Ctrl+Z</kbd> Undo / <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono text-slate-600 shadow-2xs">Ctrl+Y</kbd> Redo
                                            </span>
                                            <span className="font-medium">
                                                Target: <span className="text-slate-700 font-bold uppercase">{lastFocusedField}</span> (at cursor)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedTemplate.variables?.map((v) => (
                                            <button
                                                key={v}
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => insertVariable(v)}
                                                disabled={previewMode}
                                                className="px-2 py-0.5 bg-white hover:bg-primary/5 hover:border-primary/30 border border-slate-200 rounded-md text-[11px] font-mono font-medium text-slate-700 transition-colors cursor-pointer"
                                                title={`Insert {{${v}}} at ${lastFocusedField} cursor`}
                                            >
                                                {`{{${v}}}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {previewMode ? (
                                    /* Live Branded Email Client Preview */
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-md bg-slate-100/70 space-y-0 animate-in fade-in duration-300">
                                        {/* Mockup Mail Client Envelope Bar */}
                                        <div className="bg-white border-b border-slate-200 px-5 py-3 space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800">From:</span>
                                                    <span className="text-slate-600 font-mono text-[11px]">{JOURNAL_EMAIL_CONFIG.shortName} Editorial &lt;{JOURNAL_EMAIL_CONFIG.supportEmail}&gt;</span>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 font-medium">Recipient Inbox Preview</Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="font-bold text-slate-800">To:</span>
                                                <span className="text-slate-600 font-mono text-[11px]">Dr. Alexander Wright &lt;alexander.wright@mit.edu&gt;</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs pt-1.5 border-t border-slate-100">
                                                <span className="font-bold text-slate-900 shrink-0">Subject:</span>
                                                <span className="font-bold text-slate-900">{previewSubject}</span>
                                            </div>
                                        </div>

                                        {/* Branded Email Canvas */}
                                        <div className="p-4 sm:p-8 flex justify-center">
                                            <div className="w-full max-w-[560px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left">
                                                {/* Header Banner */}
                                                <div className="p-6 sm:p-7 text-center border-b-2 border-slate-50">
                                                    <img 
                                                        src={JOURNAL_EMAIL_CONFIG.logo} 
                                                        alt={JOURNAL_EMAIL_CONFIG.shortName} 
                                                        className="h-12 mx-auto mb-2.5 object-contain" 
                                                    />
                                                    <h2 className="text-lg font-black tracking-wider uppercase m-0" style={{ color: JOURNAL_EMAIL_CONFIG.primaryColor }}>
                                                        {JOURNAL_EMAIL_CONFIG.shortName}
                                                    </h2>
                                                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-1 m-0">
                                                        Editorial Management System
                                                    </p>
                                                </div>

                                                {/* Formatted HTML Body Content */}
                                                <div className="p-6 sm:p-8 space-y-4">
                                                    <div 
                                                        className="email-preview-content space-y-3"
                                                        dangerouslySetInnerHTML={{ __html: formatEmailBodyToHtml(previewBody) }}
                                                    />

                                                    {/* Simulated CTA Button */}
                                                    {getTemplateCta(selectedTemplate?.templateKey) && (
                                                        <div className="text-center pt-6 pb-2">
                                                            <a
                                                                href={getTemplateCta(selectedTemplate?.templateKey)?.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-rose-900/20 hover:opacity-95 transition-opacity"
                                                                style={{ backgroundColor: JOURNAL_EMAIL_CONFIG.primaryColor }}
                                                            >
                                                                {getTemplateCta(selectedTemplate?.templateKey)?.text} &rarr;
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Academic Footer */}
                                                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
                                                    <p className="font-bold text-slate-800 m-0">{JOURNAL_EMAIL_CONFIG.name}</p>
                                                    <p className="text-[11px] text-slate-600 m-0">Published by <strong>{JOURNAL_EMAIL_CONFIG.publisher}</strong></p>
                                                    <p className="text-[10px] text-slate-400 m-0">{JOURNAL_EMAIL_CONFIG.address}</p>
                                                    <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400">
                                                        This is an automated scholarly notification. Direct replies to this mailbox are not monitored.
                                                    </div>
                                                </div>
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
                                            ref={bodyTextareaRef}
                                            id="tpl-body"
                                            rows={12}
                                            value={body}
                                            onChange={(e) => handleBodyChange(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            onBlur={() => flushTypingSnapshot("body")}
                                            onFocus={() => {
                                                setLastFocusedField("body");
                                                setHasUserFocused(true);
                                            }}
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
