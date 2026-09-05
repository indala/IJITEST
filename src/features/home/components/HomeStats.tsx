import { Card, CardContent } from "@/components/ui/card";
import type { JournalSettings } from "@/db/types";

interface HomeStatsProps {
    settings: JournalSettings | Record<string, string | undefined>;
}

export default function HomeStats({ settings }: HomeStatsProps) {
    const list = [
        { 
            label: "Peer Review", 
            value: "Double-Blind (2-3 Wks)" 
        },
        { 
            label: "Publication", 
            value: settings?.['publicationFrequency'] ? `${settings['publicationFrequency']} Issues` : "Monthly Issues" 
        },
        { 
            label: "Open Access", 
            value: "100% Gold Access" 
        },
    ];

    const rawInr = settings?.['apcInr']?.trim();
    const rawUsd = settings?.['apcUsd']?.trim();

    const numInr = rawInr ? parseFloat(rawInr) : null;
    const numUsd = rawUsd ? parseFloat(rawUsd) : null;

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

    const gridCols = list.length === 4 
        ? "grid-cols-2 sm:grid-cols-4" 
        : "grid-cols-1 sm:grid-cols-3";

    return (
        <div className={`grid ${gridCols} gap-2.5 sm:gap-3 2xl:gap-4`}>
            {list.map((stat) => (
                <div
                    key={stat.label}
                    className="h-full animate-in fade-in zoom-in-95 duration-500"
                >
                    <Card className="h-full border border-border/60 bg-card hover:border-primary/30 transition-all group overflow-hidden">
                        <CardContent className="p-3 sm:p-4 2xl:p-5 flex flex-col justify-between h-full">
                            <div>
                                <p className="text-label text-muted-foreground mb-1 m-0">
                                    {stat.label}
                                </p>
                                <h3 className="text-primary m-0">
                                    {stat.value}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    );
}
