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
                <span>Call for Papers - Vol. 1 Issue 1 (2026)</span>
              </div>
              <p className="text-secondary font-bold mb-2">Felix Academic Publications Presents</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black leading-tight mb-6">
                International Journal of Innovative Trends in <span className="text-secondary">Engineering Science</span> & Technology
              </h1>
              <p className="text-xl text-gray-700 font-serif italic mb-6">
                An International Peer-Reviewed open access Journal
              </p>
              <p className="text-lg text-gray-600 mb-10 max-w-xl">
                International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a peer-reviewed scholarly journal dedicated to the dissemination of high-quality research in Engineering, Science, Technology, and Management.
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
                  <h3 className="text-xl font-bold font-serif">Quick Highlights</h3>
                  <span className="text-xs font-bold text-gray-400">Commencement: 2026</span>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                      <ShieldCheck className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-bold">Peer Reviewed</h4>
                        <p className="text-sm text-gray-500">Rigorous Double-Blind Review</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                      <Zap className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-bold">Open Access</h4>
                        <p className="text-sm text-gray-500">Creative Commons Attribution 4.0</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                      <BookOpen className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-bold text-sm">Engineering | Science | Technology | Management</h4>
                        <p className="text-xs text-gray-500">Comprehensive Multidisciplinary Scope</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements & Current Issue */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                <BookOpen className="text-primary" /> Current Issue
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">Volume 1, Issue 1 (2026) is now open for submissions.</p>
                <Link href="/archives" className="text-primary font-bold hover:underline inline-flex items-center gap-1 mt-4">
                  Browse Archives <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                <Zap className="text-secondary" /> Announcements
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0"></div>
                  <p className="text-sm text-gray-600 font-medium font-serif italic">IJITEST is now accepting submissions for the inaugural March 2026 issue.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0"></div>
                  <p className="text-sm text-gray-600 font-medium">CrossRef DOI assignment assigned to all published articles.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call for Papers Banner */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-4 uppercase">Call for Papers</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto italic">
            Invite original research articles, review papers, and survey papers from researchers, academicians, and industry professionals.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10 text-xs font-bold opacity-90 uppercase">
            <span>• All Engineering Disciplines</span>
            <span>• Science & Applied Sciences</span>
            <span>• Technology & Innovation</span>
            <span>• Computer Science & IT</span>
            <span>• AI, ML & Data Science</span>
            <span>• Electronics & Communication</span>
            <span>• Mechanical & Civil</span>
            <span>• IoT, Robotics & Automation</span>
            <span>• Renewable Energy</span>
            <span>• Management Studies</span>
          </div>
          <Link href="/submit" className="bg-white text-primary px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-colors inline-block">
            Submit Your Manuscript
          </Link>
        </div>
      </section>

      {/* Indexing Badges */}
      <section className="py-12 border-b border-gray-100 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
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
