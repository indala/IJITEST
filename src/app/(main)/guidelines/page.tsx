import { getSettingsData } from '@/actions/settings';
import GuidelinesContent from "./GuidelinesContent";
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Author Guidelines | ${settings['journalName']}`,
        description: `Comprehensive protocol for submitting manuscripts to ${settings['journalShortName']}. Detailed instructions on formatting, templates, and ethical requirements for global research publication.`,
        alternates: {
            canonical: '/guidelines',
        },
        openGraph: {
            title: `Submission Protocol - ${settings['journalShortName']}`,
            description: `Author resources and manuscript formatting templates.`,
            url: '/guidelines',
            type: 'website',
        }
    };
}

export default async function AuthorGuidelines() {
    const settings = await getSettingsData();
    return <GuidelinesContent settings={settings} />;
}
