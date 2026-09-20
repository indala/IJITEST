import type { JournalSettings } from '@/db/protocols';

interface WelcomeSectionProps {
    settings: JournalSettings | Record<string, string | undefined>;
}

export default function WelcomeSection({ settings }: WelcomeSectionProps) {
    const name = settings['journalName'] || 'International Journal of Innovative Trends in Engineering, Science and Technology';
    const shortName = settings['journalShortName'] || 'IJITEST';
    const issn = settings['issnNumber'] || '3139-6887';
    const publicationFrequency = settings['publicationFrequency'] || 'Monthly';
    const frequency = publicationFrequency.split('(')[0]?.trim() || publicationFrequency;
    const startingYear = settings['startingYear'] || '2026';

    return (
        <section
            className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-500"
            aria-labelledby="welcome-heading"
        >
            <h2 id="welcome-heading" className="m-0">
                Welcome to {shortName}
            </h2>

            <div className="border-l-2 border-secondary/60 pl-4 space-y-3 text-left">
                <p title="welcome description" className="text-body text-justify m-0">
                    {name} ({shortName}) is an international, peer-reviewed, open-access journal for original research in engineering, science, technology, and applied disciplines. The journal welcomes theoretical, experimental, and interdisciplinary studies that contribute to responsible scientific and technological progress.
                </p>

                {/* Clean, unboxed academic metadata with symbols */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-border/50 text-body-sm">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="text-secondary">▪</span>
                        <span>ISSN (Online): <span className="font-semibold text-primary">{issn}</span></span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="text-secondary">▪</span>
                        <span>Frequency: <span className="font-medium text-foreground">{frequency}</span></span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="text-secondary">▪</span>
                        <span>Review: <span className="font-medium text-foreground">Double-Blind Peer Review</span></span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="text-secondary">▪</span>
                        <span>Access: <span className="font-medium text-secondary">Gold Open Access</span></span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="text-secondary">▪</span>
                        <span>Established: <span className="font-medium text-foreground">{startingYear}</span></span>
                    </span>
                </div>
            </div>
        </section>
    );
}
