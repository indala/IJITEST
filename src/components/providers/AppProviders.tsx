"use client";

import type { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/lib/query-provider";
import { MotionProvider } from "@/providers/MotionProvider";
import { SettingsProvider } from "./SettingsContext";
import type { JournalSettings } from "@/db/protocols";

type AppProvidersProps = {
    settings: JournalSettings;
    children: ReactNode;
};

export function AppProviders({ settings, children }: AppProvidersProps) {
    return (
        <MotionProvider>
            <NuqsAdapter>
                <QueryProvider>
                    <SettingsProvider settings={settings}>
                        <TooltipProvider>
                            {children}
                            <Toaster position="top-right" offset={50} richColors closeButton />
                        </TooltipProvider>
                    </SettingsProvider>
                </QueryProvider>
            </NuqsAdapter>
        </MotionProvider>
    );
}
