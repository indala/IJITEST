import { getSettingsData } from '@/actions/settings';
import type { Metadata } from 'next';
import HomeCarousel from '@/features/home/components/HomeCarousel';
import WelcomeSection from '@/features/home/components/WelcomeSection';
import HomeStats from '@/features/home/components/HomeStats';
import AimAndScope from '@/features/home/components/AimAndScope';
import AnnouncementsWidget from '@/features/shared/widgets/AnnouncementsWidget';
import CurrentIssueWidget from '@/features/shared/widgets/CurrentIssueWidget';
import PublisherSection from '@/features/home/components/PublisherSection';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import AuthorQuickLinks from '@/features/home/components/AuthorQuickLinks';
import CallForPapersWidget from '@/features/shared/widgets/CallForPapersWidget';
import ResourceDeskWidget from '@/features/shared/widgets/ResourceDeskWidget';
import EthicsWidget from '@/features/shared/widgets/EthicsWidget';
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
  const settings = await getSettingsData();
  return (
    <main className="flex flex-col overflow-hidden bg-background relative">
      <AnnouncementBar />
      
      {/* Background Decorative Blob */}
      <div className="absolute top-[20%] right-0 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[150px] -z-10 group-hover:bg-primary/5 transition-colors duration-1000" />
      <div className="absolute bottom-[10%] left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 group-hover:bg-secondary/10 transition-colors duration-1000" />

      <HomeCarousel />

      {/* Institutional Core Section */}
      <Section className="relative z-10">
        <SidebarLayout
          className="my-20"
          sidebar={
            <>
              <div className="p-1 rounded-4xl bg-linear-to-br from-primary/10 to-transparent border border-primary/10 shadow-vip hover:shadow-vip-hover transition-shadow duration-500">
                <div className="bg-primary/5 backdrop-blur-sm p-2 rounded-[1.8rem]">
                  <TrackManuscriptWidget />
                </div>
              </div>

              <div className="space-y-8">
                <CurrentIssueWidget />
                <AnnouncementsWidget />
                <AuthorQuickLinks />
                <CallForPapersWidget />
                <ResourceDeskWidget settings={settings} />
                <EthicsWidget />
              </div>
            </>
          }
        >
          <WelcomeSection />
          <HomeStats />
          <AimAndScope />
        </SidebarLayout>
      </Section>

      <PublisherSection />
    </main>
  );
}
