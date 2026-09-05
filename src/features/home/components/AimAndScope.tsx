import type { JournalSettings } from '@/db/types';

const disciplines = [
    "Computer Science and Engineering",
    "Artificial Intelligence, Machine Learning & Data Science",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Information Technology and Cybersecurity",
    "Mechanical, Robotics & Automation Engineering",
    "Civil and Environmental Engineering",
    "Chemical, Materials & Energy Engineering",
    "Biomedical Engineering & Health Informatics",
    "Interdisciplinary Engineering and Applied Sciences",
    "And all other Engineering & Technology Disciplines."
];

interface AimAndScopeProps {
    settings?: JournalSettings | Record<string, string | undefined>;
    shortName?: JournalSettings['journalShortName'] | undefined;
}

export default function AimAndScope({ settings, shortName }: AimAndScopeProps) {
    const displayShortName = shortName || settings?.['journalShortName'] || 'IJITEST';
    const journalName = settings?.['journalName'] || 'International Journal of Innovative Trends in Engineering, Science and Technology';
    const startingYear = settings?.['startingYear'] || '2026';
    const frequency = settings?.['publicationFrequency'] || 'Monthly (12 Issues per year)';

    return (
        <section className="space-y-4 pt-1 animate-in fade-in duration-500" aria-labelledby="aim-scope-heading">
            {/* Journal Particulars Overview */}
            <div className="space-y-1 text-xs sm:text-sm text-foreground/85">
                <p className="m-0">
                    <span className="font-semibold text-primary">Year of Commencement:</span> {startingYear}.
                </p>
                <p className="m-0">
                    <span className="font-semibold text-primary">Frequency:</span> {displayShortName} publishes one volume with 12 issues per year ({frequency}).
                </p>
            </div>

            {/* Aim and Scope Heading & Domain */}
            <div className="space-y-1.5 pt-1">
                <h2 id="aim-scope-heading" className="m-0">
                    Aim and Scope
                </h2>
                <h4 className="text-secondary font-semibold m-0 text-sm sm:text-base">
                    All Engineering & Technology Disciplines
                </h4>
            </div>

            {/* Scope Narrative */}
            <p className="text-body text-justify m-0">
                {journalName} ({displayShortName}) is an open-access, double-blind peer-reviewed journal that publishes original research papers, survey articles, and technical briefs in all fields of Engineering, Science, and Technology Disciplines. The journal provides a rapid and rigorous platform for researchers, academicians, and industry practitioners worldwide to share pioneering findings and emerging innovations.
            </p>

            {/* Topics List with Symbols */}
            <div className="space-y-2 pt-1">
                <p className="font-semibold text-primary m-0 text-xs sm:text-sm">
                    Topics include, but are not limited to, the following:
                </p>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 list-none p-0 m-0">
                    {disciplines.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/85">
                            <span className="text-secondary font-bold text-xs select-none mt-0.5" aria-hidden="true">▪</span>
                            <span className="leading-snug">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
