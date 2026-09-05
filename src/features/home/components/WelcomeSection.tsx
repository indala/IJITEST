import type { JournalSettings } from '@/db/types';

interface WelcomeSectionProps {
    settings: JournalSettings | Record<string, string | undefined>;
}

export default function WelcomeSection({ settings }: WelcomeSectionProps) {
    const name = settings['journalName'] || '';
    const shortName = settings['journalShortName'] || '';

    return (
        <section
            className="relative group animate-in fade-in slide-in-from-bottom-3 duration-700"
            aria-labelledby="welcome-heading"
        >
            <h2 id="welcome-heading">
                Welcome to {shortName}
            </h2>

            <div className="opacity-90 border-l-4 border-secondary/30 group-hover:border-secondary transition-colors duration-300 pl-3.5 space-y-2 text-left text-pretty max-w-none">
                <p title='welcome description' className='text-justify text-muted-foreground m-0'>
                    {name} ({shortName}) is an international, peer-reviewed scholarly journal dedicated to the dissemination of high-quality research in Engineering, Science, Technology, and Management. The journal encourages fundamental, interdisciplinary, theoretical, and applied research that advances innovation, industrial development, and sustainable practices across emerging and established domains. {shortName} follows a rigorous double-blind peer-review process and adheres strictly to global ethical publishing standards.
                </p>
                <div className="flex flex-wrap items-center gap-3 font-semibold text-primary/90 text-xs sm:text-sm 2xl:text-base border-t border-primary/10 pt-2.5 2xl:pt-3.5">
                    <span>Subject: <strong className="text-primary">{settings['journalSubject'] || 'Multidisciplinary Engineering & Technology'}</strong></span>
                    <span>•</span>
                    <span>Language: <strong className="text-primary">English</strong></span>
                    <span>•</span>
                    <span>Frequency: <strong className="text-primary">Monthly (12 Issues/Year)</strong></span>
                </div>
            </div>
        </section>
    );
}

