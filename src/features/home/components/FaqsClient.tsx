'use client';

import React, { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Search, Sparkles, BookOpen, Clock, ShieldAlert, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { useSettingsStore } from '@/store/useSettingsStore';
import { JsonLd } from '@/components/shared/JsonLd';

interface FAQ {
  category: 'general' | 'author' | 'review' | 'fees';
  question: string;
  answer: React.ReactNode;
  plainTextAnswer: string;
}

export default function FaqsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'author' | 'review' | 'fees'>('all');

  const settings = useSettingsStore((state) => state.settings);
  const apcInr = settings['apcInr'] || '2500';
  const apcUsd = settings['apcUsd'] || '50';

  const categories = [
    { id: 'all', name: 'All FAQs', icon: Sparkles },
    { id: 'general', name: 'General & Scope', icon: BookOpen },
    { id: 'author', name: 'Author Desk', icon: ShieldAlert },
    { id: 'review', name: 'Peer Review', icon: Clock },
    { id: 'fees', name: 'APC & Indexing', icon: Award }
  ] as const;

  const faqs = useMemo<FAQ[]>(() => [
    {
      category: 'review',
      question: "How long does the peer-review process take?",
      answer: "Our standard peer-review process typically takes 4-6 weeks. We prioritize quality and thoroughness while ensuring a fast-track publication path for groundbreaking research.",
      plainTextAnswer: "Our standard peer-review process typically takes 4-6 weeks. We prioritize quality and thoroughness while ensuring a fast-track publication path for groundbreaking research."
    },
    {
      category: 'fees',
      question: "Is IJITEST indexed in major databases?",
      answer: "As a new scholarly startup, IJITEST is currently in the process of being indexed with major databases like Google Scholar and Crossref. We are committed to ensuring maximum visibility for all published research as we grow.",
      plainTextAnswer: "As a new scholarly startup, IJITEST is currently in the process of being indexed with major databases like Google Scholar and Crossref. We are committed to ensuring maximum visibility for all published research as we grow."
    },
    {
      category: 'fees',
      question: "Does the journal have an ISSN number?",
      answer: "We have initiated the application process for the International Standard Serial Number (ISSN). Authors will be updated as soon as the formal registration is completed, which will apply retrospectively to all published volumes.",
      plainTextAnswer: "We have initiated the application process for the International Standard Serial Number (ISSN). Authors will be updated as soon as the formal registration is completed, which will apply retrospectively to all published volumes."
    },
    {
      category: 'author',
      question: "What are the submission guidelines for authors?",
      answer: (
        <span>
          Authors should ensure their manuscripts follow our standard template, include an abstract, keywords, and properly formatted references. Detailed guidelines are available in our{" "}
          <Link href="/guidelines" className="text-[#000066] font-semibold underline hover:text-[#000088] transition-colors">
            Author Resource Desk
          </Link>.
        </span>
      ),
      plainTextAnswer: "Authors should ensure their manuscripts follow our standard template, include an abstract, keywords, and properly formatted references. Detailed guidelines are available in our Author Resource Desk."
    },
    {
      category: 'general',
      question: "Do you provide Open Access publication?",
      answer: "Yes, IJITEST is a Gold Open Access journal. All published articles are immediately available to the global research community without any subscription barriers.",
      plainTextAnswer: "Yes, IJITEST is a Gold Open Access journal. All published articles are immediately available to the global research community without any subscription barriers."
    },
    {
      category: 'general',
      question: "How can I join the Editorial Board or become a Reviewer?",
      answer: (
        <span>
          We welcome experts from various engineering and science disciplines. You can apply through our{" "}
          <Link href="/join-us" className="text-[#000066] font-semibold underline hover:text-[#000088] transition-colors">
            Join Us
          </Link>{" "}
          page by submitting your CV and area of expertise.
        </span>
      ),
      plainTextAnswer: "We welcome experts from various engineering and science disciplines. You can apply through our Join Us page by submitting your CV and area of expertise."
    },
    {
      category: 'fees',
      question: "What are the Article Processing Charges (APC)?",
      answer: `The Article Processing Charges (APC) are only applicable after acceptance. Standard charges are INR ${apcInr} for Indian authors and USD ${apcUsd} for international authors. However, we are offering a 100% APC Waiver for the inaugural 2026 volume.`,
      plainTextAnswer: `The Article Processing Charges (APC) are only applicable after acceptance. Standard charges are INR ${apcInr} for Indian authors and USD ${apcUsd} for international authors. However, we are offering a 100% APC Waiver for the inaugural 2026 volume.`
    },
    {
      category: 'author',
      question: "How can I track the status of my submitted paper?",
      answer: (
        <span>
          You can track your paper in real-time on our{" "}
          <Link href="/track" className="text-[#000066] font-semibold underline hover:text-[#000088] transition-colors">
            Track Manuscript
          </Link>{" "}
          portal using your Submission ID or registered email.
        </span>
      ),
      plainTextAnswer: "You can track your paper in real-time on our Track Manuscript portal using your Submission ID or registered email."
    },
    {
      category: 'author',
      question: "Can I submit my manuscript in DOCX format?",
      answer: "Yes, we accept manuscripts in both DOCX and PDF formats. Our server automatically handles the layout conversion, and authors can review the generated PDF inside their dashboards.",
      plainTextAnswer: "Yes, we accept manuscripts in both DOCX and PDF formats. Our server automatically handles the layout conversion, and authors can review the generated PDF inside their dashboards."
    }
  ], [apcInr, apcUsd]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesTab = activeTab === 'all' || faq.category === activeTab;
      const matchesSearch = searchQuery.trim() === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.plainTextAnswer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [faqs, activeTab, searchQuery]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.ijitest.org';

  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${baseUrl}/faqs#faq-schema`,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.plainTextAnswer
      }
    }))
  }), [faqs, baseUrl]);

  return (
    <div className="w-full max-w-4xl space-y-10">
      <JsonLd id="faqs-page-schema" data={faqSchema as Record<string, unknown>} />
      
      {/* Search Bar */}
      <div className="relative max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <Input
          type="text"
          placeholder="Search questions or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 bg-white rounded-xl border border-border/50 shadow-sm focus-visible:ring-[#000066]/20 focus-visible:border-[#000066]"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border/40 pb-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.id}
              variant={activeTab === cat.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "h-10 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider gap-2 cursor-pointer transition-all",
                activeTab === cat.id 
                  ? "bg-[#000066] text-white shadow-md shadow-[#000066]/10" 
                  : "text-muted-foreground hover:text-[#000066] hover:bg-muted/40"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
            </Button>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      {filteredFaqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {filteredFaqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border/50 rounded-2xl bg-card px-6 md:px-8 transition-all hover:border-[#000066]/20 shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="text-left py-6 text-sm md:text-base font-semibold text-foreground hover:no-underline hover:text-[#000066] transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-[#000066]/60 shrink-0" />
                  {faq.question}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground/90 text-sm leading-relaxed pb-6 border-t border-border/10 mt-1 pt-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-20 bg-card/30 border border-dashed border-border/60 rounded-3xl">
          <HelpCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-sm font-semibold text-muted-foreground">No questions found matching your criteria.</p>
        </div>
      )}

      {/* Support Box */}
      <div className="bg-slate-200/50 p-6 md:p-8 rounded-3xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6 mt-12 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-[#000066] m-0">Still have questions?</h4>
          <p className="text-xs text-muted-foreground m-0">If you couldn&apos;t find an answer to your query, please reach out to our editorial desk.</p>
        </div>
        <Button asChild className="h-11 px-6 bg-[#000066] hover:bg-[#000088] text-white rounded-xl shadow-md cursor-pointer transition-all">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
