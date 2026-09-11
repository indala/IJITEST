"use server";
import "server-only";

import { db } from "@/lib/db";
import { staticPages, settings } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
    type StaticPage
} from "@/db/types";
import {
    type ActionResponse,
    actionSuccess,
    actionError,
    serverError
} from "@/lib/action-response";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath, cacheLife, cacheTag } from "next/cache";

const DEFAULT_STATIC_PAGES = [
    {
        slug: "open-access-policy",
        title: "Open Access Policy",
        content: `## Open Access & Scholarly Distribution Statement

**International Journal of Innovative Technology and Exploring Science (IJITEST)** is a fully open-access journal committed to the immediate and unrestricted global dissemination of scientific research.

### Core Principles
1. **Zero Embargo**: All research articles, review papers, and technical notes published in IJITEST are made freely and permanently available online immediately upon publication.
2. **No Subscription Fees**: Readers, academic institutions, and libraries are never charged for reading, downloading, copying, distributing, printing, or linking to the full texts of our articles.
3. **Licensing**: All articles are published under the terms of the **Creative Commons Attribution 4.0 International License (CC-BY 4.0)**. Under this license, authors retain copyright while granting anyone permission to copy, redistribute, remix, transform, and build upon the material for any purpose, provided appropriate credit is given.
4. **Self-Archiving (Green Open Access)**: Authors are permitted and actively encouraged to deposit the final published PDF version (Version of Record) in institutional repositories, subject repositories (such as arXiv, ResearchGate, or Zenodo), and personal websites.

### Archiving & Digital Preservation
IJITEST employs distributed digital preservation strategies (including automated XML archiving and redundant cloud storage) to guarantee permanent perpetual access to scholarly literature.`,
        isPublished: true,
        showInNav: true,
        navLabel: "Open Access",
        navOrder: 1,
    },
    {
        slug: "ethics-and-malpractice",
        title: "Publication Ethics and Malpractice Statement",
        content: `## Publication Ethics & Malpractice Policy

IJITEST strictly adheres to the ethical guidelines and code of conduct established by the **Committee on Publication Ethics (COPE)** and the **International Committee of Medical Journal Editors (ICMJE)**.

### 1. Duties of the Editorial Board
- **Impartiality**: Manuscripts are evaluated solely on their intellectual and scientific merit, without regard to race, gender, sexual orientation, religious belief, ethnic origin, citizenship, or political philosophy of the authors.
- **Confidentiality**: Editors and editorial staff will not disclose any information about a submitted manuscript to anyone other than corresponding authors, reviewers, and potential reviewers.
- **Conflict of Interest**: Editors recuse themselves from considering manuscripts in which they have conflicts of interest resulting from competitive, collaborative, or other relationships with authors or institutions.

### 2. Duties of Peer Reviewers
- **Objective Evaluation**: Peer reviews must be conducted objectively, with constructive feedback supported by clear arguments. Personal criticism of the author is inappropriate.
- **Promptness**: Reviewers who feel unqualified to review the research reported in a manuscript or know that timely review will be impossible must notify the editor and decline the invitation.
- **Confidentiality**: Privileged information or ideas obtained through peer review must be kept confidential and not used for personal advantage.

### 3. Duties of Authors
- **Originality & Plagiarism**: Authors must ensure that their work is entirely original. Plagiarism in any form (including self-plagiarism, text recycling without attribution, or verbatim copying) constitutes serious publication malpractice and leads to immediate manuscript rejection.
- **Authorship**: Authorship must be limited to those who have made a substantial contribution to conception, design, execution, or interpretation of the reported study (**CRediT** taxonomy).
- **Data Integrity**: Fabrication, falsification, or deliberate distortion of experimental datasets is unethical and unacceptable.`,
        isPublished: true,
        showInNav: true,
        navLabel: "Publication Ethics",
        navOrder: 2,
    },
    {
        slug: "peer-review-process",
        title: "Peer Review Process & Workflow",
        content: `## Double-Blind Peer Review Workflow

IJITEST enforces a rigorous **double-blind peer review** process to safeguard academic integrity and impartiality. Both the reviewer and author identities remain anonymous throughout the evaluation cycle.

\`\`\`mermaid
flowchart TD
    A[Manuscript Submission] --> B[Initial Editorial Screening & Scope Check]
    B -->|Passed| C[Plagiarism & Technical Compliance Check]
    B -->|Failed| R1[Desk Rejection]
    C -->|Passed| D[Double-Blind Reviewer Assignment]
    C -->|High Similarity| R2[Reject / Return to Author]
    D --> E[Independent Expert Reviews]
    E --> F{Editor Evaluation}
    F -->|Accept| G[Production & Galley Proofing]
    F -->|Minor / Major Revision| H[Author Revisions & Re-review]
    F -->|Reject| I[Formal Rejection]
    H --> F
    G --> J[Volume/Issue Publication & DOI Minting]
\`\`\`

### Review Timeline
- **Initial Screening**: 48 – 72 hours
- **First-Round Reviewer Reports**: 2 – 3 weeks
- **Author Revisions Window**: 7 – 14 days
- **Final Decision & Notification**: 5 – 7 days following revision
- **Online Publication**: Within 3 days following acceptance and payment completion.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Review Process",
        navOrder: 3,
    },
    {
        slug: "author-guidelines",
        title: "Author Guidelines & Manuscript Formatting",
        content: `## Comprehensive Author Guidelines

Please prepare your manuscript in strict conformity with the following editorial standards before submitting to IJITEST.

### 1. Manuscript Structure (IMRAD)
- **Title Page**: Concise, informative title (avoid abbreviations and acronyms where possible).
- **Abstract**: Unstructured or structured summary between 150 and 250 words outlining objective, methodology, key findings, and scientific significance.
- **Keywords**: 4 to 6 relevant index terms separated by commas.
- **Introduction**: Background context, problem formulation, critical literature gaps, and explicit research objectives.
- **Materials & Methods / System Architecture**: Sufficient mathematical, algorithmic, or empirical detail to allow reproducible experimentation.
- **Results & Discussion**: Data visualization, tables, comparative analysis with benchmarks, and insightful interpretation.
- **Conclusion**: Summary of findings, real-world implications, limitations, and prospective research trajectories.
- **Declarations**: Competing interests, funding acknowledgments, and ethical approvals.
- **References**: IEEE citation standard formatted with complete DOIs wherever available.

### 2. Section Classifications
When submitting, select the appropriate journal section:
- **Original Research Articles**: Up to 8,000 words.
- **Review Articles**: Comprehensive state-of-the-art literature syntheses up to 12,000 words.
- **Short Communications & Technical Notes**: Brief empirical reports up to 4,000 words.
- **Case Studies**: In-depth industrial or applied validation studies up to 6,000 words.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Author Guidelines",
        navOrder: 4,
    },
    {
        slug: "aims-scope",
        title: "Aims & Scope",
        content: `## Aims and Scope of {{journalName}}

**{{journalName}}** (ISSN: {{issnNumber}}) is a monthly, multidisciplinary, open-access, peer-reviewed international journal dedicated to publishing high-quality, innovative, and original research spanning all domains of engineering, technological sciences, and computer systems.

### Core Objectives
1. **Foster Global Scientific Exchange**: Provide an accessible, zero-barrier platform for researchers, academicians, and industrial professionals to disseminate groundbreaking engineering breakthroughs.
2. **Bridge Theoretical Models and Applied Engineering**: Prioritize research that bridges fundamental science, mathematical modeling, and real-world engineering applications.
3. **Promote Open Science**: Ensure immediate, unrestricted global access to all research artifacts, datasets, and methodologies under the Creative Commons Attribution 4.0 International (CC-BY 4.0) license.

### Subject Coverage & Disciplines
{{journalName}} welcomes high-caliber original research, critical review papers, and technical case studies across the following core thematic areas:

- **Computer Science & Information Technology**: Artificial Intelligence, Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, Cloud Computing, Distributed Ledger Technologies / Blockchain, Big Data Analytics, Cyber Security, and Software Engineering.
- **Electrical & Electronics Engineering**: VLSI Design, Embedded Systems, Renewable Energy Integration, Microgrids, Power Electronics, Wireless Sensor Networks, Internet of Things (IoT), Signal & Image Processing, and Robotics.
- **Mechanical & Mechatronics Engineering**: Computational Fluid Dynamics (CFD), Finite Element Analysis (FEA), Thermal Engineering, Additive Manufacturing / 3D Printing, Advanced Composite Materials, Precision Machining, and Autonomous Vehicles.
- **Civil & Environmental Engineering**: Structural Health Monitoring, Green Building Technologies, Sustainable Infrastructure, Earthquake Engineering, Water Resource Management, and Smart Transportation Systems.
- **Chemical, Biological & Materials Engineering**: Nanomaterials, Biomaterials, Polymer Science, Process Modeling and Optimization, Green Synthesis, and Environmental Pollution Abatement.
- **Interdisciplinary & Emerging Technologies**: Biomedical Instrumentation, Human-Computer Interaction, Smart Cities, Quantum Computing Applications, and Cyber-Physical Systems.

### Types of Manuscripts Accepted
- **Original Research Articles**: Substantive empirical or theoretical contributions detailing novel methodologies, experimental findings, and validation benchmarks (up to 8,000 words).
- **Review Articles**: Critical, systematic literature reviews identifying trends, state-of-the-art developments, and future research directions (up to 12,000 words).
- **Short Communications & Technical Notes**: Rapid dissemination of preliminary findings, novel software toolkits, or critical methodological improvements (up to 4,000 words).
- **Industrial Case Studies**: Real-world engineering implementations, failure analyses, or technological deployments of significant interest to practitioners (up to 6,000 words).

### Publication Frequency
{{journalName}} operates on a continuous publication model aggregated into 12 regular monthly issues per annual volume. Articles are published online in their final Version of Record immediately following editorial acceptance and galley proof sign-off.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Aims & Scope",
        navOrder: 5,
    },
    {
        slug: "copyright-policy",
        title: "Copyright & Author Rights Policy",
        content: `## Copyright and Author Rights Retention

{{journalName}} is fully committed to the principles of open research, author empowerment, and unrestricted scholarly distribution. In strict accordance with the **Budapest Open Access Initiative (BOAI)** and the **Directory of Open Access Journals (DOAJ)** criteria, authors publishing with {{journalName}} retain the copyright of their work without restrictions.

### Author Rights Retention
- **Authors Retain Full Copyright**: Authors publishing with {{journalName}} retain 100% of their copyright and proprietary rights to their intellectual work. Authors are not required to transfer or assign copyright to the publisher or the journal.
- **Non-Exclusive Publishing License**: In submitting their manuscript, authors grant {{journalName}} and {{publisher}} a non-exclusive license to publish, display, distribute, index, and archive the Version of Record (published article) in all formats and media.
- **First Publication Rights**: Authors grant {{journalName}} the right of first commercial and digital publication of the manuscript under the **Creative Commons Attribution 4.0 International (CC-BY 4.0)** license.

### Author Self-Archiving & Green Open Access
Authors have the unrestricted right to deposit and share all versions of their manuscript across any platform without embargo:
1. **Preprint (Author's Original Manuscript)**: Authors may post preprints on personal websites, preprint servers (such as arXiv, TechRxiv, SSRN), or institutional repositories at any time before or during peer review.
2. **Postprint (Accepted Author Manuscript)**: Authors may deposit the peer-reviewed, accepted version on institutional repositories or departmental servers immediately upon formal acceptance.
3. **Version of Record (Final Published PDF)**: Authors are actively encouraged to deposit the final published PDF, complete with official DOI, citation information, and journal branding, in any repository (e.g., Zenodo, ResearchGate, institutional databases) immediately upon online publication.

### Citation & Attribution Requirements
Any subsequent republication, distribution, or re-use of the work (in whole or in part) must include a complete citation acknowledging {{journalName}} as the original venue of publication, including:
- Author name(s)
- Article title
- *{{journalName}}*, Volume, Issue, Page numbers
- Official CrossRef DOI link (https://doi.org/...)

### Third-Party Materials
Authors are responsible for obtaining formal written permissions to reproduce any third-party figures, tables, illustrations, or extended quotations that are under existing copyright, and must explicitly credit the copyright holder in the manuscript captions.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Copyright Policy",
        navOrder: 6,
    },
    {
        slug: "licensing-policy",
        title: "Licensing Policy & Open Access Terms",
        content: `## Open Access Licensing Terms

All articles, reviews, and technical content published by **{{journalName}}** are published and distributed under the terms of the **Creative Commons Attribution 4.0 International License (CC-BY 4.0)**.

### What CC-BY 4.0 Permits
Under the CC-BY 4.0 license, anyone in the world is free to:
- **Share**: Copy, distribute, display, and transmit the work in any medium or format.
- **Adapt**: Remix, transform, translate, and build upon the work for any purpose, including commercial purposes.

### Conditions of Use
The above freedoms are granted on the sole condition that:
- **Attribution**: You must give appropriate credit to the original author(s), provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- **No Additional Restrictions**: You may not apply legal terms or technological measures (such as DRM) that legally restrict others from doing anything the license permits.

### DOAJ and Budapest Open Access Compliance
This licensing framework conforms fully to the Budapest Open Access Initiative (BOAI) definition of open access:
> *"By 'open access' to this literature, we mean its free availability on the public internet, permitting any users to read, download, copy, distribute, print, search, or link to the full texts of these articles, crawl them for indexing, pass them as data to software, or use them for any other lawful purpose, without financial, legal, or technical barriers other than those inseparable from gaining access to the internet itself."*

### Machine-Readable Metadata
{{journalName}} embeds machine-readable licensing metadata across every publication asset:
- Dublin Core metadata tags in the HTML header (\`dc.rights\`) pointing to \`https://creativecommons.org/licenses/by/4.0/\`
- Standard CrossRef Schema 5.3 \`<license_ref>\` XML nodes deposited with CrossRef upon publication
- JATS 1.3 XML \`<permissions>\` blocks with embedded CC-BY license URI
- Persistent visual CC-BY license banner stamped on the first page of every official PDF downloaded from our servers.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Licensing Policy",
        navOrder: 7,
    },
    {
        slug: "apc-fees",
        title: "Article Processing Charges (APC) & Fee Transparency",
        content: `## Article Processing Charges (APC) & Financial Transparency

**{{journalName}}** is committed to total transparency regarding all publishing fees and author charges in compliance with the **DOAJ Basic Criteria** and **OASPA (Open Access Scholarly Publishing Association)** guidelines.

### Zero Submission Fees
- **No Manuscript Submission Fee**: Submitting an article to {{journalName}} is **100% free of charge**.
- **No Peer Review Fee**: Editorial screening, plagiarism checking, and double-blind peer review are conducted without any cost to the author.
- Authors are under no financial obligation when submitting their work.

### Article Processing Charges (APC) Upon Acceptance Only
To cover the operational costs of open-access publishing—including digital platform maintenance, cloud storage, editorial processing, plagiarism screening software (Turnitin/iThenticate), CrossRef DOI minting, PDF typesetting and header branding, permanent digital archiving, and indexing protocols—an **Article Processing Charge (APC)** is payable **only after** a manuscript has been formally accepted by the Editor-in-Chief following double-blind peer review.

#### Current APC Schedule (Effective {{year}})
- **Authors based in India**: ₹2,000 INR per accepted manuscript (up to 8 pages; additional pages ₹200/page).
- **International Authors**: $50 USD per accepted manuscript (up to 8 pages; additional pages $10/page).
- **Invited Editorial Contributions & Errata**: Free of charge.

*Note: APC is subject to applicable local taxes (e.g. GST in India). There are no additional charges for color figures, supplementary data files, or multi-author manuscripts.*

### Editorial Independence Guaranteed
The editorial board and independent peer reviewers operate with absolute editorial autonomy:
- Reviewers and editors have **no access** to payment records.
- Editorial decisions (Accept, Revise, Reject) are based solely on scientific merit, originality, and methodological rigor.
- An author's ability or inability to pay has zero influence on the peer-review outcome.

### Fee Waiver & Discount Policy
{{journalName}} believes that financial hardship must never impede the publication of high-quality scientific research. We maintain an equitable waiver policy:
1. **Low-Income Economies**: Authors affiliated with institutions in countries classified by the World Bank as Low-Income Economies are eligible for up to a **100% full waiver** of the APC.
2. **Lower-Middle-Income Economies**: Authors from Lower-Middle-Income Economies may request a **50% discount**.
3. **Hardship Waivers**: Unfunded graduate students, independent researchers, and scholars experiencing verified financial constraints may apply for discretionary fee relief.

#### How to Request a Waiver
Authors requesting an APC waiver must state their intent in the cover letter during manuscript submission, specifying the corresponding author's institutional affiliation, country of residence, and funding status. Waiver requests must be made during submission and cannot be requested after acceptance.`,
        isPublished: true,
        showInNav: false,
        navLabel: "APC & Fees",
        navOrder: 8,
    },
    {
        slug: "plagiarism-policy",
        title: "Plagiarism, Similarity & Academic Integrity Policy",
        content: `## Plagiarism and Academic Integrity Policy

Academic integrity is the cornerstone of scholarly communication. **{{journalName}}** enforces a rigorous, zero-tolerance policy against all forms of plagiarism, academic dishonesty, and intellectual misappropriation in accordance with the guidelines established by the **Committee on Publication Ethics (COPE)**.

### Definition of Plagiarism
Plagiarism is the appropriation of another person's ideas, processes, results, words, code, or imagery without giving appropriate credit or attribution. Plagiarism encompasses:
- **Verbatim Copying**: Reproducing text word-for-word from another source without quotation marks and explicit citation.
- **Substantial Paraphrasing**: Rewording another author's concepts or arguments without proper acknowledgment.
- **Self-Plagiarism & Text Recycling**: Reusing substantial portions of the author's own previously published papers without citation or without explicit justification.
- **Image & Data Manipulation**: Splicing, cloning, enhancing, or fabricating figures, micrographs, or datasets to mislead readers.
- **Idea Plagiarism**: Claiming original ownership of an innovative concept, algorithm, or methodology originally proposed by another scholar.

### Screening Workflow & Similarity Thresholds
Every manuscript submitted to {{journalName}} is subjected to mandatory automated similarity screening using industry-leading software (**Turnitin** / **iThenticate**) prior to peer review.

#### Editorial Thresholds:
- **Overall Similarity Index**: Must be **less than 15%** (excluding standard bibliography, references, common mathematical definitions, and standard experimental apparatus descriptions).
- **Single Source Match**: No single source may account for more than **2%** of similarity.
- **Methods Section**: Standard protocols must be appropriately cited rather than copied verbatim.

### Handling Discovered Plagiarism
The editorial team adheres strictly to COPE flowcharts when handling suspected similarity or plagiarism:
1. **During Initial Editorial Screening**: If similarity exceeds 15% but exhibits unintentional phrasing overlap, the manuscript is returned to the author for revision and rephrasing before review. If blatant copying is identified, the paper is **desk-rejected immediately**.
2. **During Peer Review**: If a reviewer flags plagiarism or uncredited sources, the editor conducts an in-depth investigation. If confirmed, the submission is rejected, and the author is notified.
3. **Post-Publication**: If plagiarism or duplicate publication is demonstrated post-publication:
   - The Editor-in-Chief contacts the corresponding author and co-authors for a formal explanation.
   - If the explanation is unsatisfactory, the article is formally **retracted** in accordance with COPE Retraction Guidelines.
   - A public Retraction Notice is published, and the institutional head or ethics committee of the authors' institution may be formally notified.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Plagiarism Policy",
        navOrder: 9,
    },
    {
        slug: "conflict-of-interest",
        title: "Conflict of Interest & Competing Interests Policy",
        content: `## Conflict of Interest and Competing Interests Policy

Transparency regarding potential conflicts of interest is vital to ensuring public trust in the scientific peer-review process. **{{journalName}}** requires all authors, reviewers, and editors to declare any financial, professional, or personal affiliations that could bias or be perceived to bias their manuscript evaluation.

### What Constitutes a Competing Interest?
A competing interest arises when an individual's personal, financial, or academic affiliations could unduly influence (or appear to influence) their professional judgment. Competing interests can be:
- **Financial Interests**: Employment, research grants, patents (held or pending), commercial sponsorships, consultancies, stock ownership, advisory board memberships, or paid expert testimonies within the preceding 36 months related to the manuscript subject.
- **Non-Financial Interests**: Personal or family relationships, academic rivalries, institutional loyalties, intellectual preconceptions, or participation in political/advocacy groups directly affected by the research outcomes.

### Duties of Authors
- **Mandatory Declaration**: All submitted manuscripts must include a dedicated **"Declaration of Competing Interests"** section preceding the references.
- **Positive Declaration**: If competing interests exist, authors must explicitly disclose: *"Authors [A, B] declare the following financial/personal relationships which could be considered potential competing interests: [details]."*
- **Negative Declaration**: If no conflicts exist, authors must state: *"The authors declare that they have no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper."*
- **Funding Statement**: Authors must explicitly list all research funding sources, grant numbers, and the role of the sponsor in study design, data collection, and manuscript preparation.

### Duties of Peer Reviewers
- Reviewers must disclose any potential conflicts of interest immediately upon receiving a review invitation.
- Reviewers must **recuse themselves** from reviewing if they:
  - Belong to the same institution or department as any author.
  - Have co-authored publications with any author within the past 3 years.
  - Have a mentor-mentee relationship with the author.
  - Hold a financial or commercial stake in the technology or compound discussed in the manuscript.
- Our editorial management system features an automated Conflict of Interest (COI) detector that flags matching reviewer and author institutional domains.

### Duties of Editors & Editorial Board
- Editors must recuse themselves from managing submissions where they have personal, professional, or financial ties with the authors.
- Submissions authored by the Editor-in-Chief, Associate Editors, or Editorial Board members are managed by an independent guest editor with external double-blind reviewers.
- In accordance with DOAJ requirements, editorial contributions by board members do not exceed the **25% endogeny limit** in any published volume.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Conflict of Interest",
        navOrder: 10,
    },
    {
        slug: "research-misconduct",
        title: "Research Misconduct & Whistleblower Policy",
        content: `## Research Misconduct, Whistleblowing & Allegation Handling

**{{journalName}}** is dedicated to upholding the highest standards of research integrity. We maintain strict procedures to investigate and resolve allegations of scientific misconduct, whether raised before or after publication, in accordance with the guidance of the **Committee on Publication Ethics (COPE)** and the **World Association of Medical Editors (WAME)**.

### Scope of Misconduct
Research misconduct includes, but is not limited to:
1. **Fabrication**: Making up data or results and recording or reporting them.
2. **Falsification**: Manipulating research materials, equipment, or processes, or changing or omitting data such that the research is not accurately represented.
3. **Data Manipulation & Image Fraud**: Inappropriate splicing, cloning, digital enhancement, or selective cropping of microscopy images, Western blots, or charts to support a predetermined hypothesis.
4. **Authorship Malpractice**: 
   - *Ghost Authorship*: Excluding individuals who made substantial contributions.
   - *Guest / Gift Authorship*: Granting authorship to individuals who did not contribute significantly to the work.
   - *Sale of Authorship*: Purchasing or trading author slots on paper submissions.
5. **Redundant or Duplicate Publication**: Submitting identical or substantially overlapping findings to multiple journals simultaneously (salami publishing).
6. **Breach of Research Ethics**: Conducting experimentation on human subjects or vertebrate animals without documented approval from a recognized Institutional Review Board (IRB) or Animal Ethics Committee.

### Investigation Protocol
When an allegation of misconduct is received by the editorial office:
1. **Preliminary Inquiry**: The Editor-in-Chief and the Integrity Committee review the evidence confidentially to assess whether the allegation has prima facie merit.
2. **Contacting Authors**: The corresponding author is presented with the specific allegations and given 14 days to provide a detailed, evidence-backed response, including original raw data, instrument logs, and IRB approval certificates.
3. **External Expert Review**: If ambiguity remains, the journal may consult independent subject matter experts or image forensic specialists.
4. **Institutional Escalation**: If severe fraud, fabrication, or deliberate data alteration is confirmed, the Editor-in-Chief formally reports the matter to the author's university ombudsman, dean, or funding authority.

### Whistleblower Protection & Confidentiality
- Whistleblowers, reviewers, and readers may submit documented concerns regarding any article directly to the Editor-in-Chief via \`{{contactEmail}}\`.
- The editorial office treats all communications with strict confidentiality and protects the identity of whistleblowers to prevent academic retaliation.
- Anonymous allegations will be investigated provided credible, verifiable scientific evidence (e.g. comparative image analysis or statistical discrepancies) is submitted.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Research Misconduct",
        navOrder: 11,
    },
    {
        slug: "corrections-retractions",
        title: "Corrections, Retractions, Errata & Expressions of Concern",
        content: `## Post-Publication Corrections, Retractions & Expressions of Concern

Scholarly publications are permanent records of scientific discovery. Alterations to published literature must be conducted transparently to preserve academic integrity. **{{journalName}}** handles post-publication amendments in accordance with the **COPE Retraction Guidelines** and the **International Committee of Medical Journal Editors (ICMJE)** standards.

### 1. Errata & Corrigenda (Corrections)
- **Corrigendum (Author Correction)**: Issued when an author discovers a significant unintended typographical, mathematical, or factual error that does not undermine the core findings or scientific validity of the paper.
- **Erratum (Publisher Error)**: Issued when a technical error is introduced by the journal during typesetting, formatting, or printing.
- **Procedure**:
  - A formal correction notice is published in the current issue, assigned its own unique CrossRef DOI, and indexed.
  - The correction notice clearly states what was originally published and what has been amended.
  - The original article HTML and PDF are updated to link bidirectionally to the correction notice, with CrossMark metadata reflecting the update.

### 2. Expressions of Concern
The Editor-in-Chief may publish an **Expression of Concern** when:
- There is well-founded reason to believe that a published paper may contain scientific misconduct or unreliable data, but an institutional investigation is ongoing or inconclusive.
- Impartial evidence of misconduct exists, but the authors' institution refuses to investigate or has delayed resolution unreasonably.
- An Expression of Concern alerts the scholarly community while formal fact-finding proceeds.

### 3. Formal Retractions
A published article will be formally **retracted** if:
- Clear evidence demonstrates that the findings are unreliable due to severe honest error (e.g., miscalculation, experimental error) or scientific misconduct (fabrication, falsification, or image manipulation).
- The paper constitutes plagiarism, unauthorized duplication, or violates copyright laws.
- Unethical research practices were employed without appropriate institutional review board approval.

#### Retraction Workflow:
- A formal Retraction Note titled *"Retraction: [Paper Title]"* is authored by the Editor-in-Chief and published with its own DOI.
- The retraction notice explicitly explains the reasons for retraction, who requested the retraction (authors, editors, or institutions), and summarizes findings.
- **Integrity of the Archive**: In accordance with international archiving standards, the original article is **not deleted** from the website. Instead:
  - The original HTML abstract page remains live with an unmistakable red Retraction Banner at the top.
  - The official PDF is watermarked on every page with **"RETRACTED"** in bold red lettering.
  - CrossRef and indexing databases are notified via updated CrossRef XML metadata to update citation registries immediately.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Corrections & Retractions",
        navOrder: 12,
    },
    {
        slug: "archiving-policy",
        title: "Digital Preservation & Archiving Policy",
        content: `## Digital Preservation and Long-Term Archiving Policy

**{{journalName}}** is dedicated to ensuring permanent, perpetual access to the scholarly record. We recognize the crucial role of digital preservation in safeguarding research from server failures, corporate changes, or technological obsolescence.

### Multi-Tiered Digital Preservation Architecture
To guarantee that published content remains accessible indefinitely, {{journalName}} employs a multi-tiered preservation strategy:

1. **JATS XML Archiving**: Every published article is generated and preserved in standard **JATS 1.3 (Journal Article Tag Suite)** full-text XML format. XML ensures platform-independent semantic preservation that can be rendered or parsed by future technological architectures.
2. **Archival PDF/A Format**: All published galley proofs are stored in high-resolution, vector-rendered **PDF/A-1b** compliance format with embedded fonts and standardized Highwire Press scholarly metadata headers.
3. **Geographically Redundant Cloud Storage**: Raw assets, galleys, supplementary files, and certificates are distributed across redundant S3-compatible cloud object storage nodes with real-time replication and automated snapshot backups.
4. **OAI-PMH 2.0 Harvester Protocol**: {{journalName}} exposes a public OAI-PMH (Open Archives Initiative Protocol for Metadata Harvesting) server endpoint at \`/api/oai\` allowing academic libraries, institutional harvesters, and preservation repositories (such as WorldCat and BASE) to continuously crawl, index, and mirror Dublin Core metadata.

### Author Self-Archiving & Repository Deposit (Green Open Access)
{{journalName}} is a **Green Open Access** journal. Authors are permitted and actively encouraged to archive and deposit all versions of their manuscripts into:
- Institutional digital repositories (e.g., DSpace, EPrints)
- Disciplinary subject repositories (e.g., arXiv, TechRxiv, PubMed Central, Zenodo)
- Academic social networks (e.g., ResearchGate, Academia.edu)
- Personal research websites

There is **zero embargo period**. Authors may self-archive the final published Version of Record (publisher's PDF) immediately upon online appearance.

### Journal Cessation Contingency Plan
In the unlikely event that {{journalName}} ceases publication or terminates its digital operations, all published volumes, issues, full-text PDFs, and metadata will be permanently preserved and maintained freely accessible to the global scientific community through our distributed archive partners and public repository mirrors.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Archiving Policy",
        navOrder: 13,
    },
    {
        slug: "ai-policy",
        title: "Artificial Intelligence (AI) & Generative AI Policy",
        content: `## Policy on the Use of Artificial Intelligence (AI) and Generative AI

As Artificial Intelligence (AI), Large Language Models (LLMs), and automated generative tools become widely integrated into scientific workflows, **{{journalName}}** establishes clear standards governing the ethical application of AI in research formulation, manuscript preparation, and peer review in strict alignment with the **2024 DOAJ Standards**, **COPE Position Statements**, and **WAME Guidelines**.

### 1. Authorship Criteria & AI Tools
- **AI Tools Cannot Be Authors**: Generative AI tools, chatbots, or LLMs (such as OpenAI's ChatGPT, Anthropic's Claude, Google's Gemini, or GitHub Copilot) **cannot be recognized or credited as authors or co-authors** on any manuscript submitted to {{journalName}}.
- **Legal Accountability**: Authorship carries legal, scientific, and ethical responsibility for the veracity, originality, and integrity of the reported work. AI tools cannot take legal responsibility, provide informed consent, or manage conflicts of interest.

### 2. Transparency & Mandatory Disclosure Requirements
- Authors who employ generative AI tools or AI-assisted technologies in any phase of their research or writing must explicitly disclose this in the manuscript.
- **Where to Disclose**: Include a dedicated subsection titled **"AI and AI-Assisted Technologies Statement"** preceding the references or within the Methodology section.
- **What to Disclose**:
  - Name and version of the AI software/tool utilized (e.g. *ChatGPT-4o, OpenAI*).
  - Date(s) of access.
  - Clear description of how the tool was applied (e.g., grammar refinement, translation assistance, writing assistance, code generation, data visualization).
  - Prompt structure or core instructions where applicable.
- **Human Oversight Guarantee**: Authors must include the following declaration: *"The authors have reviewed and edited the AI-generated content and assume full responsibility for the accuracy and originality of the text."*

### 3. Scientific Data & Image Authenticity
- **No Synthetic Data**: The use of generative AI to create synthetic experimental datasets, statistical outputs, clinical observations, or mathematical proofs to simulate actual research is categorized as **data fabrication** and will result in immediate rejection or retraction.
- **Scientific Figures & Imagery**: Generative AI must **not** be used to produce, modify, or manipulate scientific imagery (e.g. microscopy, electrophoresis gels, spectroscopic graphs, circuit diagrams). Minor digital corrections to contrast or brightness across the entire image are permitted if declared, but selective AI filtering or enhancement of features is prohibited.

### 4. Confidentiality During Peer Review
- **Reviewers Must Not Use Public AI**: Peer reviewers are strictly forbidden from uploading submitted manuscripts, titles, abstracts, or author details into public or third-party generative AI models.
- Uploading unpublished manuscript data into external AI systems violates the confidentiality of peer review, author intellectual property, and proprietary confidentiality agreements.`,
        isPublished: true,
        showInNav: false,
        navLabel: "AI Policy",
        navOrder: 14,
    },
    {
        slug: "publisher-info",
        title: "Publisher Information, Governance & Ownership",
        content: `## Publisher Information, Governance & Corporate Ownership

**{{journalName}}** is an international peer-reviewed scholarly journal published by **{{publisher}}**. In compliance with the **Principles of Transparency and Best Practice in Scholarly Publishing** jointly established by **COPE**, **DOAJ**, **OASPA**, and **WAME**, detailed organizational, legal, and operational information is transparently disclosed below.

### Publishing Body Details
- **Journal Name**: {{journalName}}
- **International Standard Serial Number (ISSN)**: {{issnNumber}} (Online)
- **Publisher**: {{publisher}}
- **Publication Headquarters**: Andhra Pradesh / Telangana, India
- **Legal Status**: Academic Scientific Publishing Entity dedicated to non-profit scholarly dissemination.
- **Website**: https://ijitest.org
- **Primary Editorial Inquiries**: {{contactEmail}}

### Editorial Independence & Governance
{{journalName}} maintains absolute and unwavering separation between editorial decision-making and publishing management:
- The **Editor-in-Chief** and the independent **Editorial Board** have sole and final authority over all editorial content, peer-review outcomes, volume compositions, and retraction decisions.
- The commercial management, advertising policies, and collection of Article Processing Charges (APCs) have zero bearing or influence on editorial assessments.
- Editors and reviewers receive no financial incentives tied to paper acceptance rates.

### Editorial Leadership
- **Editor-in-Chief**: Dr. Ravi Babu, Ph.D.
- **Executive Editorial Office**: {{contactEmail}}
- **Technical Support & Registry**: support@ijitest.org

### Revenue Model & Financial Sustainability
{{journalName}} operates on an Open Access Gold business model:
- The journal's operations are sustained entirely through transparent Article Processing Charges (APCs) paid by authors' institutions, funding bodies, or research grants upon paper acceptance, alongside private academic endowment grants from the publisher.
- The journal carries no intrusive commercial advertisements, corporate endorsements, or sponsored articles.`,
        isPublished: true,
        showInNav: false,
        navLabel: "Publisher Info",
        navOrder: 15,
    }
];

/**
 * Replace template tokens in static page content.
 */
async function injectTemplateVariables(rawContent: string): Promise<string> {
    try {
        const settingRows = await db.select().from(settings);
        const settingsMap: Record<string, string> = {};
        for (const row of settingRows) {
            if (row.settingKey && row.settingValue !== null) {
                settingsMap[row.settingKey] = row.settingValue;
            }
        }

        const journalName = settingsMap["journal_name"] || "International Journal of Innovative Technology and Exploring Science (IJITEST)";
        const issnNumber = settingsMap["issn_number"] || "2278-3075";
        const publisher = settingsMap["publisher"] || "IJITEST Publications";
        const contactEmail = settingsMap["contact_email"] || "editor@ijitest.org";
        const currentYear = "2026";

        return rawContent
            .replace(/\{\{journalName\}\}/g, journalName)
            .replace(/\{\{issnNumber\}\}/g, issnNumber)
            .replace(/\{\{publisher\}\}/g, publisher)
            .replace(/\{\{contactEmail\}\}/g, contactEmail)
            .replace(/\{\{year\}\}/g, currentYear);
    } catch {
        return rawContent;
    }
}

/**
 * Seeds default static pages if missing in the database.
 * Checks per-slug to ensure existing database pages are preserved while new defaults are inserted.
 */
export async function seedDefaultStaticPages(): Promise<ActionResponse<StaticPage[]>> {
    try {
        for (const item of DEFAULT_STATIC_PAGES) {
            const existing = await db.select({ id: staticPages.id }).from(staticPages).where(eq(staticPages.slug, item.slug)).limit(1);
            if (existing.length === 0) {
                await db.insert(staticPages).values(item);
            }
        }
        const all = await db.select().from(staticPages).orderBy(asc(staticPages.navOrder), asc(staticPages.title));
        return actionSuccess(all);
    } catch (error) {
        console.error("Seed default static pages error:", error);
        return serverError(error, "seed default static pages");
    }
}

/**
 * Public query: Fetch static page by slug with placeholder interpolation.
 * If page is in DEFAULT_STATIC_PAGES but not yet in DB, it auto-seeds on-the-fly.
 */
export async function getStaticPageBySlug(slug: string): Promise<ActionResponse<StaticPage>> {
    'use cache';
    cacheLife('days');
    cacheTag('static-pages');

    try {
        const cleanSlug = slug.trim().toLowerCase();
        let rows = await db.select()
            .from(staticPages)
            .where(eq(staticPages.slug, cleanSlug))
            .limit(1);

        // Auto-seed missing default if matched
        if (!rows.length || !rows[0]) {
            const defaultMatch = DEFAULT_STATIC_PAGES.find(p => p.slug === cleanSlug);
            if (defaultMatch) {
                try {
                    await db.insert(staticPages).values(defaultMatch);
                    rows = await db.select()
                        .from(staticPages)
                        .where(eq(staticPages.slug, cleanSlug))
                        .limit(1);
                } catch {
                    // Ignore insert collision if another request inserted concurrently
                }
            }
        }

        if (!rows.length || !rows[0]) {
            return actionError("Static page not found");
        }

        const page = rows[0];
        if (!page.isPublished) {
            return actionError("This page is currently unpublished");
        }

        const processedContent = await injectTemplateVariables(page.content);

        return actionSuccess({
            ...page,
            content: processedContent,
        });
    } catch (error) {
        console.error("Get static page by slug error:", error);
        return serverError(error, "fetch static page content");
    }
}

/**
 * Public query: Fetch navigation items configured to show in nav.
 */
export async function getNavStaticPages(): Promise<ActionResponse<StaticPage[]>> {
    'use cache';
    cacheLife('days');
    cacheTag('static-pages');

    try {
        const rows = await db.select()
            .from(staticPages)
            .where(eq(staticPages.isPublished, true))
            .orderBy(asc(staticPages.navOrder), asc(staticPages.title));

        const navPages = rows.filter(p => p.showInNav);
        return actionSuccess(navPages);
    } catch (error) {
        console.error("Get nav static pages error:", error);
        return serverError(error, "fetch nav pages");
    }
}

/**
 * Public query: Fetch all published static pages for sitemap and directory listings.
 */
export async function getAllPublishedStaticPages(): Promise<ActionResponse<StaticPage[]>> {
    'use cache';
    cacheLife('days');
    cacheTag('static-pages');

    try {
        const rows = await db.select()
            .from(staticPages)
            .where(eq(staticPages.isPublished, true))
            .orderBy(asc(staticPages.navOrder), asc(staticPages.title));

        return actionSuccess(rows);
    } catch (error) {
        console.error("Get all published static pages error:", error);
        return serverError(error, "fetch published pages");
    }
}


/**
 * Admin query: Fetch all static pages (published and unpublished).
 */
export async function getAllStaticPagesAdmin(): Promise<ActionResponse<StaticPage[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }

        // Auto-seed if empty
        const countCheck = await db.select().from(staticPages).limit(1);
        if (countCheck.length === 0) {
            await seedDefaultStaticPages();
        }

        const rows = await db.select()
            .from(staticPages)
            .orderBy(asc(staticPages.navOrder), asc(staticPages.title));

        return actionSuccess(rows);
    } catch (error) {
        console.error("Get all static pages admin error:", error);
        return serverError(error, "fetch admin static pages");
    }
}

/**
 * Admin action: Create a new custom static page.
 */
export async function createStaticPage(data: {
    slug: string;
    title: string;
    content: string;
    isPublished?: boolean;
    showInNav?: boolean;
    navLabel?: string | null;
    navOrder?: number;
}): Promise<ActionResponse<StaticPage>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }

        const rawSlug = (data.slug || "").trim().toLowerCase();
        const slug = rawSlug.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const title = (data.title || "").trim();
        const content = (data.content || "").trim();

        if (!slug) {
            return actionError("A valid URL slug is required (e.g. 'about-us' or 'indexing')");
        }
        if (!title) {
            return actionError("Page title is required");
        }
        if (!content) {
            return actionError("Page content is required");
        }

        // Check uniqueness
        const existing = await db.select().from(staticPages).where(eq(staticPages.slug, slug)).limit(1);
        if (existing.length > 0) {
            return actionError(`A page with slug '${slug}' already exists. Please choose a different slug.`);
        }

        const insertResult = await db.insert(staticPages).values({
            slug,
            title,
            content,
            isPublished: data.isPublished ?? true,
            showInNav: data.showInNav ?? false,
            navLabel: data.navLabel?.trim() || null,
            navOrder: data.navOrder ?? 0,
        });

        const newId = Number(insertResult[0]?.insertId);
        const created = await db.select().from(staticPages).where(eq(staticPages.id, newId)).limit(1);

        revalidatePath(`/pages/${slug}`);
        revalidatePath("/admin/pages");

        if (!created.length || !created[0]) {
            return actionError("Failed to retrieve created static page");
        }

        return actionSuccess(created[0]);
    } catch (error) {
        console.error("Create static page error:", error);
        return serverError(error, "create static page");
    }
}

/**
 * Admin action: Update a static page.
 */
export async function updateStaticPage(id: number, data: {
    slug?: string;
    title?: string;
    content?: string;
    isPublished?: boolean;
    showInNav?: boolean;
    navLabel?: string | null;
    navOrder?: number;
}): Promise<ActionResponse<StaticPage>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }

        const existingRows = await db.select().from(staticPages).where(eq(staticPages.id, id)).limit(1);
        if (!existingRows.length || !existingRows[0]) {
            return actionError("Static page not found");
        }
        const existing = existingRows[0];

        let slug = existing.slug;
        if (data.slug) {
            const cleanSlug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
            if (cleanSlug && cleanSlug !== existing.slug) {
                const dupCheck = await db.select().from(staticPages).where(eq(staticPages.slug, cleanSlug)).limit(1);
                if (dupCheck.length > 0) {
                    return actionError(`Slug '${cleanSlug}' is already in use by another page.`);
                }
                slug = cleanSlug;
            }
        }

        const title = data.title !== undefined ? data.title.trim() : existing.title;
        const content = data.content !== undefined ? data.content.trim() : existing.content;

        if (!title) {
            return actionError("Page title cannot be empty");
        }
        if (!content) {
            return actionError("Page content cannot be empty");
        }

        await db.update(staticPages)
            .set({
                slug,
                title,
                content,
                isPublished: data.isPublished !== undefined ? data.isPublished : existing.isPublished,
                showInNav: data.showInNav !== undefined ? data.showInNav : existing.showInNav,
                navLabel: data.navLabel !== undefined ? (data.navLabel?.trim() || null) : existing.navLabel,
                navOrder: data.navOrder !== undefined ? data.navOrder : existing.navOrder,
                updatedAt: new Date(),
            })
            .where(eq(staticPages.id, id));

        const updatedRows = await db.select().from(staticPages).where(eq(staticPages.id, id)).limit(1);

        revalidatePath(`/pages/${slug}`);
        if (slug !== existing.slug) {
            revalidatePath(`/pages/${existing.slug}`);
        }
        revalidatePath("/admin/pages");

        if (!updatedRows.length || !updatedRows[0]) {
            return actionError("Failed to retrieve updated static page");
        }

        return actionSuccess(updatedRows[0]);
    } catch (error) {
        console.error("Update static page error:", error);
        return serverError(error, "update static page");
    }
}

/**
 * Admin action: Delete a static page.
 */
export async function deleteStaticPage(id: number): Promise<ActionResponse<{ id: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }

        const existingRows = await db.select().from(staticPages).where(eq(staticPages.id, id)).limit(1);
        if (existingRows.length && existingRows[0]) {
            revalidatePath(`/pages/${existingRows[0].slug}`);
        }

        await db.delete(staticPages).where(eq(staticPages.id, id));
        revalidatePath("/admin/pages");

        return actionSuccess({ id });
    } catch (error) {
        console.error("Delete static page error:", error);
        return serverError(error, "delete static page");
    }
}
