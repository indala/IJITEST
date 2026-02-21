import { getSettings } from '@/actions/settings';
import { Metadata } from 'next';
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
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings.journal_name} | Elite Academic Publishing`,
    description: `Welcome to ${settings.journal_name} (${settings.journal_short_name}). We provide a global platform for breakthrough research in engineering, science, and technology with rapid, high-quality peer review.`,
    openGraph: {
      title: settings.journal_name,
      description: `Advancing scientific excellence through innovative trends.`,
      type: 'website',
    }
  };
}

export default async function Home() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col overflow-hidden bg-background relative">
      {/* Background Decorative Blob */}
      <div className="absolute top-[20%] right-0 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[150px] -z-10 group-hover:bg-primary/5 transition-colors duration-1000" />
      <div className="absolute bottom-[10%] left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 group-hover:bg-secondary/10 transition-colors duration-1000" />

      <HomeCarousel />

      {/* Institutional Core Section */}
      <section className="py-16 sm:py-24 max-w-7xl xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">

          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-16 sm:space-y-24">
            <WelcomeSection
              journalName={settings.journal_name}
              journalShortName={settings.journal_short_name}
              settings={settings}
            />
            <HomeStats />
            <AimAndScope journalShortName={settings.journal_short_name} />
          </div>

          {/* Institutional Sidebar */}
          <div className="space-y-10 sm:space-y-12">
            <div className="p-1 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/5 shadow-vip hover:shadow-vip-hover transition-shadow duration-500">
              <div className="bg-white/50 backdrop-blur-sm p-2 rounded-[1.8rem]">
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
          </div>
        </div>
      </section>

      <PublisherSection settings={settings} />
    </div>
  );
}
