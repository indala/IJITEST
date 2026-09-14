import { BookOpenCheck, ShieldCheck, UserCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

const LINKS = [
    {
        label: "Guidelines",
        href: "/guidelines",
        description: "Formatting instructions & templates",
        icon: BookOpenCheck,
    },
    {
        label: "Ethics",
        href: "/ethics",
        description: "Publication ethics & COPE policy",
        icon: ShieldCheck,
    },
    {
        label: "Peer Review",
        href: "/peer-review",
        description: "Our double-blind review process",
        icon: UserCheck,
    }
];

function AuthorQuickLinks() {
    return (
        <div className="bg-card p-3.5 sm:p-4 2xl:p-5 rounded-xl border border-border/70 shadow-2xs space-y-3 2xl:space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <BookOpenCheck className="w-4 h-4 2xl:w-5 2xl:h-5" />
                </div>
                <h3 className="card-title-brand m-0">
                    Author Resources
                </h3>
            </div>
            <div className="space-y-2">
                {LINKS.map((link, i) => (
                    <Link
                        key={i}
                        href={link.href}
                        className="flex items-center gap-3 p-2.5 2xl:p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-all border border-border/40 group"
                    >
                        <div className="p-2 2xl:p-2.5 rounded-md bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                            <link.icon className="w-4 h-4 2xl:w-5 2xl:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-primary group-hover:text-secondary transition-colors m-0 truncate">
                                {link.label}
                            </p>
                            <p className="text-caption line-clamp-1 m-0">
                                {link.description}
                            </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default memo(AuthorQuickLinks);
