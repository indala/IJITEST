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
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
                Skip to main content
            </a>
            <PromotionPopup />
            <TopBar />
            <Navbar />
            <main id="main-content" tabIndex={-1} className="min-h-screen focus:outline-none">
                <Suspense fallback={null}>
                    {children}
                </Suspense>
            </main>
            <Footer />
            <ScrollToTop />
        </SmoothScroll>
    );
}
