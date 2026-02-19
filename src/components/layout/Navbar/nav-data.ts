export const navigation = [
    { name: 'Home', href: '/' },
    {
        name: 'About',
        href: '/about',
        children: [
            { name: 'About the Journal', href: '/about' },
            { name: 'Publication Ethics', href: '/ethics' },
            { name: 'Peer Review Process', href: '/peer-review' },
            { name: 'Join Us', href: '/join-us' },
        ]
    },
    { name: 'Editorial Board', href: '/editorial-board' },
    { name: 'Guidelines', href: '/guidelines' },
    { name: 'Archives', href: '/archives' },
    { name: 'Indexing', href: '/indexing' },
    { name: 'Contact Us', href: '/contact' },
];
