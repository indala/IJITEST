'use client'
import HomeCarousel from '@/components/HomeCarousel';
import { Download, VolumeX, Newspaper, History, MessageSquare, ChevronRight, Info, ShieldAlert, BookOpen, Search, Mail } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

const disciplines = [
  "Engineering",
  "Science & Applied Sciences",
  "Technology & Innovation",
  "Computer Science & IT",
  "AI, ML & Data Science",
  "Electronics & Communication",
  "Mechanical & Civil",
  "IoT, Robotics & Automation",
  "Renewable Energy",
  "Management Studies"
];

export default function Home() {
  const [paperId, setPaperId] = useState('');
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (paperId.trim()) {
      router.push(`/track?id=${paperId}`);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <HomeCarousel />

      {/* Institutional Core Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-20">
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h1 className="text-4xl md:text-5xl font-serif font-black text-primary mb-8 tracking-tight italic">
                Welcome to <span className="text-secondary">IJITEST</span>
              </h1>
              <div className="prose prose-lg text-gray-600 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-8 space-y-6">
                <p>
                  International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a scholarly open access online international journal, which aims to publish peer-reviewed original research papers in the field of various Engineering disciplines.
                </p>
                <p>
                  IJITEST aims to bring the new application developments among the researchers and academicians, laying the foundation of sharing research knowledge among the global scientific community. All submitted papers are peer-reviewed by experts in the relevant field, ensuring that accepted papers are published online immediately after final manuscript verification.
                </p>
              </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: "Commencement", value: "2026", color: "text-blue-600" },
                { label: "Frequency", value: "Monthly", color: "text-emerald-600" },
                { label: "Issues per Vol", value: "12 Issues", color: "text-amber-600" }
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Aim & Scope */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-serif font-black text-gray-900 italic">Aim and Scope</h2>
              </div>

              <div className="prose prose-lg text-gray-600 font-medium space-y-8">
                <p>IJITEST covers all major fields of Engineering Disciplines and Modern Technology. Our scope includes, but is not limited to:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {disciplines.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary transition-all group">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary group-hover:scale-150 transition-transform" />
                      <span className="text-xs font-black uppercase tracking-widest text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm italic text-primary/60 font-bold border-t border-gray-100 pt-8">
                  * Interdisciplinary research merging engineering with managerial sciences is highly prioritized.
                </p>
              </div>
            </motion.div>

            {/* Publication Process */}
            <section className="bg-gray-900 p-12 rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                  <History className="w-12 h-12 text-secondary" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif font-black italic">Publication Process</h3>
                  <p className="text-lg text-white/50 leading-relaxed font-medium italic">
                    Accepted papers will be published online, upon receiving the final version from the authors in the recent upcoming issue. Our streamlined workflow minimizes time-to-publication while maintaining elite peer-review standards.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Institutional Sidebar */}
          <div className="space-y-10">
            {/* Quick Track Widget */}
            <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/5 shadow-2xl shadow-primary/5">
              <h3 className="text-xl font-serif font-black mb-6 italic text-gray-900">Track Your Paper</h3>
              <form onSubmit={handleTrack} className="space-y-4">
                <input
                  type="text"
                  placeholder="Manuscript ID"
                  value={paperId}
                  onChange={(e) => setPaperId(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-sm font-bold outline-none"
                />
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center justify-center gap-3">
                  <Search className="w-4 h-4" /> Track Manuscript
                </button>
              </form>
            </div>

            {/* Announcements */}
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
              <div className="flex items-center gap-3 mb-6">
                <Newspaper className="w-5 h-5 text-secondary" />
                <h3 className="text-xl font-serif font-black italic">Announcements</h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                  <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Latest Update</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">Volume 01, Issue 01 is now open for submissions.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Indexing Update</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">Google Scholar synchronization active for 2026.</p>
                </div>
              </div>
            </div>

            {/* Calls for Papers */}
            <div className="bg-primary p-8 rounded-[3rem] text-white shadow-2xl shadow-primary/20 group">
              <MessageSquare className="w-8 h-8 mb-6 group-hover:rotate-12 transition-transform" />
              <h3 className="text-xl font-serif font-black mb-4 italic">Calls for Papers</h3>
              <p className="text-xs text-white/70 mb-8 font-medium italic leading-relaxed">
                There is no deadline for regular paper submission. Authors are requested to send unpublished manuscripts to: <span className="text-secondary font-black">editor@ijitest.org</span>
              </p>
              <Link href="/submit" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest">Submit Now</span>
                <ChevronRight className="w-4 h-4 text-secondary" />
              </Link>
            </div>

            {/* Downloads Sidebar */}
            <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100">
              <h3 className="text-xl font-serif font-black mb-6 italic text-gray-900">Resource Desk</h3>
              <div className="grid gap-3">
                {[
                  { label: "Word Template", type: "DOCX", link: "/docs/template.docx" },
                  { label: "PDF Template", type: "PDF", link: "/docs/template.pdf" },
                  { label: "Copyright Form", type: "PDF", link: "/docs/copyright.pdf" }
                ].map((doc, i) => (
                  <Link key={i} href={doc.link} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary group transition-all">
                    <div>
                      <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest mb-0.5 block">{doc.type}</span>
                      <span className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors">{doc.label}</span>
                    </div>
                    <Download className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Ethics Widget */}
            <div className="bg-secondary p-8 rounded-[3rem] text-white shadow-xl shadow-secondary/20">
              <ShieldAlert className="w-8 h-8 mb-6" />
              <h3 className="text-xl font-serif font-black mb-2 italic">Ethics Statement</h3>
              <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed italic">IJITEST follows COPE (Committee on Publication Ethics) guidelines for research integrity.</p>
              <Link href="/ethics" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-white/20 hover:border-white transition-all pb-1">
                View Ethics <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global Indexing Grid (Impact) */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-black uppercase text-secondary tracking-[0.4em] mb-16">Scientific Visibility & Discovery Hubs</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 items-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
            {['Google Scholar', 'CrossRef', 'ROAD', 'Digital Object ID', 'ORCID'].map((index) => (
              <div key={index} className="text-center font-serif font-black text-2xl text-gray-900 italic tracking-tighter">
                {index}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footnote Section (Welcome/Informative) */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8 italic">About the Publisher</h2>
            <p className="text-xl text-gray-500 font-medium italic border-l-4 border-secondary/20 pl-8 mb-12 italic">
              International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is mentored by Felix Academic Publications, aiming to provide a high-quality bedrock for research sharing and academic excellence.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Support Line</p>
                  <p className="text-sm font-bold text-gray-900">editor@ijitest.org</p>
                </div>
              </div>
              <Link href="/guidelines" className="text-primary font-black uppercase text-xs tracking-[0.2em] hover:text-secondary transition-colors">
                View Formatting Guidelines 🏛️
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
