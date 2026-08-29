// Server Component — the structural wrapper ships zero JS
import { TopBarDynamic } from './TopBarDynamic';
import { getSettingsData } from '@/actions/settings';

export default async function TopBar() {
    const settings = await getSettingsData();
    return (
        <div className="bg-primary text-white py-2 sm:py-3 px-2 lg:px-4 border-b border-white/10 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
                {/* Dynamic journal metadata — only this island is hydrated */}
                <TopBarDynamic settings={settings} />
            </div>
        </div>
    );
}