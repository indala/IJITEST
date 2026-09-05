import { getSettingsData } from '@/actions/settings';
import { getLatestPublishedIssue } from '@/actions/publications';
import { getLatestIssuePapers } from '@/actions/archives';
import type { Metadata } from 'next';
import HomeCarousel from '@/features/home/components/HomeCarousel';
import WelcomeSection from '@/features/home/components/WelcomeSection';
import HomeStats from '@/features/home/components/HomeStats';
import HomeCurrentIssue from '@/features/home/components/HomeCurrentIssue';
import AimAndScope from '@/features/home/components/AimAndScope';
import HomeIndexingStrip from '@/features/home/components/HomeIndexingStrip';
import PublicationWorkflow from '@/features/home/components/PublicationWorkflow';
import DisciplineTaxonomyGrid from '@/features/home/components/DisciplineTaxonomyGrid';
import AnnouncementsWidget from '@/features/shared/widgets/AnnouncementsWidget';
import CurrentIssueWidget from '@/features/shared/widgets/CurrentIssueWidget';
import PublisherSection from '@/features/home/components/PublisherSection';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import AuthorQuickLinks from '@/features/home/components/AuthorQuickLinks';
import CallForPapersWidget from '@/features/shared/widgets/CallForPapersWidget';
import ResourceDeskWidget from '@/features/shared/widgets/ResourceDeskWidget';
import EthicsWidget from '@/features/shared/widgets/EthicsWidget';
import JournalMetricsWidget from '@/features/shared/widgets/JournalMetricsWidget';
import ApcFeeWidget from '@/features/shared/widgets/ApcFeeWidget';
import AnnouncementBar from '@/features/home/components/AnnouncementBar';
import { Section } from '@/components/layout/Section';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettingsData();
  return {
    title: settings['journalName'],
    description: `Welcome to ${settings['journalName']} (${settings['journalShortName']}). We provide a global platform for breakthrough research in engineering, science, and technology with rapid, high-quality peer review.`,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: settings['journalName'],
      description: `Advancing scientific excellence through innovative trends. Explore peer-reviewed research and elite academic publishing at ${settings['journalShortName']}.`,
      type: 'website',
      siteName: settings['journalName'],
      images: [
        {
          url: '/open_graph_img.png',
          width: 1200,
          height: 630,
          alt: `${settings['journalShortName']} - Global Research Platform`,
        },
      ],
    }
  };
}

export default async function Home() {
  const [settings, latestIssueRes, latestPapersRes] = await Promise.all([
    getSettingsData(),
    getLatestPublishedIssue(),
    getLatestIssuePapers()
  ]);

  const latestIssue = latestIssueRes.success ? latestIssueRes.data : null;
  const latestPapers = latestPapersRes.success ? (latestPapersRes.data ?? []) : [];

  return (
    <div className="flex flex-col overflow-hidden bg-background relative">
      <AnnouncementBar latestPaper={latestPapers[0]} />
      
      {/* Background Decorative Blob */}
      <div className="absolute top-[20%] right-0 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <HomeCarousel />

      {/* Institutional Core Section */}
      <Section className="relative z-10" padding={false}>
        <SidebarLayout
          className="my-6 sm:my-8"
          sidebar={
            <>
              <div className="p-1 rounded-2xl bg-linear-to-br from-primary/10 to-transparent border border-primary/10 shadow-2xs">
                <div className="bg-primary/5 backdrop-blur-xs p-1.5 rounded-xl">
                  <TrackManuscriptWidget />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <CurrentIssueWidget latestIssue={latestIssue} />
                <AnnouncementsWidget latestIssue={latestIssue} />
                <AuthorQuickLinks />
                <CallForPapersWidget />
                <ApcFeeWidget />
                <JournalMetricsWidget />
                <ResourceDeskWidget settings={settings} />
                <EthicsWidget />
              </div>
            </>
          }
        >
          <WelcomeSection settings={settings} />
          <HomeStats settings={settings} />
          <HomeCurrentIssue latestIssue={latestIssue} papers={latestPapers} />
          <PublicationWorkflow />
          <DisciplineTaxonomyGrid />
          <AimAndScope shortName={settings['journalShortName']} />
          <HomeIndexingStrip />
        </SidebarLayout>
      </Section>

      <PublisherSection settings={settings} />
    </div>
  );
}
