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

interface FAQ {
  category: 'general' | 'author' | 'review' | 'fees';
  question: string;
  answer: React.ReactNode;
  plainTextAnswer: string;
}

interface FaqsClientProps {
  apcInr: string;
  apcUsd: string;
}

function highlightText(text: string, search: string): React.ReactNode {
  if (!search.trim()) return text;
  const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-100 text-[#000066] font-semibold rounded-xs px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function FaqsClient({ apcInr, apcUsd }: FaqsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'author' | 'review' | 'fees'>('all');

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
      answer: "Our peer-review process is designed to balance speed with rigor. Standard reviews take 4–6 weeks, while groundbreaking submissions may be considered for fast-track publication to ensure timely visibility.",
      plainTextAnswer: "Our peer-review process is designed to balance speed with rigor. Standard reviews take 4–6 weeks, while groundbreaking submissions may be considered for fast-track publication to ensure timely visibility."
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
      answer: "Yes! IJITEST is officially registered with the ISSN International Centre with E-ISSN: 3139-6887.",
      plainTextAnswer: "Yes! IJITEST is officially registered with the ISSN International Centre with E-ISSN: 3139-6887."
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
      category: 'author',
      question: "How do I track and manage my manuscript after submission?",
      answer: (
        <span>
          Upon submission, you can access your dedicated{" "}
          <Link href="/login" className="text-[#000066] font-semibold underline hover:text-[#000088] transition-colors">
            Author Dashboard Panel
          </Link>{" "}
          using your registered email. Inside, you can track peer-review status in real-time, view generated PDF drafts, upload revisions, and make APC payments.
        </span>
      ),
      plainTextAnswer: "Upon submission, you can access your dedicated Author Dashboard Panel using your registered email. Inside, you can track peer-review status in real-time, view generated PDF drafts, upload revisions, and make APC payments."
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
      answer: `Article Processing Charges (APCs) are only applicable after acceptance. For the inaugural 2026 volume, we are currently offering a full waiver, meaning no APCs will be charged to either Indian or international authors. This waiver applies to accepted articles in 2026, though future volumes may introduce standard APCs (standard charges are INR ${apcInr} for Indian authors and USD ${apcUsd} for international authors).`,
      plainTextAnswer: `Article Processing Charges (APCs) are only applicable after acceptance. For the inaugural 2026 volume, we are currently offering a full waiver, meaning no APCs will be charged to either Indian or international authors. This waiver applies to accepted articles in 2026, though future volumes may introduce standard APCs (standard charges are INR ${apcInr} for Indian authors and USD ${apcUsd} for international authors).`
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
          portal using your Submission ID and registered email.
        </span>
      ),
      plainTextAnswer: "You can track your paper in real-time on our Track Manuscript portal using your Submission ID and registered email."
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

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <Input
          type="text"
          placeholder="Search questions or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search FAQs"
          className="pl-10 h-10 bg-white rounded-lg border border-border/70 shadow-2xs text-xs focus-visible:ring-[#000066]/20 focus-visible:border-[#000066]"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-border/40 pb-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.id}
              variant={activeTab === cat.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-semibold tracking-wider gap-1.5 cursor-pointer transition-all",
                activeTab === cat.id 
                  ? "bg-[#000066] text-white shadow-xs" 
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
        <Accordion type="single" collapsible className="w-full space-y-2.5">
          {filteredFaqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`item-${index}`}
              className="border border-border/70 rounded-xl bg-card px-4 md:px-5 transition-all hover:border-[#000066]/30 shadow-2xs overflow-hidden"
            >
              <AccordionTrigger className="text-left py-3.5 font-semibold text-foreground hover:no-underline hover:text-[#000066] transition-colors">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#000066]/70 shrink-0" />
                  {highlightText(faq.question, searchQuery)}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-3.5 border-t border-border/20 mt-0.5 pt-2.5">
                {typeof faq.answer === 'string' ? highlightText(faq.answer, searchQuery) : faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-12 bg-card/30 border border-dashed border-border/60 rounded-2xl">
          <HelpCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="font-semibold text-muted-foreground m-0">No questions found matching your criteria.</p>
        </div>
      )}

      {/* Support Box */}
      <div className="bg-slate-200/50 p-4 sm:p-5 rounded-2xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-center sm:text-left">
        <div className="space-y-0.5">
          <h4 className="m-0 text-primary">Still have questions?</h4>
          <p className="text-muted-foreground m-0">If you couldn&apos;t find an answer to your query, please reach out to our editorial desk.</p>
        </div>
        <Button asChild size="sm" className="h-8 px-4 bg-[#000066] hover:bg-[#000088] text-white rounded-lg shadow-xs cursor-pointer transition-all shrink-0 font-bold text-xs">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
