"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative max-w-lg w-full bg-white rounded-[3rem] overflow-hidden shadow-vip border border-primary/5 max-h-[90vh] flex flex-col"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={closePopup}
                            className="absolute top-6 right-6 p-2 text-primary/40 hover:text-secondary hover:bg-secondary/10 transition-all z-20 rounded-2xl shadow-inner border border-primary/5"
                            aria-label="Close protocol"
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        <div className="relative z-10 p-10 sm:p-14 text-center space-y-8 overflow-y-auto sm:overflow-y-visible">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/5 rounded-[2rem] text-primary mb-2 mx-auto shadow-inner border border-primary/5">
                                <Sparkles className="w-10 h-10" />
                            </div>

                            <div className="space-y-4">
                                <Badge variant="secondary" className="px-4 py-1.5 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-lg shadow-secondary/20">
                                    Strategic Incentive
                                </Badge>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary leading-none tracking-tighter">
                                    Publish Research <br />
                                    <span className="text-secondary">Gratis Protocol</span>
                                </h2>
                                <p className="text-sm text-primary/60 font-medium leading-relaxed border-l-4 border-secondary/50 pl-8 text-left">
                                    In our commitment to supporting the next generation of innovators, the <strong>Primary Investigator</strong> will receive a <strong>100% APC Waiver</strong> for our inaugural 2026 volume.
                                </p>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/5 flex items-center gap-6 text-left shadow-inner">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-primary/5">
                                    <Gift className="w-7 h-7 text-secondary" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 leading-relaxed">
                                    Limited engagement window. Applicable for high-fidelity technical submissions validated this session.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                <Button
                                    onClick={closePopup}
                                    className="w-full h-16 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all group/btn"
                                >
                                    <span className="flex items-center gap-2">
                                        Transmit Submission <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={closePopup}
                                    className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] hover:text-primary transition-all h-12"
                                >
                                    Deferred Engagement
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
