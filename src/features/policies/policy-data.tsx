import {
    CheckCircle2,
    ExternalLink,
    LockOpen,
    Globe,
    FileText,
    Sparkles,
    UploadCloud,
    ShieldCheck,
    AlertTriangle,
    Cpu,
    Database,
    RefreshCw,
    Building2,
    Layers
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PolicyDefinition } from './types';

export function getPolicyDefinitions(settings: Record<string, string>): Record<string, PolicyDefinition> {
    const journalName = settings['journalName'] || settings['journal_name'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const journalShort = settings['journalShortName'] || settings['journal_short_name'] || 'IJITEST';
    const issn = settings['issnNumber'] || settings['issn_number'] || '3139-6887';
    const publisher = settings['publisherName'] || settings['publisher_name'] || settings['publisher'] || 'Felix Academic Publications';
    const supportEmail = settings['supportEmail'] || settings['support_email'] || 'support@ijitest.org';
    const contactEmail = settings['contactEmail'] || settings['contact_email'] || supportEmail;
    const supportPhone = settings['supportPhone'] || settings['support_phone'] || '+91 8919643590';
    const officeAddress = settings['officeAddress'] || settings['office_address'] || 'Madhurawada, Visakhapatnam, Andhra Pradesh, India - 530048';
    const udyamRegistration = settings['udyamRegistration'] || settings['udyam_registration'] || 'UDYAM-AP-10-0125617';
    const journalWebsite = settings['journalWebsite'] || settings['journal_website'] || 'https://ijitest.org';
    const apcInr = settings['apcInr'] || settings['apc_inr'] || '2500';
    const apcUsd = settings['apcUsd'] || settings['apc_usd'] || '50';
    const currentYear = settings['startingYear'] || '2026';
    const publicationFrequency = settings['publicationFrequency'] || 'Monthly (12 Issues per year)';

    return {
        'aims-scope': {
            slug: 'aims-scope',
            title: 'Aims and Scope',
            description: `The journal's academic purpose, subject coverage, and manuscript categories accepted by ${journalShort}.`,
            metaDescription: `Discover the aims, scope, and engineering research coverage of ${journalName} (ISSN: ${issn}). Peer-reviewed open access engineering journal.`,
            relatedLinks: [
                { name: 'Peer Review Process', href: '/peer-review' },
                { name: 'Author Guidelines', href: '/guidelines' },
                { name: 'Publication Ethics', href: '/ethics' },
                { name: 'Submit Manuscript', href: '/submit' },
            ],
            sections: [
                {
                    id: 'core-objectives',
                    title: 'Journal Aim',
                    content: (
                        <div className="space-y-4">
                            <p>
                                <strong>{journalName}</strong> (ISSN: {issn}) is a peer-reviewed, open-access journal publishing original research, review articles, and technical contributions in engineering, science, and technology.
                            </p>
                            <p>
                                {journalShort} aims to provide a rigorous and accessible platform for researchers, academics, and practitioners to communicate sound theoretical, experimental, computational, and applied work. Interdisciplinary studies are welcome when they make a clear contribution to the journal's subject areas.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                                    <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                                        <Globe className="size-4" />
                                        <span>Scholarly Exchange</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        Supporting the responsible communication of research findings.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                                    <div className="flex items-center gap-2 text-emerald-700  font-bold text-body-sm">
                                        <Cpu className="size-4" />
                                        <span>Research Quality</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        Valuing clear methods, evidence, and meaningful conclusions.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-1">
                                    <div className="flex items-center gap-2 text-blue-700  font-bold text-body-sm">
                                        <LockOpen className="size-4" />
                                        <span>Open Science</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        Making published research available under the journal's open-access terms.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'subject-coverage',
                    title: 'Subject Coverage & Disciplines',
                    content: (
                        <div className="space-y-4">
                            <p>
                                {journalShort} welcomes high-caliber original research, critical review papers, and technical case studies across the following core thematic disciplines:
                            </p>
                            <ul className="space-y-2 list-none p-0 m-0">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Computer Science & Information Technology:</strong> Artificial Intelligence, Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, Cloud Computing, Distributed Ledger Technologies / Blockchain, Big Data Analytics, Cyber Security, and Software Engineering.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Electrical & Electronics Engineering:</strong> VLSI Design, Embedded Systems, Renewable Energy Integration, Microgrids, Power Electronics, Wireless Sensor Networks, Internet of Things (IoT), Signal & Image Processing, and Robotics.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Mechanical & Mechatronics Engineering:</strong> Computational Fluid Dynamics (CFD), Finite Element Analysis (FEA), Thermal Engineering, Additive Manufacturing / 3D Printing, Advanced Composite Materials, Precision Machining, and Autonomous Systems.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Civil & Environmental Engineering:</strong> Structural Health Monitoring, Green Building Technologies, Sustainable Infrastructure, Earthquake Engineering, Water Resource Management, and Smart Transportation Systems.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Chemical, Biological & Materials Engineering:</strong> Nanomaterials, Biomaterials, Polymer Science, Process Modeling, Green Synthesis, and Environmental Pollution Abatement.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Interdisciplinary Technologies:</strong> Biomedical Instrumentation, Human-Computer Interaction, Smart Cities, Quantum Computing Applications, and Cyber-Physical Systems.</span>
                                </li>
                            </ul>
                        </div>
                    )
                },
                {
                    id: 'manuscript-types',
                    title: 'Manuscript Categories Accepted',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Authors may submit manuscripts under one of the following official classifications:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Card className="border-border/70 shadow-2xs">
                                    <CardContent className="p-4 space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-body-sm text-primary">
                                            <FileText className="size-3.5" />
                                            <span>Original Research Articles</span>
                                        </div>
                                        <p className="text-muted-foreground text-caption m-0">
                                            Substantive empirical or theoretical contributions detailing novel methodologies, experimental findings, and validation benchmarks (up to 8,000 words).
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/70 shadow-2xs">
                                    <CardContent className="p-4 space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-body-sm text-primary">
                                            <Sparkles className="size-3.5" />
                                            <span>Review Articles</span>
                                        </div>
                                        <p className="text-muted-foreground text-caption m-0">
                                            Critical, systematic literature reviews identifying emerging paradigms, comparative benchmarks, and open research challenges (up to 12,000 words).
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/70 shadow-2xs">
                                    <CardContent className="p-4 space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-body-sm text-primary">
                                            <Layers className="size-3.5" />
                                            <span>Technical Notes & Short Communications</span>
                                        </div>
                                        <p className="text-muted-foreground text-caption m-0">
                                            Rapid reports of preliminary breakthroughs, novel software algorithms, or critical methodological improvements (up to 4,000 words).
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/70 shadow-2xs">
                                    <CardContent className="p-4 space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-body-sm text-primary">
                                            <Building2 className="size-3.5" />
                                            <span>Industrial Case Studies</span>
                                        </div>
                                        <p className="text-muted-foreground text-caption m-0">
                                            Real-world technological implementations, failure analyses, or large-scale industrial deployments of broad practitioner interest (up to 6,000 words).
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'publication-frequency',
                    title: 'Publication Frequency & Model',
                    content: (
                        <div className="space-y-4">
                            <p>
                                {journalShort} follows a {publicationFrequency.toLowerCase()} publication schedule. Accepted manuscripts are published online as the Version of Record after editorial approval and final proof verification.
                            </p>
                            <p>
                                Articles are aggregated into 12 regular monthly issues per annual volume. Each published paper receives a persistent digital object identifier (DOI) minted through CrossRef and full-text JATS XML archival deposit.
                            </p>
                        </div>
                    )
                }
            ]
        },

        'copyright-policy': {
            slug: 'copyright-policy',
            title: 'Copyright & Author Rights Policy',
            description: `Full copyright retention by authors, non-exclusive journal license, and green open access archiving permissions.`,
            metaDescription: `Review author copyright rights and licensing at ${journalShort}. Authors retain 100% copyright under Creative Commons CC-BY 4.0 without restrictions.`,
            relatedLinks: [
                { name: 'Open Access Policy', href: '/open-access' },
                { name: 'Licensing Policy', href: '/licensing-policy' },
                { name: 'Digital Archiving Policy', href: '/archiving-policy' },
                { name: 'Author Guidelines', href: '/guidelines' },
            ],
            sections: [
                {
                    id: 'copyright-retention',
                    title: 'Author Rights Retention',
                    content: (
                        <div className="space-y-4">
                            <p>
                                {journalName} is committed to the principles of open scholarship, author empowerment, and unrestricted scientific distribution. In strict accordance with the <strong>Budapest Open Access Initiative (BOAI)</strong> and <strong>Directory of Open Access Journals (DOAJ)</strong> criteria, authors publishing with {journalShort} retain copyright of their work without restrictions.
                            </p>
                            <div className="space-y-2 text-caption text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Authors Retain Full Copyright:</strong> Authors retain 100% of their copyright and proprietary rights to their research. Authors are never required to transfer or assign copyright to the publisher or journal.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Non-Exclusive Publishing License:</strong> Upon manuscript acceptance, authors grant {journalShort} and {publisher} a non-exclusive license to publish, display, distribute, index, and archive the Version of Record in all digital formats.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>First Publication Rights:</strong> Authors grant {journalShort} the right of first commercial and digital publication under the Creative Commons Attribution 4.0 International (CC-BY 4.0) license.</span>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'self-archiving',
                    title: 'Author Self-Archiving & Green Open Access',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Authors possess the unrestricted right to deposit and distribute all versions of their manuscript across any academic or personal platform without embargo:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                <Card className="border-border/70 shadow-2xs">
                                    <CardContent className="p-3.5 space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-body-sm text-secondary">
                                            <FileText className="size-3.5" />
                                            <span>Preprint (AOM)</span>
                                        </div>
                                        <p className="text-muted-foreground text-caption leading-relaxed m-0">
                                            Authors may post pre-refereed drafts on preprint servers (e.g., arXiv, TechRxiv, SSRN) or university repositories at any time.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/70 shadow-2xs">
                                    <CardContent className="p-3.5 space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-body-sm text-secondary">
                                            <Sparkles className="size-3.5" />
                                            <span>Postprint (AAM)</span>
                                        </div>
                                        <p className="text-muted-foreground text-caption leading-relaxed m-0">
                                            Authors may deposit peer-reviewed, accepted manuscripts in institutional repositories immediately upon formal acceptance.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border-border/70 shadow-2xs">
                                    <CardContent className="p-3.5 space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-body-sm text-secondary">
                                            <UploadCloud className="size-3.5" />
                                            <span>Version of Record (VoR)</span>
                                        </div>
                                        <p className="text-muted-foreground text-caption leading-relaxed m-0">
                                            The final branded PDF with CrossRef DOI may be shared anywhere immediately without embargo or fee.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'citation-attribution',
                    title: 'Citation & Attribution Guidelines',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Any subsequent reproduction, translation, or re-use of the work (in whole or in part) must include a complete scholarly citation acknowledging {journalShort} as the original publication venue:
                            </p>
                            <div className="p-3.5 rounded-xl bg-muted/30 border border-border font-mono text-meta space-y-1">
                                <p className="m-0 text-foreground font-semibold">Standard Citation Format:</p>
                                <p className="m-0 text-muted-foreground">
                                    Author(s), &quot;Article Title,&quot; <em>{journalName}</em>, Vol. X, No. Y, pp. XX-YY, Year. https://doi.org/10.XXXXX/...
                                </p>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'third-party-content',
                    title: 'Third-Party Materials & Permissions',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Authors are solely responsible for securing written permissions to reproduce any third-party copyrighted figures, diagrams, tables, or extended quotations. Proper attribution acknowledging the original copyright holder must appear explicitly within the figure or table captions.
                            </p>
                        </div>
                    )
                }
            ]
        },

        'licensing-policy': {
            slug: 'licensing-policy',
            title: 'Licensing Policy & Open Access Terms',
            description: `Terms and conditions of the Creative Commons Attribution 4.0 International (CC-BY 4.0) license.`,
            metaDescription: `Learn how CC-BY 4.0 licensing works at ${journalShort}. Immediate global sharing, adaptation, and commercial reuse with proper attribution.`,
            relatedLinks: [
                { name: 'Open Access Policy', href: '/open-access' },
                { name: 'Copyright Policy', href: '/copyright-policy' },
                { name: 'APC Transparency', href: '/apc-fees' },
                { name: 'Publication Ethics', href: '/ethics' },
            ],
            sections: [
                {
                    id: 'cc-by-overview',
                    title: 'Creative Commons Attribution 4.0 (CC-BY 4.0)',
                    content: (
                        <div className="space-y-4">
                            <p>
                                All scholarly articles, reviews, datasets, and technical communications published by <strong>{journalName}</strong> are released under the terms of the <strong>Creative Commons Attribution 4.0 International License (CC-BY 4.0)</strong>.
                            </p>
                            <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-2xs">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-primary text-white font-mono text-badge px-2 py-0.5">
                                        CC BY 4.0
                                    </Badge>
                                    <span className="font-bold text-foreground text-body-sm">
                                        Creative Commons Attribution 4.0 International
                                    </span>
                                </div>
                                <p className="text-caption text-muted-foreground leading-relaxed m-0">
                                    Under this license, readers, academic institutions, and commercial entities are permitted to:
                                </p>
                                <ul className="space-y-1.5 text-caption text-muted-foreground list-none p-0 m-0">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Share</strong> — copy and redistribute the material in any medium or format worldwide.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Adapt</strong> — remix, transform, translate, and build upon the material for any purpose, including commercial endeavors.</span>
                                    </li>
                                </ul>
                                <div className="pt-2 border-t border-border/50">
                                    <a
                                        href="https://creativecommons.org/licenses/by/4.0/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-body-sm font-bold text-primary hover:text-secondary transition-colors"
                                    >
                                        <span>View Official Legal Deed on Creative Commons</span>
                                        <ExternalLink className="size-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'license-conditions',
                    title: 'Conditions of Reuse',
                    content: (
                        <div className="space-y-4">
                            <p>
                                The freedoms granted by the CC-BY 4.0 license require compliance with two straightforward stipulations:
                            </p>
                            <ul className="space-y-2 list-none p-0 m-0 text-caption text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Attribution:</strong> You must give appropriate credit to the original author(s) and {journalShort}, provide a link to the license, and indicate if modifications were made.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>No Additional Restrictions:</strong> You may not apply legal terms or technological measures (such as DRM) that legally restrict others from exercising the rights granted by the license.</span>
                                </li>
                            </ul>
                        </div>
                    )
                },
                {
                    id: 'machine-readable-metadata',
                    title: 'Machine-Readable Licensing Metadata',
                    content: (
                        <div className="space-y-4">
                            <p>
                                To enable automated indexing by institutional harvesters, aggregators, and search algorithms, {journalShort} embeds standardized machine-readable licensing metadata:
                            </p>
                            <ul className="space-y-1.5 list-none p-0 m-0 text-caption text-muted-foreground">
                                <li>• Dublin Core metadata tags in HTML headers pointing to official CC-BY 4.0 URIs.</li>
                                <li>• CrossRef Schema 5.3 <code>&lt;license_ref&gt;</code> nodes registered during DOI minting.</li>
                                <li>• JATS 1.3 XML <code>&lt;permissions&gt;</code> blocks embedded within published article assets.</li>
                                <li>• Prominent CC-BY banner printed on the cover page of every official PDF downloaded.</li>
                            </ul>
                        </div>
                    )
                }
            ]
        },

        'apc-fees': {
            slug: 'apc-fees',
            title: 'Article Processing Charges (APC) & Fee Transparency',
            description: `Clear breakdown of publication charges, zero submission costs, and comprehensive author fee waiver policies.`,
            metaDescription: `Check ${journalShort} APC charges. ₹${apcInr} INR / $${apcUsd} USD upon acceptance. Zero submission fees and full low-income country waivers available.`,
            relatedLinks: [
                { name: 'Author Guidelines', href: '/guidelines' },
                { name: 'Open Access Policy', href: '/open-access' },
                { name: 'Submit Manuscript', href: '/submit' },
                { name: 'Peer Review Process', href: '/peer-review' },
            ],
            sections: [
                {
                    id: 'zero-submission-fees',
                    title: 'Zero Manuscript Submission Fees',
                    content: (
                        <div className="space-y-4">
                            <p>
                                <strong>{journalName}</strong> is committed to complete fee transparency in compliance with the <strong>DOAJ Principles of Transparency</strong> and <strong>OASPA</strong> guidelines.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                                    <div className="flex items-center gap-2 text-emerald-700  font-bold text-body-sm">
                                        <CheckCircle2 className="size-4" />
                                        <span>100% Free Submission</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        Submitting an article to {journalShort} is completely free of charge. No upfront fees are ever collected.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-1">
                                    <div className="flex items-center gap-2 text-blue-700  font-bold text-body-sm">
                                        <CheckCircle2 className="size-4" />
                                        <span>No Peer Review Charges</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        Editorial screening, Turnitin similarity checks, and expert peer review are conducted without cost to authors.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'apc-schedule',
                    title: 'APC Schedule (Invoiced Upon Formal Acceptance Only)',
                    content: (
                        <div className="space-y-4">
                            <p>
                                To cover operational costs—including platform hosting, cloud storage, plagiarism checking, CrossRef DOI minting, JATS XML conversion, and permanent archiving—an <strong>Article Processing Charge (APC)</strong> is invoiced <em>only after</em> a manuscript has successfully passed double-blind peer review and received formal acceptance by the Editor-in-Chief.
                            </p>
                            <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-2xs">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
                                    <span className="font-bold text-foreground text-body-sm">Standard Publication APC ({currentYear})</span>
                                    <span className="font-mono font-bold text-primary text-meta">
                                        ₹{apcInr} INR (India) / ${apcUsd} USD (International)
                                    </span>
                                </div>
                                <ul className="space-y-1.5 text-caption text-muted-foreground list-none p-0 m-0">
                                    <li>• Covers full copyediting, formatting, and CrossRef DOI generation.</li>
                                    <li>• Immediate unrestricted Gold Open Access under CC BY 4.0.</li>
                                    <li>• No additional fees for color figures, supplementary data files, or co-authors.</li>
                                    <li>• Applicable taxes (e.g. GST in India) are itemized transparently on formal receipts.</li>
                                </ul>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'editorial-independence',
                    title: 'Guaranteed Editorial Independence',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Editorial and peer review decisions are made solely based on scientific novelty, methodological rigor, and academic integrity. Reviewers and editors have no access to author billing information, and an author&apos;s financial status never influences editorial outcomes.
                            </p>
                        </div>
                    )
                },
                {
                    id: 'waiver-policy',
                    title: 'Fee Waiver & Discount Policy',
                    content: (
                        <div className="space-y-4">
                            <p>
                                {journalShort} firmly believes that financial limitations must never prevent the publication of worthy scientific discoveries. We provide the following fee relief programs:
                            </p>
                            <ul className="space-y-2 list-none p-0 m-0 text-caption text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Low-Income Economies:</strong> Authors from World Bank-designated low-income economies qualify for up to 100% full waiver of publication fees.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Lower-Middle-Income Economies:</strong> Authors affiliated with institutions in lower-middle-income countries are eligible for a 50% discount.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    <span><strong>Student & Hardship Waivers:</strong> Unfunded graduate students or researchers experiencing certified hardship may request discretionary relief during submission.</span>
                                </li>
                            </ul>
                            <p className="text-caption text-muted-foreground pt-1">
                                Waiver requests must be noted in the submission cover letter and cannot be requested retroactively after editorial acceptance.
                            </p>
                        </div>
                    )
                }
            ]
        },

        'plagiarism-policy': {
            slug: 'plagiarism-policy',
            title: 'Plagiarism, Similarity & Academic Integrity Policy',
            description: `Zero-tolerance plagiarism protocol, similarity index thresholds, and rigorous editorial screening workflows.`,
            metaDescription: `Read ${journalShort}'s strict anti-plagiarism policy. Mandatory similarity screening via Turnitin/iThenticate with a 15% overall threshold.`,
            relatedLinks: [
                { name: 'Publication Ethics', href: '/ethics' },
                { name: 'Peer Review Process', href: '/peer-review' },
                { name: 'Author Guidelines', href: '/guidelines' },
                { name: 'Research Misconduct', href: '/research-misconduct' },
            ],
            sections: [
                {
                    id: 'plagiarism-definition',
                    title: 'Definition & Forms of Plagiarism',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Academic integrity is the bedrock of scientific discourse. <strong>{journalName}</strong> maintains a strict, zero-tolerance policy against all manifestations of plagiarism and intellectual misappropriation in accordance with the <strong>Committee on Publication Ethics (COPE)</strong> standards.
                            </p>
                            <p>Plagiarism includes, but is not limited to:</p>
                            <ul className="space-y-1.5 list-none p-0 m-0 text-caption text-muted-foreground">
                                <li>• <strong>Verbatim Copying:</strong> Reproducing text word-for-word from another source without quotation marks and complete citation.</li>
                                <li>• <strong>Substantial Paraphrasing:</strong> Rephrasing another author&apos;s ideas or research design without proper attribution.</li>
                                <li>• <strong>Self-Plagiarism & Text Recycling:</strong> Reusing extensive passages from an author&apos;s previously published papers without citation.</li>
                                <li>• <strong>Data & Image Fabrication:</strong> Splicing, altering, or synthesizing experimental data, figures, or micrographs.</li>
                                <li>• <strong>Idea Theft:</strong> Presenting someone else&apos;s unique conceptual methodology or algorithm as one&apos;s own original work.</li>
                            </ul>
                        </div>
                    )
                },
                {
                    id: 'similarity-thresholds',
                    title: 'Screening Protocols & Similarity Thresholds',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Every manuscript submitted to {journalShort} undergoes automated similarity verification using industry-standard tools (<strong>Turnitin / iThenticate</strong>) prior to editorial dispatch.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                                    <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                                        <ShieldCheck className="size-4" />
                                        <span>Overall Similarity &lt; 15%</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        Total similarity must not exceed 15% (excluding reference citations and standard mathematical definitions).
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                                    <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                                        <ShieldCheck className="size-4" />
                                        <span>Single Source Match &le; 2%</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        No single external document or publication may account for more than 2% of overlapping content.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'plagiarism-handling',
                    title: 'Actions on Suspected Plagiarism',
                    content: (
                        <div className="space-y-4">
                            <p>
                                When similarity or text recycling is identified, the editorial board follows the official COPE flowchart:
                            </p>
                            <ul className="space-y-2 list-none p-0 m-0 text-caption text-muted-foreground">
                                <li>• <strong>Pre-Review:</strong> Manuscripts exceeding 15% similarity with unintentional overlaps are returned for revision; papers with blatant copying are desk-rejected immediately.</li>
                                <li>• <strong>During Peer Review:</strong> If reviewers or editors identify uncredited sources, the manuscript is halted and rejected pending investigation.</li>
                                <li>• <strong>Post-Publication:</strong> If confirmed plagiarism is discovered post-publication, the paper is formally <strong>retracted</strong> with a prominent notice, and the authors&apos; institution may be formally notified.</li>
                            </ul>
                        </div>
                    )
                }
            ]
        },

        'conflict-of-interest': {
            slug: 'conflict-of-interest',
            title: 'Conflict of Interest & Competing Interests Policy',
            description: `Comprehensive disclosure guidelines for authors, reviewers, and editors to maintain transparency.`,
            metaDescription: `Understand ${journalShort}'s conflict of interest guidelines. Mandatory disclosure of financial and personal competing interests for ethical research.`,
            relatedLinks: [
                { name: 'Publication Ethics', href: '/ethics' },
                { name: 'Peer Review Process', href: '/peer-review' },
                { name: 'Author Guidelines', href: '/guidelines' },
                { name: 'Research Misconduct', href: '/research-misconduct' },
            ],
            sections: [
                {
                    id: 'what-is-coi',
                    title: 'Definition of Competing Interests',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Transparency regarding potential conflicts of interest is paramount to preserving scientific credibility. A competing interest exists when professional judgment concerning primary scholarly findings may be influenced (or perceived to be influenced) by secondary financial or personal affiliations.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                                    <span className="font-bold text-body-sm text-primary block">Financial Interests</span>
                                    <p className="text-muted-foreground text-caption m-0 leading-relaxed">
                                        Commercial sponsorships, consultancies, employment, patent holdings, stock equity, or advisory fees within the preceding 36 months related to the study.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                                    <span className="font-bold text-body-sm text-primary block">Non-Financial Interests</span>
                                    <p className="text-muted-foreground text-caption m-0 leading-relaxed">
                                        Close personal or family ties, academic rivalries, direct supervisory relationships, or active involvement in advocacy organizations tied to the research.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'author-duties',
                    title: 'Duties of Authors',
                    content: (
                        <div className="space-y-4">
                            <p>
                                All submitted manuscripts must include a dedicated <strong>&quot;Declaration of Competing Interests&quot;</strong> section placed immediately before the bibliography.
                            </p>
                            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2 text-body-sm">
                                <p className="m-0 font-semibold text-foreground">Standard Negative Disclosure Statement:</p>
                                <blockquote className="border-l-2 border-primary/40 pl-3 italic text-muted-foreground my-1">
                                    &quot;The authors declare that they have no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper.&quot;
                                </blockquote>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'reviewer-editor-duties',
                    title: 'Duties of Reviewers & Editorial Board',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Reviewers and editors must recuse themselves from evaluating manuscripts whenever a conflict of interest exists:
                            </p>
                            <ul className="space-y-1.5 list-none p-0 m-0 text-caption text-muted-foreground">
                                <li>• Current departmental affiliation or shared institutional employer with any co-author.</li>
                                <li>• Co-authorship with any author within the previous 36 months.</li>
                                <li>• Active advisory, thesis supervision, or mentor-mentee relationship with authors.</li>
                                <li>• Submissions by editorial board members are managed by independent external editors with blind peer reviewers, maintaining the DOAJ 25% annual endogeny ceiling.</li>
                            </ul>
                        </div>
                    )
                }
            ]
        },

        'research-misconduct': {
            slug: 'research-misconduct',
            title: 'Research Misconduct & Whistleblower Policy',
            description: `Protocols for investigating scientific fraud, data fabrication, authorship disputes, and whistleblower reporting.`,
            metaDescription: `Discover ${journalShort}'s research misconduct policies. Clear procedures for investigating allegations and protecting whistleblowers in academic research.`,
            relatedLinks: [
                { name: 'Publication Ethics', href: '/ethics' },
                { name: 'Corrections & Retractions', href: '/corrections-retractions' },
                { name: 'Plagiarism Policy', href: '/plagiarism-policy' },
                { name: 'Contact Editorial Office', href: '/contact' },
            ],
            sections: [
                {
                    id: 'misconduct-scope',
                    title: 'Scope of Research Misconduct',
                    content: (
                        <div className="space-y-4">
                            <p>
                                <strong>{journalName}</strong> adheres to the guidelines established by the <strong>Committee on Publication Ethics (COPE)</strong> and <strong>World Association of Medical Editors (WAME)</strong> to uphold research integrity and combat fraudulent scholarly practices.
                            </p>
                            <ul className="space-y-2 list-none p-0 m-0 text-caption text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span><strong>Data Fabrication:</strong> Inventing experimental results, statistical observations, or mathematical derivations that did not take place.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span><strong>Falsification & Image Fraud:</strong> Inappropriately manipulating research equipment, data points, or figures to support false conclusions.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span><strong>Authorship Malpractice:</strong> Ghost authorship (omitting valid contributors), gift authorship (including non-contributors), or purchasing author slots.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                                    <span><strong>Redundant Submissions:</strong> Submitting identical or duplicate empirical findings across multiple journals simultaneously.</span>
                                </li>
                            </ul>
                        </div>
                    )
                },
                {
                    id: 'investigation-protocol',
                    title: 'Investigation Protocols',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Allegations of research malpractice undergo a confidential, multi-step investigation:
                            </p>
                            <ol className="space-y-1.5 list-decimal pl-5 text-caption text-muted-foreground m-0">
                                <li><strong>Initial Assessment:</strong> The Editor-in-Chief reviews the allegations to establish whether prima facie evidence of misconduct exists.</li>
                                <li><strong>Author Query:</strong> The corresponding author is given 14 business days to provide verified raw datasets, laboratory logs, or institutional approvals.</li>
                                <li><strong>Expert Forensic Review:</strong> Independent image and statistical specialists examine the disputed artifacts if necessary.</li>
                                <li><strong>Institutional Escalation:</strong> If significant fabrication or manipulation is substantiated, the editor formally contacts the author&apos;s institutional integrity officer.</li>
                            </ol>
                        </div>
                    )
                },
                {
                    id: 'whistleblower-protection',
                    title: 'Whistleblower Protection & Reporting',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Academic whistleblowers, reviewers, and readers may report documented ethical concerns directly to the Editor-in-Chief via <a href={`mailto:${contactEmail}`} className="text-secondary font-bold hover:underline">{contactEmail}</a>.
                            </p>
                            <p>
                                All reports are handled with absolute confidentiality to shield whistleblowers from institutional or professional retaliation.
                            </p>
                        </div>
                    )
                }
            ]
        },

        'corrections-retractions': {
            slug: 'corrections-retractions',
            title: 'Corrections, Retractions, Errata & Expressions of Concern',
            description: `Procedures for post-publication amendments, formal retractions, and CrossMark preservation standards.`,
            metaDescription: `Learn how ${journalShort} handles errata, corrigenda, and retractions according to COPE guidelines to maintain scholarly record accuracy.`,
            relatedLinks: [
                { name: 'Publication Ethics', href: '/ethics' },
                { name: 'Research Misconduct', href: '/research-misconduct' },
                { name: 'Digital Archiving Policy', href: '/archiving-policy' },
                { name: 'Contact Editorial Office', href: '/contact' },
            ],
            sections: [
                {
                    id: 'errata-corrigenda',
                    title: 'Errata & Corrigenda (Post-Publication Corrections)',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Published scholarly literature represents a permanent public record. Amendments to published works are executed transparently according to <strong>COPE Retraction Guidelines</strong> and <strong>ICMJE</strong> standards.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                                    <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                                        <RefreshCw className="size-4" />
                                        <span>Corrigendum (Author Correction)</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0 leading-relaxed">
                                        Issued when authors identify minor inadvertent mathematical or typographic errors that do not affect the main conclusions.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                                    <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                                        <RefreshCw className="size-4" />
                                        <span>Erratum (Publisher Error)</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0 leading-relaxed">
                                        Issued when typesetting, printing, or digital metadata errors are inadvertently introduced by the publisher.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'expressions-of-concern',
                    title: 'Expressions of Concern',
                    content: (
                        <div className="space-y-4">
                            <p>
                                The Editor-in-Chief may issue an official Expression of Concern when well-founded doubts regarding research integrity arise while an institutional investigation remains pending or inconclusive.
                            </p>
                        </div>
                    )
                },
                {
                    id: 'formal-retractions',
                    title: 'Formal Retractions & Archival Preservation',
                    content: (
                        <div className="space-y-4">
                            <p>
                                A published article will be formally retracted if conclusive evidence confirms severe honest error, plagiarism, data fabrication, or ethical malpractice.
                            </p>
                            <ul className="space-y-1.5 list-none p-0 m-0 text-caption text-muted-foreground">
                                <li>• A formal Retraction Note is authored by the Editor-in-Chief and assigned an independent CrossRef DOI.</li>
                                <li>• The original online HTML abstract remains live with an unmistakable red Retraction Notice banner.</li>
                                <li>• The official published PDF is permanently watermarked with <strong>&quot;RETRACTED&quot;</strong> on every page in accordance with international archiving protocols.</li>
                                <li>• CrossRef and indexing registries are notified via updated CrossRef metadata deposits.</li>
                            </ul>
                        </div>
                    )
                }
            ]
        },

        'archiving-policy': {
            slug: 'archiving-policy',
            title: 'Digital Preservation & Archiving Policy',
            description: `Multi-tiered preservation architecture, JATS XML archiving, cloud redundancy, and repository mirror protocols.`,
            metaDescription: `Read about ${journalShort}'s digital preservation policy. JATS 1.3 XML, PDF/A-1b archiving, Zenodo community mirroring, and S3 redundancy.`,
            relatedLinks: [
                { name: 'Open Access Policy', href: '/open-access' },
                { name: 'Copyright Policy', href: '/copyright-policy' },
                { name: 'Licensing Policy', href: '/licensing-policy' },
                { name: 'Indexing Hub', href: '/indexing' },
            ],
            sections: [
                {
                    id: 'multi-tiered-preservation',
                    title: 'Multi-Tiered Preservation Architecture',
                    content: (
                        <div className="space-y-4">
                            <p>
                                <strong>{journalName}</strong> is committed to the perpetual preservation of scholarly output to protect research from catastrophic hardware failures or technological obsolescence.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                                    <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                                        <Database className="size-4" />
                                        <span>JATS 1.3 XML Archiving</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        Every published paper is converted to standard JATS 1.3 XML for platform-independent long-term semantic readability.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                                    <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                                        <FileText className="size-4" />
                                        <span>Archival PDF/A Compliance</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        Galley proofs are produced in PDF/A-1b format with embedded fonts and standardized Highwire Press scholarly metadata.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                                    <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                                        <UploadCloud className="size-4" />
                                        <span>Redundant Cloud Storage</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        Assets and PDFs are mirrored across geographically distributed S3 cloud nodes with automated point-in-time snapshots.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                                    <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                                        <Globe className="size-4" />
                                        <span>OAI-PMH 2.0 Harvester</span>
                                    </div>
                                    <p className="text-muted-foreground text-caption m-0">
                                        A public endpoint at <code>/api/oai</code> allows libraries and global discovery indexing networks to mirror Dublin Core metadata continuously.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'repository-deposit',
                    title: 'Author Self-Archiving & Repository Deposit',
                    content: (
                        <div className="space-y-4">
                            <p>
                                {journalShort} is a <strong>Green Open Access</strong> journal with zero embargo periods. Authors are actively encouraged to deposit the final published PDF in institutional repositories (DSpace, EPrints), discipline archives (arXiv, TechRxiv, Zenodo), and scholarly social platforms.
                            </p>
                        </div>
                    )
                },
                {
                    id: 'cessation-plan',
                    title: 'Journal Cessation Contingency Plan',
                    content: (
                        <div className="space-y-4">
                            <p>
                                In the unlikely event that {journalShort} terminates operations or ceases publication, all published volumes, issues, full-text PDFs, and metadata will remain permanently accessible through our distributed preservation partners, Open Access repositories, and public registry mirrors.
                            </p>
                        </div>
                    )
                }
            ]
        },

        'ai-policy': {
            slug: 'ai-policy',
            title: 'Artificial Intelligence (AI) & Generative AI Policy',
            description: `Ethical standards governing the use of AI tools, LLMs, authorship restrictions, and mandatory disclosure statements.`,
            metaDescription: `Read ${journalShort}'s policy on Generative AI and LLMs in scholarly publishing. Full compliance with COPE, WAME, and DOAJ 2024 standards.`,
            relatedLinks: [
                { name: 'Publication Ethics', href: '/ethics' },
                { name: 'Author Guidelines', href: '/guidelines' },
                { name: 'Peer Review Process', href: '/peer-review' },
                { name: 'Plagiarism Policy', href: '/plagiarism-policy' },
            ],
            sections: [
                {
                    id: 'authorship-criteria',
                    title: 'Authorship Restrictions for AI Tools',
                    content: (
                        <div className="space-y-4">
                            <p>
                                In accordance with the <strong>2024 DOAJ Standards</strong>, <strong>COPE Position Statements</strong>, and <strong>WAME Guidelines</strong>, artificial intelligence systems, large language models (such as ChatGPT, Claude, Gemini), and automated code generators <strong>cannot be listed or credited as authors</strong> on any manuscript submitted to <strong>{journalName}</strong>.
                            </p>
                            <p>
                                Authorship entails legal, ethical, and scientific accountability for the integrity, novelty, and veracity of research. AI tools cannot assume legal liability, give informed consent, or hold copyright.
                            </p>
                        </div>
                    )
                },
                {
                    id: 'mandatory-disclosure',
                    title: 'Mandatory Disclosure Requirements',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Authors who utilize generative AI or AI-assisted technologies during any stage of manuscript conception, data analysis, translation, or writing must provide transparent disclosure:
                            </p>
                            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 text-body-sm">
                                <p className="m-0 font-bold text-foreground">Where to Disclose:</p>
                                <p className="m-0 text-muted-foreground">
                                    Include a dedicated section titled <strong>&quot;AI and AI-Assisted Technologies Statement&quot;</strong> immediately preceding the references.
                                </p>
                                <p className="m-0 font-bold text-foreground pt-1">What to Disclose:</p>
                                <ul className="space-y-1 list-none p-0 m-0 text-muted-foreground">
                                    <li>• Software name, model version, and developer (e.g. <em>ChatGPT-4o, OpenAI</em>).</li>
                                    <li>• Date(s) of access and specific tasks performed (grammar refinement, translation, coding).</li>
                                    <li>• Mandatory Declaration: <em>&quot;The authors have reviewed and edited all AI-assisted content and assume full responsibility for the accuracy and originality of the text.&quot;</em></li>
                                </ul>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'data-image-authenticity',
                    title: 'Prohibition of Synthetic Data & Figure Manipulation',
                    content: (
                        <div className="space-y-4">
                            <p>
                                The generation of synthetic empirical datasets, simulated experimental readings, fabricated patient records, or artificial micrographs using Generative AI constitutes <strong>scientific data fabrication</strong> and results in immediate rejection or formal retraction.
                            </p>
                            <p>
                                AI tools must never be used to alter, clone, or enhance scientific figures, circuit diagrams, or laboratory imagery.
                            </p>
                        </div>
                    )
                },
                {
                    id: 'reviewer-confidentiality',
                    title: 'Confidentiality During Peer Review',
                    content: (
                        <div className="space-y-4">
                            <p>
                                Peer reviewers are strictly forbidden from uploading submitted manuscripts, abstracts, or reviewer comments into public or third-party generative AI models. Doing so violates peer review confidentiality, author intellectual property rights, and data protection regulations.
                            </p>
                        </div>
                    )
                }
            ]
        },

        'publisher-info': {
            slug: 'publisher-info',
            title: 'Publisher Information, Governance & Ownership',
            description: `Corporate publishing body details, legal status, governance hierarchy, editorial leadership, and revenue model.`,
            metaDescription: `Discover the publishing governance, corporate ownership, and editorial leadership of ${journalName} published by ${publisher}.`,
            relatedLinks: [
                { name: 'About Journal', href: '/about' },
                { name: 'Editorial Board', href: '/editorial-board' },
                { name: 'Contact Office', href: '/contact' },
                { name: 'Open Access Policy', href: '/open-access' },
            ],
            sections: [
                {
                    id: 'publishing-body',
                    title: 'Publishing Entity & Headquarters',
                    content: (
                        <div className="space-y-4">
                            <p>
                                <strong>{journalName}</strong> is an international peer-reviewed scholarly publication published by <strong>{publisher}</strong> in accordance with the <strong>Principles of Transparency and Best Practice in Scholarly Publishing</strong> established by COPE, DOAJ, OASPA, and WAME.
                            </p>
                            <div className="p-4 rounded-xl bg-card border border-border space-y-3 text-body-sm shadow-2xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <span className="font-bold text-foreground">Journal Title:</span>
                                        <p className="m-0 text-muted-foreground">{journalName}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-foreground">Online ISSN:</span>
                                        <p className="m-0 text-muted-foreground font-mono">{issn}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-foreground">Publishing House:</span>
                                        <p className="m-0 text-primary font-semibold">{publisher}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-foreground">MSME Udyam Registration:</span>
                                        <p className="m-0 text-muted-foreground font-mono">{udyamRegistration}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="font-bold text-foreground">Registered Office Address:</span>
                                        <p className="m-0 text-muted-foreground whitespace-pre-line">{officeAddress}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-foreground">Editorial & Support Email:</span>
                                        <p className="m-0 text-muted-foreground font-mono">{supportEmail}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-foreground">Phone / WhatsApp:</span>
                                        <p className="m-0 text-muted-foreground font-mono">{supportPhone}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-foreground">Official Journal Portal:</span>
                                        <p className="m-0 text-muted-foreground font-mono">{journalWebsite}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-foreground">Publication Frequency:</span>
                                        <p className="m-0 text-muted-foreground">{publicationFrequency}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: 'editorial-independence',
                    title: 'Editorial Independence & Governance',
                    content: (
                        <div className="space-y-4">
                            <p>
                                {journalShort} maintains strict separation between editorial decisions and publishing management:
                            </p>
                            <ul className="space-y-1.5 list-none p-0 m-0 text-caption text-muted-foreground">
                                <li>• The Editor-in-Chief and independent Editorial Board maintain sole authority over all peer-reviewed content, manuscript acceptances, and retractions.</li>
                                <li>• Administrative management and APC revenue collection have zero influence on editorial outcomes.</li>
                                <li>• Editors and reviewers receive no financial incentives tied to paper acceptance rates.</li>
                            </ul>
                        </div>
                    )
                },
                {
                    id: 'revenue-sustainability',
                    title: 'Revenue Model & Financial Sustainability',
                    content: (
                        <div className="space-y-4">
                            <p>
                                {journalShort} operates under a Gold Open Access financial model sustained through transparent Article Processing Charges paid by authors&apos; institutions or research grants upon paper acceptance.
                            </p>
                            <p>
                                The journal carries no intrusive commercial advertisements, corporate sponsorships, or paywalled access barriers.
                            </p>
                        </div>
                    )
                }
            ]
        }
    };
}
