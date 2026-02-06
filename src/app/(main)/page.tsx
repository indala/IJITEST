import HomeCarousel from '@/components/HomeCarousel';
import WelcomeSection from '@/components/home/WelcomeSection';
import HomeStats from '@/components/home/HomeStats';
import AimAndScope from '@/components/home/AimAndScope';
import IndexingLogos from '@/components/home/IndexingLogos';
import PublisherSection from '@/components/home/PublisherSection';
import TrackManuscriptWidget from '@/components/widgets/TrackManuscriptWidget';
import AnnouncementsWidget from '@/components/widgets/AnnouncementsWidget';
import CallForPapersWidget from '@/components/widgets/CallForPapersWidget';
import ResourceDeskWidget from '@/components/widgets/ResourceDeskWidget';
import EthicsWidget from '@/components/widgets/EthicsWidget';
import { getSettings } from '@/actions/settings';

export default async function Home() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <HomeCarousel />

      {/* Institutional Core Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-20">
            <WelcomeSection journalName={settings.journal_name} journalShortName={settings.journal_short_name} />
            <HomeStats />
            <AimAndScope journalShortName={settings.journal_short_name} />
          </div>

          {/* Institutional Sidebar */}
          <div className="space-y-10">
            <TrackManuscriptWidget />
            <AnnouncementsWidget />
            <CallForPapersWidget />
            <ResourceDeskWidget />
            <EthicsWidget />
          </div>
        </div>
      </section>

      <IndexingLogos />
      <PublisherSection />
    </div>
  );
}
