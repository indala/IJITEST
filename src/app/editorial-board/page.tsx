import { GraduationCap, Mail, MapPin } from 'lucide-react';

const board = [
    {
        role: "Editor-in-Chief",
        members: [
            {
                name: "Dr. Rajesh V. Patil",
                designation: "Professor & Head, Department of Technology",
                affiliation: "IIT Bombay, India",
                email: "editor@ijitest.com"
            }
        ]
    },
    {
        role: "Editorial Board Members",
        members: [
            {
                name: "Dr. Sarah Thompson",
                designation: "Associate Professor",
                affiliation: "Stanford University, USA",
                email: "sarah.t@stanford.edu"
            },
            {
                name: "Dr. Ming Huang",
                designation: "Research Director",
                affiliation: "Tsinghua University, China",
                email: "huang.m@tsinghua.edu.cn"
            },
            {
                name: "Dr. Elena Rodriguez",
                designation: "Department Chair",
                affiliation: "University of Madrid, Spain",
                email: "elena.r@uom.es"
            }
        ]
    },
    {
        role: "Technical Reviewers",
        members: [
            {
                name: "Dr. Amit Verma",
                designation: "Assistant Professor",
                affiliation: "NIT Warangal, India",
                email: "amit.v@nitw.ac.in"
            },
            {
                name: "Dr. Kevin Lee",
                designation: "Senior Scientist",
                affiliation: "National University of Singapore",
                email: "kevin.lee@nus.edu.sg"
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
                </div>
            </div>
        </div>
    );
}
