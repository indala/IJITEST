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

- [x] **1.1 Google Scholar Highwire Press Meta Tags** `[P0]`
  - [x] Add `<meta name="gs_meta_revision" content="1.1" />` standard revision tag
  - [x] Add `<meta name="citation_journal_title" />` and `<meta name="citation_journal_abbrev" />`
  - [x] Add `<meta name="citation_publisher" />` from settings
  - [x] Add `<meta name="citation_author" />` for primary and all co-authors
  - [x] Add `<meta name="citation_author_institution" />` for every author's institution
  - [x] Add `<meta name="citation_author_orcid" />` when author ORCID is present
  - [x] Add `<meta name="citation_publication_date" />` in `YYYY/MM/DD` format
  - [x] Add `<meta name="citation_volume" />`, `<meta name="citation_issue" />`, `<meta name="citation_firstpage" />`, `<meta name="citation_lastpage" />`
  - [x] Add `<meta name="citation_doi" />`
  - [x] Add `<meta name="citation_pdf_url" />` (direct link to full-text PDF)
  - [x] Add `<meta name="citation_abstract_html_url" />` (canonical abstract page)
  - [x] Add `<meta name="citation_keywords" />` parsed per keyword item
  - *Target File*: `IJITEST/src/app/(main)/archives/[volume]/[issue]/[paperId]/page.tsx`

- [x] **1.2 Dublin Core (DC) Metadata Expansion** `[P0]`
  - [x] Add `dc.title`, `dc.creator`, `dc.date`, `dc.subject`, `dc.description`
  - [x] Add `dc.publisher`, `dc.rights` (Creative Commons CC-BY 4.0 license url)
  - [x] Add `dc.format` (`text/html` and `application/pdf`)
  - [x] Add `dc.source` (Journal title & ISSN)
  - [x] Add `dc.type` (`Text.Serial.Journal`, `Research Article`)
  - *Target File*: `IJITEST/src/app/(main)/archives/[volume]/[issue]/[paperId]/page.tsx`

- [x] **1.3 Multi-Format Academic Citation Suite** `[P0]`
  - [x] **APA 7th Edition** formatted citation string
  - [x] **IEEE Style** formatted citation string
  - [x] **Harvard Style** formatted citation string
  - [x] **MLA 9th Edition** formatted citation string
  - [x] **Chicago 17th Edition (Author-Date)** formatted citation string
  - [x] **BibTeX** format with accurate keys, authors, volume, issue, pages, DOI, and URL
  - [x] One-click copy for each citation format with visual toast confirmation
  - [x] Direct download `.bib` file for LaTeX / Overleaf users (`[paperId].bib`)
  - [x] Direct download `.ris` file for Zotero, Mendeley, and EndNote users (`[paperId].ris`)
  - *Target File*: `IJITEST/src/features/archives/components/CitationSection.tsx`

- [x] **1.4 Scholarly XML Sitemap & Crawler Endpoints** `[P1]`
  - [x] Include all published volume/issue URLs with `lastmod` timestamps
  - [x] Include direct PDF links in sitemap with image/publication extensions
  - *Target File*: `IJITEST/src/app/sitemap.ts`

---

## 🌐 Phase 2: Global Indexing Protocols & Repositories (CrossRef, OAI-PMH, DOAJ)
> **Target**: Automate interoperability with international library indexes, DOI registrars, and scholarly repositories.
> **OJS Source**: `plugins/generic/crossref/`, `plugins/oaiMetadataFormats/`, `plugins/importexport/doaj/`

- [x] **2.0 Selective DOI Policy & Prefix Configuration (`10.68139`)** `[P0]`
  - [x] Configure CrossRef official prefix `10.68139` in Admin Settings
  - [x] Implement selective DOI assignment policy (`manual` vs `auto`) — eliminate destructive automatic overwrite on all papers
  - [x] Support 3 DOI modes per paper: No DOI (unassigned), Official CrossRef (`10.68139/{paperId}`), and Custom / Zenodo (`10.5281/zenodo....`)
  - [x] Add DOI management modal (`EditDoiModal`) in Editor/Admin paper detail view for post-publication assignment, modification, or removal
  - [x] Integrate with storage PDF branding pipeline (re-brand on update, clean unbranded layout when DOI is null)
  - *Target Files*: `IJITEST/src/actions/settings.ts`, `IJITEST/src/actions/publications.ts`, `IJITEST/src/features/submissions/components/EditDoiModal.tsx`

- [x] **2.1 CrossRef DOI Metadata XML Generator** `[P0]`
  - [x] Create CrossRef Schema 4.4.2 / 5.3.1 XML serializer
  - [x] Implement `<journal_metadata>` (full title, abbrev, ISSN, DOI prefix)
  - [x] Implement `<journal_issue>` (volume, issue, publication date)
  - [x] Implement `<journal_article>` (title, authors with given/surname, affiliations, ORCIDs, abstract, publication date, pages, DOI, resource URL)
  - [x] Create API route: `GET /api/export/crossref/[paperId]` (single article XML export)
  - [x] Create API route: `GET /api/export/crossref/issue/[issueId]` (batch issue deposit XML export)
  - [x] Add "Download CrossRef XML" button in Admin & Editor panel
  - *Target Files*: `IJITEST/src/lib/crossref-generator.ts`, `IJITEST/src/app/api/export/crossref/[paperId]/route.ts`, `IJITEST/src/app/api/export/crossref/issue/[issueId]/route.ts`

- [x] **2.2 OAI-PMH 2.0 Repository Server (`/api/oai`)** `[P0]`
  - [x] Implement standard XML response envelope with OAI request attributes and datestamp
  - [x] Implement **`Identify`** verb (Repository Name, Base URL, Protocol Version, Admin Email, Earliest Datestamp, DeletedRecord policy, Granularity)
  - [x] Implement **`ListMetadataFormats`** verb (support `oai_dc` Dublin Core)
  - [x] Implement **`ListSets`** verb (volumes and issues as OAI sets, e.g. `vol1:issue1`)
  - [x] Implement **`ListIdentifiers`** verb (supports `from`, `until`, `set`, and `resumptionToken` pagination)
  - [x] Implement **`ListRecords`** verb (full Dublin Core metadata records for all published articles)
  - [x] Implement **`GetRecord`** verb (fetch single article record by `oai:ijitest.org:article/[paperId]`)
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

- [x] **3.1 Multi-Round Review System (Rounds 1, 2, 3)** `[P1]`
  - [x] Add `reviewRound: int("review_round").default(1)` to `reviewAssignments` in schema
  - [x] Multi-round duplicate checking: allow reviewers to be reassigned to Round $N+1$ without collision
  - [x] Round-specific tracking for review assignments and submission versions
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/actions/reviews.ts`

- [x] **3.2 Structured Evaluation Rubric (Scoring Matrix)** `[P1]`
  - [x] Define standardized rubric schema:
    - *Originality & Novelty* (Score 1–5 + remarks)
    - *Technical Depth & Methodology* (Score 1–5 + remarks)
    - *Clarity & Organization* (Score 1–5 + remarks)
    - *Literature Review & References* (Score 1–5 + remarks)
  - [x] Separate reviewer inputs:
    - **Confidential Remarks to Editor** (hidden from author)
    - **Constructive Comments to Author** (sent with decision letter)
  - [x] Overall Recommendation Enum: `Accept`, `Minor Revisions`, `Major Revisions`, `Reject`
  - [x] Add review rubric UI form in Reviewer Dashboard with autosave/draft support
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/features/reviews/components/ReviewItemCard.tsx`

- [x] **3.3 Automated Reviewer Conflict of Interest (COI) Detector** `[P1]`
  - [x] In reviewer assignment: automatically cross-check candidate reviewer `institute` with lead author & all co-authors' `institution`
  - [x] Flag warning / block conflict: `Conflict of Interest Detected: Reviewer belongs to the same institution as author`
  - *Target File*: `IJITEST/src/actions/reviews.ts`

- [x] **3.4 Double-Blind Manuscript Anonymization Separation** `[P1]`
  - [x] Added `'blindedManuscript'`, `'titlePage'`, `'rebuttalLetter'` to `submissionFiles.fileType` enum
  - [x] Prioritize `blindedManuscript` over `mainManuscript` during reviewer assignment and PDF conversion to eliminate author bias
  - [x] Display blinded manuscript indicator badges in reviewer assignment modals
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/actions/reviews.ts`, `IJITEST/src/actions/submissions.ts`, `IJITEST/src/features/reviews/components/AssignReviewerDialog.tsx`

- [x] **3.5 Secure 1-Click Reviewer Invitation & Token Access** `[P1]`
  - [x] Review invitation contains unique cryptographic tokens for 1-click Accept / Decline
  - [x] Public token handler endpoint (`/review/invitation/[token]`) with optional decline reason
  - [x] No mandatory password login needed just to accept/decline an invite
  - *Target Files*: `IJITEST/src/app/(auth)/review/invitation/[token]/page.tsx`, `IJITEST/src/actions/reviews.ts`

- [x] **3.6 Reviewer Performance & Rating Tracker** `[P2]`
  - [x] Added `editorRating` (1–5 stars), `editorRatingRemarks`, and `ratedAt` to `reviews` schema
  - [x] Created `rateReview(assignmentId, rating, remarks)` server action
  - [x] Added interactive 5-star editor evaluation widget to `ReviewItemCard.tsx`
  - [x] Calculate aggregate reviewer metrics (completed reviews, average rating, turnaround time) via `getReviewerMetrics()`
  - [x] Display performance badges (e.g., `⭐ 4.8 (6 rev)`) in `AssignReviewerDialog.tsx`
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/actions/reviews.ts`, `IJITEST/src/features/reviews/components/ReviewItemCard.tsx`, `IJITEST/src/features/reviews/components/AssignReviewerDialog.tsx`

---

## 👥 Phase 4: Contributor Transparency & Author Experience
> **Target**: Modernize authorship standards, ORCID profiles, and author revision rebuttal workflows.
> **OJS Source**: `plugins/generic/credit/`, `plugins/generic/orcidProfile/`

- [x] **4.1 CRediT (Contributor Roles Taxonomy) Support** `[P1]`
  - [x] Store standardized contributor roles in `submission_authors` table (`creditRoles: json`)
  - [x] Standardized 14 NISO CRediT taxonomy roles defined in `src/db/types.ts`
  - [x] Collect CRediT roles in `submitPaper` for lead and co-authors
  - [x] Render dedicated "Author Contributions (CRediT Statement)" section on published article page
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/db/types.ts`, `IJITEST/src/actions/submit-paper.ts`, `IJITEST/src/features/archives/components/PaperDetailClient.tsx`

- [x] **4.2 ORCID iD Integration & Verification** `[P1]`
  - [x] Add `orcidId: varchar(50)` to `submissionAuthors` and ensure synchronized with `userProfiles`
  - [x] Embed official green ORCID icon + verified link to `https://orcid.org/{orcidId}` next to author names on article page
  - [x] Include `citation_author_orcid` Highwire Press meta tags in article SSR headers
  - [x] Included ORCID iD in CrossRef XML metadata schema exports
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/features/archives/components/PaperDetailClient.tsx`, `IJITEST/src/app/(main)/archives/[volume]/[issue]/[paperId]/page.tsx`

- [x] **4.3 Point-by-Point Author Rebuttal Letter** `[P1]`
  - [x] Added `rebuttalLetter: text("rebuttal_letter")` to `submissionVersions` table in schema
  - [x] Resubmission pipeline (`resubmitPaper`) accepts point-by-point rebuttal letter, separate rebuttal letter document, and optional blinded manuscript
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/actions/author-submissions.ts`

- [x] **4.4 Plagiarism & Similarity Report Tracking** `[P1]` *(💡 Suggestion)*
  - [x] Added `similarityPercentage: int` and `similarityReportUrl: varchar` to `submissionVersions` in `src/db/schema.ts`
  - [x] Editor can input plagiarism score and upload Turnitin/iThenticate report via `recordSimilarityScore` server action in `src/actions/submissions.ts`
  - [x] Color-coded badges in Editor dashboard (<10% Green, 10-20% Amber, >20% Red)
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/actions/submissions.ts`

- [x] **4.5 Conflict of Interest & Ethics Declarations** `[P2]`
  - [x] Database schema support for `competingInterests`, `fundingStatement`, `ethicalApproval` in `submissionVersions`
  - [x] Explicit checkboxes and text fields captured during submission in `src/actions/submit-paper.ts`
  - [x] Rendered under dedicated "Declarations & Ethics" block on published article page in `PaperDetailClient.tsx`
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/actions/submit-paper.ts`, `IJITEST/src/features/archives/components/PaperDetailClient.tsx`

---

## 🖨️ Phase 5: Production, Galley Proofing & Automated PDF Pipeline
> **Target**: Utilize both servers (`storage-service` + `IJITEST`) to automate professional typesetting and author proofs.
> **OJS Source**: `classes/article/Galley/`, `plugins/generic/pdfJsViewer/`

- [x] **5.1 Automated PDF Header Banner Stamping (`storage-service`)** `[P1]`
  - [x] In `storage-service` (`src/process`): Use `pdf-lib` to stamp a standard scholarly header on every published PDF page:
    - Journal Name & ISSN (Online)
    - Volume, Issue, Month & Year
    - Official DOI link & Paper ID with clickable PDF URI annotations
    - Open Access CC-BY 4.0 license notice
  - [x] Stamp publication timeline in footer: *Received \| Revised \| Accepted \| Published*
  - *Target Files*: `storage-service/src/process/process.service.ts`, `storage-service/src/process/process.controller.ts`

- [x] **5.2 Dynamic Publication Certificate & Acceptance Letter Generator** `[P1]`
  - [x] Generated high-resolution vector PDF certificate of publication with recipient author names, paper title, volume, issue, year, ISSN, and official CrossRef prefix (`10.68139`) using `pdf-lib` via `src/lib/certificate-generator.ts`
  - [x] Downloadable endpoint created at `/api/certificate/[paperId]` and direct "Download Certificate (PDF)" card embedded in `PaperDetailClient.tsx`
  - *Target Files*: `IJITEST/src/lib/certificate-generator.ts`, `IJITEST/src/app/api/certificate/[paperId]/route.ts`, `IJITEST/src/features/archives/components/PaperDetailClient.tsx`

- [x] **5.3 Galley Proofing Approval Stage** `[P2]`
  - [x] Added `galleyStatus`, `galleyApprovedAt`, `galleyCorrectionsNote` to `submissions` in `src/db/schema.ts`
  - [x] Created `requestGalleyApproval` and `respondToGalleyProof` server actions with in-app notifications
  - [x] Author can review galley proof, approve, or submit typographical corrections before final publication
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/actions/submissions.ts`

- [x] **5.4 Complete Issue "Full-Book" PDF & TOC Generator (`storage-service`)** `[P2]` *(💡 Suggestion)*
  - [x] Created `generateIssueBook` in `storage-service/src/process/process.service.ts` and `POST /process/issue-book` in `process.controller.ts`
  - [x] Automatically generates official Table of Contents (TOC) page with journal header, Volume/Issue details, article titles, author names, page numbers, and DOIs
  - [x] Merges all published PDFs in the issue in page sequence into a single unified publication issue book
  - [x] Created `generateCompleteIssueBook` server action in `IJITEST/src/actions/publications.ts` updating `volumesIssues.fullBookPdfUrl` and added download card to public issue archives page
  - *Target Files*: `storage-service/src/process/process.service.ts`, `storage-service/src/process/process.controller.ts`, `IJITEST/src/actions/publications.ts`, `IJITEST/src/app/(main)/archives/[volume]/[issue]/page.tsx`

- [x] **5.5 Supplementary Files Management** `[P2]`
  - [x] Support storing and querying accompanying data files with `fileType === 'supplementary'` in `submissionFiles`
  - [x] Publicly downloadable in the archives page under "Supplementary Materials" with file size badges in `PaperDetailClient.tsx`
  - *Target Files*: `IJITEST/src/actions/archives.ts`, `IJITEST/src/features/archives/components/PaperDetailClient.tsx`

---

## 📊 Phase 6: Journal Governance, COUNTER Metrics & System Settings
> **Target**: Implement international journal transparency, anti-spam metrics, editable email templates, and retraction standards.
> **OJS Source**: `plugins/reports/`, `classes/statistics/`, `schemas/emailtemplate.json`

- [x] **6.1 Customizable Email Template System** `[P1]` *(💡 Suggestion)*
  - [x] Added `emailTemplates` database table in `src/db/schema.ts` with default seed templates for 7 key events
  - [x] Admin Settings page: interactive `EmailTemplatesManager.tsx` allowing editing of subjects and bodies with placeholder variables:
    - `{{authorName}}`, `{{paperTitle}}`, `{{paperId}}`, `{{reviewDeadline}}`, `{{editorialFeedback}}`, `{{trackUrl}}`, etc.
  - [x] Live Preview toggle displaying real-time rendered simulation with sample scholarly metadata
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/actions/email-templates.ts`, `IJITEST/src/app/(panel)/admin/settings/EmailTemplatesManager.tsx`, `IJITEST/src/app/(panel)/admin/settings/page.tsx`

- [x] **6.2 Bot-Filtered Article Analytics (COUNTER Standard)** `[P2]`
  - [x] Created `src/lib/bot-detector.ts` implementing Project COUNTER Release 5 compliance filtering search engine crawlers, academic indexers, scrapers, and headless scripts
  - [x] Integrated into `incrementPaperViews` and `incrementPaperDownloads` in `src/actions/publications.ts`
  - [x] Transparent and clean view/download counters on article landing pages
  - *Target Files*: `IJITEST/src/lib/bot-detector.ts`, `IJITEST/src/actions/publications.ts`

- [x] **6.3 Retraction, Corrigendum & Erratum Notices** `[P2]`
  - [x] Added `'corrigendum'` to `submissions.status` enum, and added `retractionReason`, `retractionNoticeUrl`, `retractedAt` to schema
  - [x] Created `retractPaper` and `issueCorrigendum` server actions in `src/actions/submissions.ts`
  - [x] Prominent red retraction banner on retracted articles and amber notice on corrigenda in `PaperDetailClient.tsx`
  - *Target Files*: `IJITEST/src/db/schema.ts`, `IJITEST/src/actions/submissions.ts`, `IJITEST/src/features/archives/components/PaperDetailClient.tsx`

- [x] **6.4 Automated APC Invoicing & Receipt Generation** `[P2]`
  - [x] Added `invoiceNumber` column to `payments` schema and auto-assigned sequentially (`INV-YYYY-XXXXX`)
  - [x] High-resolution vector PDF Tax Invoice and Payment Receipt generator built with `pdf-lib` in `src/lib/invoice-generator.ts` with itemized APC breakdown, GST/tax calculation, and computer-generated verification seal
  - [x] Secure download endpoint at `GET /api/receipt/[paymentId]` with role and ownership access control
  - [x] Direct "Download Tax Invoice & Receipt (PDF)" action buttons integrated into Author Submission Detail dashboard and Admin Payment Management console
  - *Target Files*: `IJITEST/src/lib/invoice-generator.ts`, `IJITEST/src/app/api/receipt/[paymentId]/route.ts`, `IJITEST/src/actions/payments.ts`, `IJITEST/src/app/(panel)/author/submissions/[id]/page.tsx`, `IJITEST/src/app/(panel)/admin/payments/page.tsx`

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
