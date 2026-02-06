import { Mail } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

function PublisherSection() {
    return (
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
    );
}

export default memo(PublisherSection);
