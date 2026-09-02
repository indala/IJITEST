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
    answer: "Yes! IJITEST is officially registered with the ISSN International Centre with E-ISSN: 3139-6887."
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
    <section className="py-6 sm:py-8 bg-card/30" id="faqs">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="text-center space-y-1.5">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 px-2.5 py-0.5 rounded-full text-label">
              Common Questions
            </Badge>
            <h2 className="m-0">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto m-0">
              Everything you need to know about the publication process, indexing, and joining our scientific community.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            {FAQS.map((faq, index) => (
              <AccordionItem 
                key={faq.question} 
                value={`item-${index}`}
                className="border border-border/50 rounded-xl bg-card px-3.5 sm:px-4 transition-all hover:border-primary/20 shadow-2xs"
              >
                <AccordionTrigger className="text-left py-3 font-semibold text-foreground hover:no-underline hover:text-primary transition-colors">
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-primary/60 shrink-0" />
                    {faq.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 pt-0">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="pt-8 flex flex-col items-center gap-4 border-t border-border/50">
            <p className="text-muted-foreground italic m-0">
              Can&apos;t find what you&apos;re looking for? <a href="/contact" className="text-primary font-semibold underline-offset-4 hover:underline">Contact our support team</a> directly.
            </p>
            <Button asChild variant="outline" className="h-10 px-5 rounded-xl text-label text-primary border-primary/20 hover:bg-primary/5 cursor-pointer">
              <Link href="/faqs">View Full FAQ Directory</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
