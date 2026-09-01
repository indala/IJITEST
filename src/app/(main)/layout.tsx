import type { ReactNode } from "react";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopBar from "@/components/layout/TopBar";
import PromotionPopup from "@/features/home/components/PromotionPopup";
import ScrollToTop from "@/components/common/ScrollToTop";
import SmoothScroll from "@/providers/SmoothScroll";

export default async function MainLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <SmoothScroll>
            <PromotionPopup />
            <TopBar />
            <Suspense fallback={null}>
                <Navbar />
            </Suspense>
            <main id="main-content" className="min-h-screen">
                <Suspense fallback={null}>
                    {children}
                </Suspense>
            </main>
            <Footer />
            <ScrollToTop />
        </SmoothScroll>
    );
}
