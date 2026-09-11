"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, ExternalLink, Loader2, CheckCircle2, ShieldCheck, Database } from "lucide-react";
import { depositToZenodo } from "@/actions/doi-registration";

interface ZenodoDepositCardProps {
    submissionId: number;
    publication?: {
        doi?: string | null;
        doiProvider?: string | null;
        doiRegistrationStatus?: string | null;
        doiRegistrationBatchId?: string | null;
    } | null;
    initialDeposit?: {
        doi: string;
        recordUrl: string;
    } | null;
}

export function ZenodoDepositCard({
    submissionId,
    publication,
    initialDeposit,
}: ZenodoDepositCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Determine initial deposit state
    const [deposit, setDeposit] = useState<{ doi: string; recordUrl: string } | null>(() => {
        if (initialDeposit?.recordUrl || initialDeposit?.doi) {
            return initialDeposit;
        }
        if (publication?.doiProvider === "zenodo" && publication.doi) {
            return {
                doi: publication.doi,
                recordUrl: publication.doiRegistrationBatchId
                    ? `https://zenodo.org/record/${publication.doiRegistrationBatchId}`
                    : `https://doi.org/${publication.doi}`,
            };
        }
        return null;
    });

    if (!publication) {
        return null;
    }

    const handleDeposit = () => {
        startTransition(async () => {
            try {
                const res = await depositToZenodo(submissionId);
                if (res.success && res.data) {
                    setDeposit({
                        doi: res.data.zenodoDoi,
                        recordUrl: res.data.recordUrl,
                    });
                    toast.success("Successfully deposited to Zenodo!", {
                        description: `Deposit DOI: ${res.data.zenodoDoi}`,
                    });
                    router.refresh();
                } else {
                    toast.error(res.error || "Failed to deposit to Zenodo.");
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Deposit request failed";
                toast.error(`Zenodo error: ${msg}`);
            }
        });
    };

    if (deposit) {
        return (
            <Card className="border-sky-200 bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl overflow-hidden animate-in fade-in duration-500 shadow-sm">
                <CardHeader className="pb-3 border-b border-sky-200/50 bg-sky-100/30 dark:bg-sky-900/30">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                                <Database className="w-4 h-4" />
                            </div>
                            <div>
                                <CardTitle className="text-xs font-black uppercase tracking-wider text-sky-900 dark:text-sky-100">
                                    Zenodo Open Archive
                                </CardTitle>
                                <CardDescription className="text-[11px] text-sky-700/80 dark:text-sky-300/80">
                                    CERN / OpenAIRE Open Access Repository
                                </CardDescription>
                            </div>
                        </div>
                        <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-300/50 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Archived
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    <p className="text-xs text-sky-800/80 dark:text-sky-200/80 leading-relaxed">
                        A permanent open-access preprint/postprint record is safely archived on the CERN Zenodo repository for EU/OpenAIRE compliance.
                    </p>

                    {deposit.doi && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-background/50 border border-sky-200 text-xs">
                            <span className="text-sky-900/60 dark:text-sky-300/60 font-mono text-[11px] font-bold">Zenodo DOI</span>
                            <span className="font-mono font-bold text-sky-700 dark:text-sky-400 text-[11px]">{deposit.doi}</span>
                        </div>
                    )}

                    {deposit.recordUrl && (
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="w-full h-9 gap-2 rounded-xl text-xs font-bold uppercase tracking-wider border-sky-300/60 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-950"
                        >
                            <a href={deposit.recordUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Zenodo Deposition
                            </a>
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/10 shadow-sm rounded-2xl overflow-hidden bg-muted/5">
            <CardHeader className="pb-3 border-b border-primary/5 bg-primary/2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                            <Globe className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-black uppercase tracking-wider text-primary">
                                Open Access Self-Archiving
                            </CardTitle>
                            <CardDescription className="text-[11px] text-muted-foreground">
                                Optional Zenodo Repository (CERN / OpenAIRE)
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-primary/10">
                        Optional
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    IJITEST registers all accepted publications with CrossRef as the primary canonical DOI authority. You can optionally deposit a secondary record to the CERN Zenodo repository for European Open Science and OpenAIRE discovery.
                </p>

                {publication.doi && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/5 text-xs">
                        <span className="text-muted-foreground font-mono text-[10px] font-bold uppercase">Canonical CrossRef DOI</span>
                        <span className="font-mono font-bold text-primary text-[11px]">{publication.doi}</span>
                    </div>
                )}

                <Button
                    onClick={handleDeposit}
                    disabled={isPending}
                    variant="outline"
                    className="w-full h-9 gap-2 rounded-xl text-xs font-bold uppercase tracking-wider border-primary/20 hover:bg-primary/5 text-primary"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Connecting to Zenodo...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            Deposit to Zenodo
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
