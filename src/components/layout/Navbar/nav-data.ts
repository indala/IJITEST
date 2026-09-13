import {
    Home,
    Info,
    Layout,
    Archive,
    Mail,
    FileText,
    Users,
    ShieldCheck,
    ScrollText,
    UserPlus,
    Hash,
    LockOpen,
    Megaphone,
    Scale,
    SearchCheck,
    AlertTriangle,
    RefreshCw,
    Target,
    GitBranch,
    Copyright,
    FileCheck,
    CreditCard,
    Sparkles,
    Building2,
    HelpCircle,
    type LucideIcon
} from 'lucide-react';

export interface NavChildItem {
    name: string;
    href: string;
    icon?: LucideIcon;
}

export interface NavMegaColumn {
    heading: string;
    items: NavChildItem[];
}

export interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: NavChildItem[];
    isMegaMenu?: boolean;
    columns?: NavMegaColumn[];
}

export const navigation: NavItem[] = [
    { name: 'Home', href: '/', icon: Home },
    {
        name: 'About',
        href: '/about',
        icon: Info,
        children: [
            { name: 'About the Journal', href: '/about', icon: Layout },
            { name: 'Announcements', href: '/announcements', icon: Megaphone },
            { name: 'Editorial Board', href: '/editorial-board', icon: Users },
            { name: 'Join As Reviewer', href: '/join-us', icon: UserPlus },
            { name: 'Frequently Asked Questions', href: '/faqs', icon: HelpCircle },
        ]
    },
    { name: 'Editorial Board', href: '/editorial-board', icon: Users },
    { name: 'Author Guidelines', href: '/guidelines', icon: FileText },
    { name: 'Current Issue', href: '/current-issue', icon: Layout },
    { name: 'Archive', href: '/archives', icon: Archive },
    {
        name: 'Policies',
        href: '#',
        icon: ScrollText,
        isMegaMenu: true,
        columns: [
            {
                heading: 'Editorial & Quality Policies',
                items: [
                    { name: 'Aims & Scope', href: '/aims-scope', icon: Target },
                    { name: 'Peer Review Process', href: '/peer-review', icon: GitBranch },
                    { name: 'Publication Ethics', href: '/ethics', icon: ShieldCheck },
                    { name: 'Plagiarism & Similarity', href: '/plagiarism-policy', icon: SearchCheck },
                    { name: 'Conflict of Interest', href: '/conflict-of-interest', icon: AlertTriangle },
                    { name: 'Research Misconduct', href: '/research-misconduct', icon: Scale },
                    { name: 'Corrections & Retractions', href: '/corrections-retractions', icon: RefreshCw },
                ]
            },
            {
                heading: 'Access, Rights & Governance',
                items: [
                    { name: 'Open Access Policy', href: '/open-access', icon: LockOpen },
                    { name: 'Copyright & Author Rights', href: '/copyright-policy', icon: Copyright },
                    { name: 'Licensing Terms (CC-BY 4.0)', href: '/licensing-policy', icon: FileCheck },
                    { name: 'APC & Fee Disclosure', href: '/apc-fees', icon: CreditCard },
                    { name: 'Digital Archiving & Preservation', href: '/archiving-policy', icon: Archive },
                    { name: 'AI & Generative AI Policy', href: '/ai-policy', icon: Sparkles },
                    { name: 'Publisher Information', href: '/publisher-info', icon: Building2 },
                ]
            }
        ]
    },
    { name: 'Indexing', href: '/indexing', icon: Hash },
    { name: 'Contact Us', href: '/contact', icon: Mail },
];

