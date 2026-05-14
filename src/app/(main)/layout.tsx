import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopBar from "@/components/layout/TopBar";
import PromotionPopup from "@/features/home/components/PromotionPopup";


export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <PromotionPopup />
            <TopBar />
            <Navbar />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </>
    );
}
