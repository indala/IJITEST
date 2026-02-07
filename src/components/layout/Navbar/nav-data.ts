export const navigation = [
    { name: 'Home', href: '/' },
    {
        name: 'About',
        href: '/about',
        children: [
            { name: 'About the Journal', href: '/about' },
            { name: 'Editorial Board', href: '/editorial-board' },
            { name: 'Publication Ethics', href: '/ethics' },
            { name: 'Peer Review Process', href: '/peer-review' },
            { name: 'Reviewer Guidelines', href: '/reviewer-guidelines' },
        ]
    },
    { name: 'Guidelines', href: '/guidelines' },
    { name: 'Archives', href: '/archives' },
    { name: 'Indexing', href: '/indexing' },
    { name: 'Contact', href: '/contact' },
];
