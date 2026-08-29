"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { markPromotionAsSeen } from '@/actions/promotion';

import { useSettingsContext } from '@/components/providers/SettingsContext';

const PROMOTION_SEEN_KEY = 'hasSeenPromotion';
const PROMOTION_SNOOZED_KEY = 'promotionSnoozedUntil';
const SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function PromotionPopup() {
    const settings = useSettingsContext();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const hasSeen = localStorage.getItem(PROMOTION_SEEN_KEY);
            const snoozeUntil = localStorage.getItem(PROMOTION_SNOOZED_KEY);
            const isSnoozed = snoozeUntil ? Date.now() < Number(snoozeUntil) : false;
            const isPromotionActive = (settings['isPromotionActive'] || '') !== 'false';

            if (!hasSeen && !isSnoozed && isPromotionActive) {
                setIsVisible(true);
            }
        }, 5000); // 5 seconds delay

        return () => clearTimeout(timer);
    }, [settings]);

    const handlePermanentClose = async () => {
        setIsVisible(false);
        localStorage.setItem(PROMOTION_SEEN_KEY, 'true');
        // Effortlessly sync with DB if session exists (handled by action)
        await markPromotionAsSeen();
    };

    const handleSnooze = () => {
        setIsVisible(false);
        const snoozeUntil = Date.now() + SNOOZE_DURATION_MS;
        localStorage.setItem(PROMOTION_SNOOZED_KEY, snoozeUntil.toString());
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed  inset-0 z-100 flex items-center justify-center p-4  bg-black/70 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="border border-border/80 relative max-w-md w-full bg-card rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSnooze}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-primary hover:bg-muted transition-all z-20 rounded-lg border border-border/40 cursor-pointer"
                            aria-label="Close promotion"
                        >
                            <X className="w-4 h-4" />
                        </Button>

                        <div className="relative z-10 p-6 text-center flex flex-col h-full overflow-y-auto custom-scrollbar">
                            <div className="shrink-0 mb-3">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/5 rounded-xl text-primary border border-primary/10 mx-auto">
                                    <Sparkles className="size-6 text-secondary" />
                                </div>
                            </div>

                            <div className="space-y-1.5 mb-3 shrink-0">
                                <h2 className="text-primary m-0">
                                    Publish Your Research
                                </h2>
                                <p className="text-muted-foreground border-l-2 border-secondary pl-3 text-left m-0 text-xs leading-relaxed">
                                    In our commitment to supporting the next generation of innovators, the Primary Investigator will receive a 100% APC Waiver for our inaugural 2026 volume.
                                </p>
                            </div>

                            <div className="bg-primary/5 p-3.5 rounded-xl border border-primary/10 flex items-center gap-3 text-left shrink-0 mb-4">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-xs shrink-0 border border-primary/10">
                                    <Gift className="w-5 h-5 text-secondary" />
                                </div>
                                <p className="text-muted-foreground text-xs m-0">
                                    Limited engagement window. Applicable for high-fidelity technical submissions validated this session.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 mt-auto shrink-0">
                                <Link href="/submit" className="w-full">
                                    <Button
                                        onClick={handlePermanentClose}
                                        className="w-full h-10 bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer shadow-xs transition-all font-bold text-xs group/btn"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Submit Paper <Send className="size-3.5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    onClick={handleSnooze}
                                    className="text-muted-foreground hover:text-foreground transition-all h-8 text-xs cursor-pointer font-medium"
                                >
                                    Ask me later
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
