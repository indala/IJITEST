import type { JournalSettings } from '@/db/types';

interface AimAndScopeProps {
    settings?: JournalSettings | Record<string, string | undefined>;
    shortName?: JournalSettings['journalShortName'] | undefined;
}

export default function AimAndScope({ settings, shortName }: AimAndScopeProps) {
    const displayShortName = shortName || settings?.['journalShortName'] || 'IJITEST';
    const journalName = settings?.['journalName'] || 'International Journal of Innovative Trends in Engineering, Science and Technology';

    return (
        <section className="space-y-3.5 pt-1 animate-in fade-in duration-500" aria-labelledby="research-areas-heading">
            <h2 id="research-areas-heading" className="m-0">
                Research Areas
            </h2>

            <p className="text-body text-justify m-0">
                {journalName} ({displayShortName}) welcomes original research, review articles, and technical contributions across engineering, science, and technology, including interdisciplinary studies.
            </p>

            <a
                href="/aims-scope"
                className="inline-flex items-center text-body-sm font-semibold text-primary underline underline-offset-4 hover:text-secondary transition-colors"
            >
                Explore all research areas
                <span aria-hidden="true" className="ml-1">→</span>
            </a>
        </section>
    );
}
