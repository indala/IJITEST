import { getSettingsData } from '@/actions/settings';
import GuidelinesContent from "./GuidelinesContent";
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Author Guidelines | ${settings.journalName}`,
        description: `Comprehensive protocol for submitting manuscripts to ${settings.journalShortName}. Detailed instructions on formatting, templates, and ethical requirements for global research publication.`,
        openGraph: {
            title: `Submission Protocol - ${settings.journalShortName}`,
            description: `Author resources and manuscript formatting templates.`,
            type: 'website',
        }
    };
}

export default async function AuthorGuidelines() {
    return <GuidelinesContent />;
}
