import {
    Home,
    Info,
    Layout,
    Archive,
    Mail,
    FileText,
    Users,
    ShieldCheck,
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
    FilePlus,
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
            { name: 'About IJITEST', href: '/about', icon: Layout },
            { name: 'Aims and Scope', href: '/aims-scope', icon: Target },
            { name: 'Editorial Board', href: '/editorial-board', icon: Users },
            { name: 'Publisher Information', href: '/publisher-info', icon: Building2 },
            { name: 'Join as a Reviewer', href: '/join-us', icon: UserPlus },
            { name: 'Frequently Asked Questions', href: '/faqs', icon: HelpCircle },
        ]
    },
    {
        name: 'Publish',
        href: '/submit',
        icon: FilePlus,
        children: [
            { name: 'Submit a Manuscript', href: '/submit', icon: FilePlus },
            { name: 'Author Guidelines', href: '/guidelines', icon: FileText },
            { name: 'How Review Works', href: '/peer-review', icon: GitBranch },
            { name: 'Publication Fees', href: '/apc-fees', icon: CreditCard },
            { name: 'Track Manuscript', href: '/track', icon: SearchCheck },
        ]
    },
    {
        name: 'Research',
        href: '/current-issue',
        icon: Layout,
        children: [
            { name: 'Current Issue', href: '/current-issue', icon: Layout },
            { name: 'All Archives', href: '/archives', icon: Archive },
            { name: 'Indexing and Abstracting', href: '/indexing', icon: Hash },
            { name: 'Open Access', href: '/open-access', icon: LockOpen },
            { name: 'Announcements', href: '/announcements', icon: Megaphone },
        ]
    },
    {
        name: 'Policies',
        href: '/ethics',
        icon: ShieldCheck,
        isMegaMenu: true,
        columns: [
            {
                heading: 'Review and Ethics',
                items: [
                    { name: 'Peer Review Process', href: '/peer-review', icon: GitBranch },
                    { name: 'Publication Ethics', href: '/ethics', icon: ShieldCheck },
                    { name: 'Plagiarism Policy', href: '/plagiarism-policy', icon: SearchCheck },
                    { name: 'Conflict of Interest', href: '/conflict-of-interest', icon: AlertTriangle },
                    { name: 'Research Misconduct', href: '/research-misconduct', icon: Scale },
                    { name: 'Corrections and Retractions', href: '/corrections-retractions', icon: RefreshCw },
                ]
            },
            {
                heading: 'Access and Rights',
                items: [
                    { name: 'Open Access Policy', href: '/open-access', icon: LockOpen },
                    { name: 'Copyright and Author Rights', href: '/copyright-policy', icon: Copyright },
                    { name: 'Licensing Policy', href: '/licensing-policy', icon: FileCheck },
                    { name: 'Publication Fees', href: '/apc-fees', icon: CreditCard },
                ]
            },
            {
                heading: 'Governance and Preservation',
                items: [
                    { name: 'Digital Archiving and Preservation', href: '/archiving-policy', icon: Archive },
                    { name: 'AI and Generative AI Policy', href: '/ai-policy', icon: Sparkles },
                    { name: 'Privacy Policy', href: '/privacy', icon: ShieldCheck },
                    { name: 'Terms of Use', href: '/terms', icon: FileText },
                    { name: 'Publisher Information', href: '/publisher-info', icon: Building2 },
                ]
            }
        ]
    },
    { name: 'Contact', href: '/contact', icon: Mail },
];
