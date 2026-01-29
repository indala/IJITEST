import Link from 'next/link';
import { ArrowRight, BookOpen, Search, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const highlights = [
  {
    icon: <BookOpen className="w-6 h-6 text-primary" />,
    title: "Open Access",
    description: "Freely accessible research for a global audience to maximize impact."
  },
  {
    icon: <Search className="w-6 h-6 text-primary" />,
    title: "Indexed & Abstracted",
    description: "Indexed across major academic platforms for better visibility."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: "Peer Reviewed",
    description: "Rigorous offline peer-review process ensures academic integrity."
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "Fast Track",
    description: "Efficient review and publication cycle for timely research sharing."
  }
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <span>Call for Papers - Vol. 10 Issue 5</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black leading-tight mb-6">
                International Journal of Innovative Trends in <span className="text-secondary">Engineering Science</span> & Technology
              </h1>
              <p className="text-lg text-gray-600 mb-10 max-w-xl">
                A premier global platform for researchers and academicians to publish high-quality, peer-reviewed engineering and scientific research.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/submit" className="btn-primary py-4 px-8 text-lg font-bold flex items-center justify-center gap-2">
                  Submit Your Paper <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/guidelines" className="btn-outline py-4 px-8 text-lg font-bold">
                  Author Guidelines
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-2xl -rotate-2"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold font-serif">Journal Highlights</h3>
                  <span className="text-xs font-bold text-gray-400">ISSN: XXXX-XXXX</span>
                </div>
                <div className="space-y-6">
                  {highlights.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call for Papers Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Join the Next Generation of Research</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            IJITEST is currently accepting original research papers, case studies, and review articles for our upcoming issue. Submit your work today!
          </p>
          <Link href="/submit" className="bg-white text-primary px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-colors inline-block">
            Submit Now
          </Link>
        </div>
      </section>

      {/* Latest Stats/Badges */}
      <section className="py-12 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
            {/* Placeholder for indexing logos */}
            <div className="font-black text-2xl text-gray-400">GOOGLE SCHOLAR</div>
            <div className="font-black text-2xl text-gray-400">CROSSREF</div>
            <div className="font-black text-2xl text-gray-400">ROAD</div>
            <div className="font-black text-2xl text-gray-400">DOI</div>
          </div>
        </div>
      </section>
    </div>
  );
}
