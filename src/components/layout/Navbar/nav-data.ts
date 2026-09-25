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
    RefreshCw,
    Target,
    GitBranch,
    CreditCard,
    Building2,
    HelpCircle,
    FilePlus,
    FileCheck,
    SearchCheck,
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
        name: 'About Journal',
        href: '/about',
        icon: Info,
        children: [
            { name: 'About IJITEST', href: '/about', icon: Layout },
            { name: 'Aims & Scope', href: '/aims-scope', icon: Target },
            { name: 'Policies', href: '/policies', icon: ShieldCheck },
            { name: 'Publisher Information', href: '/publisher-info', icon: Building2 },
            { name: 'Join as Reviewer', href: '/join-us', icon: UserPlus },
            { name: 'Frequently Asked Questions', href: '/faqs', icon: HelpCircle },
        ]
    },
    { name: 'Author Guidelines', href: '/guidelines', icon: FileText },
    { name: 'Editorial Board', href: '/editorial-board', icon: Users },
    { name: 'Archives', href: '/archives', icon: Archive },
    { name: 'Current Issue', href: '/current-issue', icon: Layout },
    { name: 'Indexing', href: '/indexing', icon: Hash },
    {
        name: 'Paper Submission',
        href: '/submit',
        icon: FilePlus,
        children: [
            { name: 'New Submission', href: '/submit?type=new', icon: FilePlus },
            { name: 'Revised Submission', href: '/submit?type=revised', icon: RefreshCw },
            { name: 'Final Submission', href: '/submit?type=final', icon: FileCheck },
            { name: 'Track Manuscript', href: '/track', icon: SearchCheck },
            { name: 'Publication Fees (APC)', href: '/apc-fees', icon: CreditCard },
            { name: 'Peer Review Flow', href: '/peer-review', icon: GitBranch },
        ]
    },
    { name: 'Contact Us', href: '/contact', icon: Mail },
];
