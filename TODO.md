# IJITEST Master Roadmap: OJS Feature Extraction & Modernization

> **Objective**: Systematically extract domain specifications, scholarly indexing protocols, editorial workflows, and publishing standards from **OJS 3.5.0-5** (`C:\Users\admin\Downloads\ojs-3.5.0-5`) and implement them natively in **IJITEST** (`d:/lab2/IJITEST` - Next.js 16) and **storage-service** (`d:/lab2/storage-service` - NestJS + Fastify).

---

## 🏛️ Architecture & Division of Responsibility

| Component | Stack | Responsibilities |
| :--- | :--- | :--- |
| **IJITEST** | Next.js 16, React 19, TypeScript, Drizzle ORM | Frontend, Dashboards, Business Logic, Indexing Metadata, OAI-PMH, CrossRef XML |
| **storage-service** | NestJS 12, Fastify, `pdf-lib`, Socket.io | 50MB file uploads, PDF watermark/header stamping, Certificate generation, Real-time chat |
| **OJS 3.5 (Ref)** | PHP 8.2, PKP Framework | Reference specifications, XML schemas, workflow state machines, metadata standards |

---

## 🚀 Phase 1: Academic Visibility, Google Scholar & Multi-Format Citation Engine
> **Target**: Ensure every published article is immediately discovered, indexed, and cited by Google Scholar, Scopus crawlers, and reference managers.
> **OJS Source**: `plugins/generic/googleScholar/`, `plugins/generic/citationStyleLanguage/`

- [ ] **1.1 Google Scholar Highwire Press Meta Tags** `[P0]`
  - [ ] Add `<meta name="gs_meta_revision" content="1.1" />` standard revision tag
  - [ ] Add `<meta name="citation_journal_title" />` and `<meta name="citation_journal_abbrev" />`
  - [ ] Add `<meta name="citation_publisher" />` from settings
  - [ ] Add `<meta name="citation_author" />` for primary and all co-authors
  - [ ] Add `<meta name="citation_author_institution" />` for every author's institution
  - [ ] Add `<meta name="citation_author_orcid" />` when author ORCID is present
  - [ ] Add `<meta name="citation_publication_date" />` in `YYYY/MM/DD` format
  - [ ] Add `<meta name="citation_volume" />`, `<meta name="citation_issue" />`, `<meta name="citation_firstpage" />`, `<meta name="citation_lastpage" />`
  - [ ] Add `<meta name="citation_doi" />`
  - [ ] Add `<meta name="citation_pdf_url" />` (direct link to full-text PDF)
  - [ ] Add `<meta name="citation_abstract_html_url" />` (canonical abstract page)
  - [ ] Add `<meta name="citation_keywords" />` parsed per keyword item
  - *Target File*: `IJITEST/src/app/(main)/archives/[volume]/[issue]/[paperId]/page.tsx`

- [ ] **1.2 Dublin Core (DC) Metadata Expansion** `[P0]`
  - [ ] Add `dc.title`, `dc.creator`, `dc.date`, `dc.subject`, `dc.description`
  - [ ] Add `dc.publisher`, `dc.rights` (Creative Commons CC-BY 4.0 license url)
  - [ ] Add `dc.format` (`text/html` and `application/pdf`)
  - [ ] Add `dc.source` (Journal title & ISSN)
  - [ ] Add `dc.type` (`Text.Serial.Journal`, `Research Article`)
  - *Target File*: `IJITEST/src/app/(main)/archives/[volume]/[issue]/[paperId]/page.tsx`

- [ ] **1.3 Multi-Format Academic Citation Suite** `[P0]`
  - [ ] **APA 7th Edition** formatted citation string
  - [ ] **IEEE Style** formatted citation string
  - [ ] **Harvard Style** formatted citation string
  - [ ] **MLA 9th Edition** formatted citation string
  - [ ] **Chicago 17th Edition (Author-Date)** formatted citation string
  - [ ] **BibTeX** format with accurate keys, authors, volume, issue, pages, DOI, and URL
  - [ ] One-click copy for each citation format with visual toast confirmation
  - [ ] Direct download `.bib` file for LaTeX / Overleaf users (`[paperId].bib`)
  - [ ] Direct download `.ris` file for Zotero, Mendeley, and EndNote users (`[paperId].ris`)
  - *Target File*: `IJITEST/src/features/archives/components/CitationSection.tsx`

- [ ] **1.4 Scholarly XML Sitemap & Crawler Endpoints** `[P1]`
  - [ ] Include all published volume/issue URLs with `lastmod` timestamps
  - [ ] Include direct PDF links in sitemap with image/publication extensions
  - *Target File*: `IJITEST/src/app/sitemap.ts`

---

## 🌐 Phase 2: Global Indexing Protocols & Repositories (CrossRef, OAI-PMH, DOAJ)
> **Target**: Automate interoperability with international library indexes, DOI registrars, and scholarly repositories.
> **OJS Source**: `plugins/generic/crossref/`, `plugins/oaiMetadataFormats/`, `plugins/importexport/doaj/`

- [ ] **2.1 CrossRef DOI Metadata XML Generator** `[P0]`
  - [ ] Create CrossRef Schema 4.4.2 / 5.3.1 XML serializer
  - [ ] Implement `<journal_metadata>` (full title, abbrev, ISSN, DOI prefix)
  - [ ] Implement `<journal_issue>` (volume, issue, publication date)
  - [ ] Implement `<journal_article>` (title, authors with given/surname, affiliations, ORCIDs, abstract, publication date, pages, DOI, resource URL)
  - [ ] Create API route: `GET /api/export/crossref/[paperId]` (single article XML export)
  - [ ] Create API route: `GET /api/export/crossref/issue/[issueId]` (batch issue deposit XML export)
  - [ ] Add "Download CrossRef XML" button in Admin & Editor panel
  - [ ] *(Optional)* Add automated CrossRef REST API deposit using journal CrossRef credentials
  - *Target Files*: `IJITEST/src/lib/crossref-generator.ts`, `IJITEST/src/app/api/export/crossref/[paperId]/route.ts`

- [ ] **2.2 OAI-PMH 2.0 Repository Server (`/api/oai`)** `[P0]`
  - [ ] Implement standard XML response envelope with OAI request attributes and datestamp
  - [ ] Implement **`Identify`** verb (Repository Name, Base URL, Protocol Version, Admin Email, Earliest Datestamp, DeletedRecord policy, Granularity)
  - [ ] Implement **`ListMetadataFormats`** verb (support `oai_dc` Dublin Core)
  - [ ] Implement **`ListSets`** verb (volumes and issues as OAI sets, e.g. `vol1:issue1`)
  - [ ] Implement **`ListIdentifiers`** verb (supports `from`, `until`, `set`, and `resumptionToken` pagination)
  - [ ] Implement **`ListRecords`** verb (full Dublin Core metadata records for all published articles)
  - [ ] Implement **`GetRecord`** verb (fetch single article record by `oai:ijitest.org:[paperId]`)
  - [ ] Test compliance with OAI-PMH Validator (Open Archives Initiative compliance)
  - *Target Files*: `IJITEST/src/app/api/oai/route.ts`, `IJITEST/src/lib/oai-pmh.ts`

- [ ] **2.3 CrossMark Metadata Integration** `[P1]` *(💡 Suggestion)*
  - [ ] Embed official CrossMark metadata headers for update checks
  - [ ] Add "Check for updates" CrossMark badge on article pages
  - *Target File*: `IJITEST/src/app/(main)/archives/[volume]/[issue]/[paperId]/page.tsx`

- [ ] **2.4 DOAJ (Directory of Open Access Journals) XML Exporter** `[P1]`
  - [ ] Implement DOAJ 0.2 JSON/XML format for accepted articles
  - [ ] Create export endpoint `/api/export/doaj/[issueId]`
  - *Target Files*: `IJITEST/src/app/api/export/doaj/route.ts`

---

## 📝 Phase 3: Structured Peer Review & Editorial Workflow Upgrade
> **Target**: Move from simple text comments to OJS-grade structured rubrics, multi-round tracking, and reviewer management.
> **OJS Source**: `classes/submission/reviewAssignment/`, `schemas/reviewForm.json`, `classes/submission/reviewRound/`

- [ ] **3.1 Multi-Round Review System (Rounds 1, 2, 3)** `[P1]`
  - [ ] Add `round: int("round").default(1)` to `reviewAssignments` and `submissionVersions` in schema
  - [ ] When an Editor requests revision, automatically create Round $N+1$
  - [ ] Allow Editor to re-assign original reviewers to the revision with 1 click
  - [ ] Maintain separate review comments and scores for each round
  - [ ] Visual revision timeline for Editors showing Round 1 $\rightarrow$ Revision 1 $\rightarrow$ Round 2
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/actions/reviews.ts`, `IJITEST/src/app/(panel)/editor/submissions/[id]/page.tsx`

- [ ] **3.2 Structured Evaluation Rubric (Scoring Matrix)** `[P1]`
  - [ ] Define standardized rubric schema:
    - *Originality & Novelty* (Score 1–5 + remarks)
    - *Technical Depth & Methodology* (Score 1–5 + remarks)
    - *Clarity & Organization* (Score 1–5 + remarks)
    - *Literature Review & References* (Score 1–5 + remarks)
  - [ ] Separate reviewer inputs:
    - **Confidential Remarks to Editor** (hidden from author)
    - **Constructive Comments to Author** (sent with decision letter)
  - [ ] Overall Recommendation Enum: `Accept`, `Minor Revisions`, `Major Revisions`, `Reject`
  - [ ] Add review rubric UI form in Reviewer Dashboard with autosave/draft support
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/features/reviews/components/ReviewSubmissionForm.tsx`

- [ ] **3.3 Automated Reviewer Conflict of Interest (COI) Detector** `[P1]` *(💡 Suggestion)*
  - [ ] In Editor reviewer-assignment modal: automatically cross-check candidate reviewer `institute` with author & co-authors' `institution`
  - [ ] Flag warning: `⚠️ Institutional Conflict: Reviewer belongs to the same institution as co-author`
  - *Target File*: `IJITEST/src/app/(panel)/editor/submissions/[id]/AssignReviewerModal.tsx`

- [ ] **3.4 Double-Blind Manuscript Anonymization Separation** `[P1]` *(💡 Suggestion)*
  - [ ] Separate manuscript files into **Title Page (with Author Details)** and **Blinded Manuscript (No author names/affiliations)**
  - [ ] Reviewers only get download access to the blinded manuscript to prevent bias
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/app/api/files/[...path]/route.ts`

- [ ] **3.5 Secure 1-Click Reviewer Invitation & Token Access** `[P1]`
  - [ ] Review invitation emails contain unique cryptographic tokens for:
    - `Accept Invitation` (marks assignment as accepted, sets due date)
    - `Decline Invitation` (marks assignment as declined, asks optional reason)
  - [ ] No mandatory password login needed just to accept/decline an invite
  - *Target Files*: `IJITEST/src/app/(auth)/review/invitation/[token]/page.tsx`, `IJITEST/src/actions/reviews.ts`

- [ ] **3.6 Reviewer Performance & Rating Tracker** `[P2]`
  - [ ] Editor can rate a completed review (1–5 stars) based on timeliness and thoroughness
  - [ ] Calculate reviewer metrics: average response time, completed reviews count, average rating
  - [ ] Display metrics in Editor reviewer-assignment modal to pick the most reliable reviewers
  - *Target Files*: `IJITEST/src/app/(panel)/editor/submissions/[id]/AssignReviewerModal.tsx`

---

## 👥 Phase 4: Contributor Transparency & Author Experience
> **Target**: Modernize authorship standards, ORCID profiles, and author revision rebuttal workflows.
> **OJS Source**: `plugins/generic/credit/`, `plugins/generic/orcidProfile/`

- [ ] **4.1 CRediT (Contributor Roles Taxonomy) Support** `[P1]`
  - [ ] Store standardized contributor roles in `submission_authors` table:
    - `Conceptualization`, `Data Curation`, `Formal Analysis`, `Funding Acquisition`
    - `Investigation`, `Methodology`, `Project Administration`, `Resources`
    - `Software`, `Supervision`, `Validation`, `Visualization`
    - `Writing – Original Draft`, `Writing – Review & Editing`
  - [ ] Author submission step: multi-select badge selector for co-authors' CRediT roles
  - [ ] Display CRediT contributor statement on published paper page
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/features/submissions/components/SubmissionContainer.tsx`

- [ ] **4.2 ORCID iD Integration & Verification** `[P1]`
  - [ ] Add `orcidId: varchar(50)` validation (format: `0000-0000-0000-0000`)
  - [ ] Embed official green ORCID icon with clickable link on published article pages
  - [ ] Include ORCID iD in Google Scholar and CrossRef XML exports
  - *Target Files*: `IJITEST/src/features/profile/components/ProfileForm.tsx`, `IJITEST/src/features/archives/components/PaperDetailClient.tsx`

- [ ] **4.3 Point-by-Point Author Rebuttal Letter** `[P1]`
  - [ ] When author submits revision, require:
    - Revised manuscript file (clean)
    - Highlighted / Tracked changes manuscript
    - Point-by-point response to reviewer comments (rebuttal letter)
  - [ ] Reviewers and Editors can view the response side-by-side with previous feedback
  - *Target Files*: `IJITEST/src/app/(panel)/author/submissions/[id]/RevisionUploadModal.tsx`

- [ ] **4.4 Plagiarism & Similarity Report Tracking** `[P1]` *(💡 Suggestion)*
  - [ ] Add `similarityPercentage: int` and `similarityReportUrl: varchar` to `submissionVersions`
  - [ ] Editor can input plagiarism score and upload Turnitin/iThenticate report
  - [ ] Color-coded badges in Editor dashboard (<10% Green, 10-20% Amber, >20% Red)
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/app/(panel)/editor/submissions/[id]/page.tsx`

- [ ] **4.5 Conflict of Interest & Ethics Declarations** `[P2]`
  - [ ] Explicit checkboxes during submission:
    - Conflict of interest declaration (or "No competing interests declared")
    - Funding statement / Grant number
    - Ethical approval confirmation (for human/animal subject research)
  - *Target Files*: `IJITEST/src/features/submissions/schemas/submission.schema.ts`

---

## 🖨️ Phase 5: Production, Galley Proofing & Automated PDF Pipeline
> **Target**: Utilize both servers (`storage-service` + `IJITEST`) to automate professional typesetting and author proofs.
> **OJS Source**: `classes/article/Galley/`, `plugins/generic/pdfJsViewer/`

- [ ] **5.1 Automated PDF Header Banner Stamping (`storage-service`)** `[P1]`
  - [ ] In `storage-service` (`src/process`): Use `pdf-lib` to stamp a standard scholarly header on every published PDF page:
    - Journal Name & ISSN (Online)
    - Volume, Issue, Month & Year
    - Official DOI link & Paper ID
    - Open Access CC-BY 4.0 license notice
  - [ ] Stamp publication timeline in footer: *Received: DD/MM/YYYY \| Revised: DD/MM/YYYY \| Accepted: DD/MM/YYYY \| Published: DD/MM/YYYY*
  - *Target Files*: `storage-service/src/process/process.service.ts`, `storage-service/src/process/process.controller.ts`

- [ ] **5.2 Dynamic Publication Certificate & Acceptance Letter Generator** `[P1]`
  - [ ] Generate high-resolution PDF certificate of publication with recipient author name, paper title, volume, issue, and verification QR code
  - [ ] Downloadable by author from Author Dashboard upon paper publication
  - *Target Files*: `storage-service/src/process/certificate.service.ts`

- [ ] **5.3 Galley Proofing Approval Stage** `[P2]`
  - [ ] Intermediate stage between `accepted` and `published`: `inProduction` / `proofReview`
  - [ ] Editor uploads final typeset PDF
  - [ ] Author receives notification to review and approve within 48 hours, or request typographical corrections
  - [ ] Author clicks "Approve Galley Proof" $\rightarrow$ Paper proceeds to scheduled publication
  - *Target Files*: `IJITEST/src/app/(panel)/editor/submissions/[id]/page.tsx`, `IJITEST/src/app/(panel)/author/submissions/[id]/page.tsx`

- [ ] **5.4 Complete Issue "Full-Book" PDF & TOC Generator (`storage-service`)** `[P2]` *(💡 Suggestion)*
  - [ ] Endpoint in `storage-service` to concatenate all published PDFs in an issue into one single volume book
  - [ ] Automatically generate an official Table of Contents (TOC) page with title, authors, and page numbers
  - *Target File*: `storage-service/src/process/issue-book.service.ts`

- [ ] **5.5 Supplementary Files Management** `[P2]`
  - [ ] Support uploading accompanying data: datasets (`.csv`, `.xlsx`), source code (`.zip`), supplementary appendices
  - [ ] Publicly downloadable in the archives page under "Supplementary Materials"
  - *Target Files*: `IJITEST/src/app/(main)/archives/[volume]/[issue]/[paperId]/page.tsx`

---

## 📊 Phase 6: Journal Governance, COUNTER Metrics & System Settings
> **Target**: Implement international journal transparency, anti-spam metrics, editable email templates, and retraction standards.
> **OJS Source**: `plugins/reports/`, `classes/statistics/`, `schemas/emailtemplate.json`

- [ ] **6.1 Customizable Email Template System** `[P1]` *(💡 Suggestion)*
  - [ ] In OJS, all emails are editable templates. In IJITEST, move hardcoded strings in `src/lib/mail.ts` into a database-backed template table
  - [ ] Admin Settings page: editable email subjects and body templates with placeholder variables:
    - `{{authorName}}`, `{{paperTitle}}`, `{{paperId}}`, `{{reviewDeadline}}`, `{{decisionNotes}}`, `{{paymentUrl}}`
  - [ ] Admin can preview email rendering in real time
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/app/(panel)/admin/settings/EmailTemplatesTab.tsx`, `IJITEST/src/lib/mail.ts`

- [ ] **6.2 Bot-Filtered Article Analytics (COUNTER Standard)** `[P2]`
  - [ ] Filter out crawlers, scrapers, and duplicate rapid clicks from view/download counters
  - [ ] Track monthly views and downloads per article
  - [ ] Display clean view/download badges on article landing pages
  - *Target Files*: `IJITEST/src/app/api/analytics/view/route.ts`, `IJITEST/src/lib/bot-detector.ts`

- [ ] **6.3 Retraction, Corrigendum & Erratum Notices** `[P2]`
  - [ ] Status support for `retracted` or `corrigendum`
  - [ ] Display prominent red retraction banner on retracted articles with reason and date
  - [ ] Maintain the original PDF with watermark "RETRACTED" across all pages (per COPE guidelines)
  - [ ] Link corrigendum notices directly to original publication
  - *Target Files*: `IJITEST/src/app/(main)/archives/[volume]/[issue]/[paperId]/page.tsx`

- [ ] **6.4 Automated APC Invoicing & Receipt Generation** `[P2]`
  - [ ] Upon successful Razorpay payment, automatically generate downloadable PDF tax invoice / receipt
  - [ ] Stored in Author Dashboard under "Payment Receipts"
  - *Target Files*: `IJITEST/src/actions/payments.ts`, `IJITEST/src/app/(panel)/author/payments/page.tsx`

---

## 📈 Execution Order & Milestones

```
Phase 1: Academic Visibility (Google Scholar + Citations)       ──▶ [P0 - Immediate]
Phase 2: Global Indexing (CrossRef XML + OAI-PMH 2.0 Server)    ──▶ [P0 - High Impact]
Phase 3: Structured Peer Review (Rubrics + Rounds + COI Alerts) ──▶ [P1 - Core Workflow]
Phase 4: Contributor Transparency (CRediT + ORCID + Plagiarism) ──▶ [P1 - Data Standards]
Phase 5: Production & PDF Stamping (storage-service Engine)     ──▶ [P1 - Typesetting]
Phase 6: Governance & Email Templates (Custom Mailer + COUNTER) ──▶ [P2 - Admin & Compliance]
```

---
*Updated for IJITEST on 2026-09-07 — Tracking feature extraction from OJS 3.5.0-5.*
