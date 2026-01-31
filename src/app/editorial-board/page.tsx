import { GraduationCap, Mail, MapPin } from 'lucide-react';

const board = [
    {
        role: "Editor-in-Chief",
        members: [
            {
                name: "Dr. Ravibabu T.",
                designation: "Associate Professor, Dept. of ECE",
                affiliation: "MES Group of Institutions, Vizianagaram, AP, India",
                email: "support@ijitest.com"
            }
        ]
    },
    {
        role: "Editorial Board Members",
        members: [
            {
                name: "Dr. Y. Prasanna Kumar",
                designation: "Professor of Mining Engineering",
                affiliation: "Papua New Guinea University of Technology, Papua New Guinea",
                email: "support@ijitest.com"
            },
            {
                name: "Dr. Cheekatla Swapna Priya",
                designation: "Associate Professor, Dept. of CSE",
                affiliation: "Vignan's Institute of Information Technology (A), Visakhapatnam, AP, India",
                email: "support@ijitest.com"
            },
            {
                name: "Dr. Mahendra Narla",
                designation: "Associate Professor, Dept. of AI",
                affiliation: "G. Pullaiah College of Engineering and Technology, Kurnool, India",
                email: "support@ijitest.com"
            }
        ]
    }
];

export default function EditorialBoard() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-4 border-l-4 border-secondary pl-6 text-primary">Editorial Board</h1>
                <p className="text-gray-500 mb-16 text-lg">Our esteemed panel of academic experts and researchers.</p>

                <div className="space-y-20">
                    {board.map((section, idx) => (
                        <section key={idx}>
                            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-10 pb-2 border-b-2 border-primary/10 inline-block">
                                {section.role}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {section.members.map((member, mIdx) => (
                                    <div key={mIdx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5 group">
                                        <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-primary transition-colors">
                                            <GraduationCap className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">{member.name}</h3>
                                        <p className="text-primary font-bold text-xs uppercase tracking-wider mb-4">{member.designation}</p>
                                        <div className="space-y-3 text-sm text-gray-600">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <span>{member.affiliation}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="truncate">{member.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}

                    <section className="bg-primary/5 p-12 rounded-[3rem] border border-primary/10 text-center">
                        <h2 className="text-3xl font-serif font-black text-primary mb-4">Technical Reviewers</h2>
                        <p className="text-xl text-gray-600 mb-8 font-medium">IJITEST is supported by a global network of more than 50 technical reviewers across diverse disciplines.</p>

                        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-2xl mx-auto">
                            <h3 className="text-lg font-bold mb-4">Join Our Editorial Team</h3>
                            <p className="text-gray-600 mb-6 text-sm">We are always looking for experts to join our editorial board. If you are interested, please mail your resume to:</p>
                            <a href="mailto:support@ijitest.com" className="text-secondary font-black text-xl hover:underline">support@ijitest.com</a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
