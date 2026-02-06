"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift } from 'lucide-react';

export default function PromotionPopup() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const hasSeen = localStorage.getItem('hasSeenPromotion');
            if (!hasSeen) {
                setIsVisible(true);
            }
        }, 5000); // 5 seconds delay

        return () => clearTimeout(timer);
    }, []);

    const closePopup = () => {
        setIsVisible(false);
        localStorage.setItem('hasSeenPromotion', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative max-w-lg w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        {/* Close Button */}
                        <button
                            onClick={closePopup}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors z-20 bg-gray-50 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative z-10 p-10 text-center space-y-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl text-primary mb-2">
                                <Sparkles className="w-10 h-10" />
                            </div>

                            <div className="space-y-4">
                                <span className="inline-block px-4 py-1.5 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
                                    Special Offer
                                </span>
                                <h2 className="text-4xl font-serif font-black text-gray-900 italic leading-tight">
                                    Publish Your Research <br />
                                    <span className="text-primary italic">Absolutely Free!</span>
                                </h2>
                                <p className="text-gray-600 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6 text-left">
                                    In our commitment to supporting early-career researchers, the <strong>First Author</strong> will receive <strong>100% Waiver</strong> on Article Processing Charges (APC) for our 2026 issues.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                    <Gift className="w-6 h-6 text-secondary" />
                                </div>
                                <p className="text-xs font-bold text-gray-500 italic">
                                    Limited time offer. Applicable for high-quality technical papers submitted this month.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={closePopup}
                                    className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    Submit Now
                                </button>
                                <button
                                    onClick={closePopup}
                                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                                >
                                    Remind Me Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
