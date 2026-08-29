'use client';

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useSettingsContext } from '@/components/providers/SettingsContext';

function HomeStats() {
    const settings = useSettingsContext();

    const stats = useMemo(() => {
        const list = [
            { 
                label: "Peer Review", 
                value: "Double-Blind (2-3 Wks)" 
            },
            { 
                label: "Publication", 
                value: settings?.publicationFrequency ? `${settings.publicationFrequency} Issues` : "Monthly Issues" 
            },
            { 
                label: "Open Access", 
                value: "100% Gold Access" 
            },
        ];

        const rawInr = settings?.apcInr?.trim();
        const rawUsd = settings?.apcUsd?.trim();

        const numInr = rawInr ? parseFloat(rawInr) : null;
        const numUsd = rawUsd ? parseFloat(rawUsd) : null;

        // If APC is set and greater than 0
        if (numInr !== null && numInr > 0) {
            const usdPart = numUsd && numUsd > 0 ? ` / $${numUsd}` : '';
            list.push({
                label: "Article Charges",
                value: `APC: ₹${numInr}${usdPart}`
            });
        } else if (numInr === 0 || rawInr === '0') {
            list.push({
                label: "Article Charges",
                value: "₹0 / Free Waiver"
            });
        }

        return list;
    }, [settings]);

    const gridCols = stats.length === 4 
        ? "grid-cols-2 sm:grid-cols-4" 
        : "grid-cols-1 sm:grid-cols-3";

    return (
        <div className={`grid ${gridCols} gap-2.5 sm:gap-3 2xl:gap-4`}>
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="h-full"
                >
                    <Card className="h-full border border-border/60 bg-card hover:border-primary/30 transition-all group overflow-hidden">
                        <CardContent className="p-3 sm:p-4 2xl:p-5 flex flex-col justify-between h-full">
                            <div>
                                <p className="text-[11px] 2xl:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 m-0">
                                    {stat.label}
                                </p>
                                <h3 className="text-xs sm:text-sm 2xl:text-base font-bold text-primary m-0">
                                    {stat.value}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

export default memo(HomeStats);