'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface FAQ {
  question: string;
  answer: React.ReactNode;
}

const FAQS: FAQ[] = [
  {
    question: "How long does the peer-review process take?",
    answer: "Our peer-review process is designed to balance speed with rigor. Standard reviews take 4–6 weeks, while groundbreaking submissions may be considered for fast-track publication to ensure timely visibility."
  },
  {
    question: "Is IJITEST indexed in major databases?",
    answer: "As a new scholarly startup, IJITEST is currently in the process of being indexed with major databases like Google Scholar and Crossref. We are committed to ensuring maximum visibility for all published research as we grow."
  },
  {
    question: "Does the journal have an ISSN number?",
    answer: "We have initiated the application process for the International Standard Serial Number (ISSN). Authors will be updated as soon as the formal registration is completed, which will apply retrospectively to all published volumes."
  },
  {
    question: "What are the submission guidelines for authors?",
    answer: (
      <span>
        Authors should ensure their manuscripts follow our standard template, include an abstract, keywords, and properly formatted references. Detailed guidelines are available in our{" "}
        <Link href="/guidelines" className="text-[#000066] font-semibold underline hover:text-[#000088] transition-colors">
          Author Resource Desk
        </Link>.
      </span>
    )
  },
  {
    question: "How do I track and manage my manuscript after submission?",
    answer: (
      <span>
        Upon submission, you can access your dedicated{" "}
        <Link href="/login" className="text-[#000066] font-semibold underline hover:text-[#000088] transition-colors">
          Author Dashboard Panel
        </Link>{" "}
        using your registered email. Inside, you can track peer-review status in real-time, view generated PDF drafts, upload revisions, and make APC payments.
      </span>
    )
  },
  {
    question: "Do you provide Open Access publication?",
    answer: "Yes, IJITEST is a Gold Open Access journal. All published articles are immediately available to the global research community without any subscription barriers."
  },
  {
    question: "How can I join the Editorial Board or become a Reviewer?",
    answer: (
      <span>
        We welcome experts from various engineering and science disciplines. You can apply through our{" "}
        <Link href="/join-us" className="text-[#000066] font-semibold underline hover:text-[#000088] transition-colors">
          Join Us
        </Link>{" "}
        page by submitting your CV and area of expertise.
      </span>
    )
  }
];

export default function FaqSection() {
  return (
    <section className="py-16 md:py-24 bg-card/30" id="faqs">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <Badge variant="outline" className="bg-[#000066]/5 text-[#000066] border-[#000066]/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Common Questions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[#000066] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Everything you need to know about the publication process, indexing, and joining our scientific community.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQS.map((faq, index) => (
              <AccordionItem 
                key={faq.question} 
                value={`item-${index}`}
                className="border border-border/50 rounded-xl bg-card px-4 md:px-6 transition-all hover:border-[#000066]/20 shadow-sm"
              >
                <AccordionTrigger className="text-left py-5 text-sm md:text-base font-semibold text-foreground hover:no-underline hover:text-[#000066] transition-colors">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#000066]/60 shrink-0" />
                    {faq.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5 pt-0">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="pt-8 flex flex-col items-center gap-4 border-t border-border/50">
            <p className="text-xs 2xl:text-sm text-muted-foreground italic">
              Can&apos;t find what you&apos;re looking for? <a href="/contact" className="text-[#000066] font-semibold underline-offset-4 hover:underline">Contact our support team</a> directly.
            </p>
            <Button asChild variant="outline" className="h-10 px-5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#000066] border-[#000066]/20 hover:bg-[#000066]/5 cursor-pointer">
              <Link href="/faqs">View Full FAQ Directory</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
