import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import { getSettings } from "@/actions/settings";
import PromotionPopup from "@/components/PromotionPopup";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getSettings();

    return (
        <>
            <PromotionPopup />
            <TopBar settings={settings} />
            <Navbar settings={settings} />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer settings={settings} />
        </>
    );
}
