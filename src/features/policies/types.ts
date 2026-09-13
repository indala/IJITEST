import React from 'react';

export interface PolicySection {
    id: string;
    title: string;
    content: React.ReactNode;
}

export interface RelatedPolicyLink {
    name: string;
    href: string;
}

export interface PolicyDefinition {
    slug: string;
    title: string;
    description: string;
    metaDescription: string;
    sections: PolicySection[];
    relatedLinks?: RelatedPolicyLink[] | undefined;
}
