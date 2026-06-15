# IJITEST Automated Cron Jobs Directory

This document lists all automated cron endpoints exposed in the IJITEST application, their purposes, URL paths, file locations, and recommended trigger frequencies.

---

## 🔒 Security & Authentication

All cron endpoints are secured using a Bearer token verification. When calling any endpoint, you must supply the `CRON_SECRET` configured in your environment variables.

- **Request Method**: `GET`
- **Required Header**: `Authorization: Bearer <CRON_SECRET>`

---

## 📅 Cron Jobs Index

| Endpoint Route | Target File | Purpose | Recommended Schedule |
| :--- | :--- | :--- | :--- |
| `/api/cron/review-reminders` | `src/app/api/cron/review-reminders/route.ts` | Dispatches reviewer reminders & editor escalations | **Daily** (once a day) |
| `/api/cron/cleanup-authors` | `src/app/api/cron/cleanup-authors/route.ts` | Deletes inactive author accounts (>28 days since decision) | **Daily** (e.g. at 02:00 UTC) |
| `/api/cron/cleanup` | `src/app/api/cron/cleanup/route.ts` | Deletes stale submissions, files, and orphan authors | **Daily** or **Weekly** |
| `/api/cron/cleanup-chats` | `src/app/api/cron/cleanup-chats/route.ts` | Prunes chat message logs older than 2 months | **Monthly** |

---

## 🔍 Detailed Cron Job Descriptions

### 1. Peer Review Deadline Reminders
* **Route**: `/api/cron/review-reminders`
* **File Location**: `ijitest/src/app/api/cron/review-reminders/route.ts`
* **Target Actions**: `processReviewReminders()` (`src/lib/review-reminders.ts`)
* **Frequency**: **Daily**
* **Detailed Behavior**:
  - Scans active review assignments (status is `assigned` or `accepted`) on papers that are in an active review stage (`submitted`, `editorAssigned`, `underReview`, `revisionRequested`).
  - Sends a gentle reminder to the reviewer **3 days before**, **1 day before**, and **on the day of the deadline**.
  - Sends overdue reminders to the reviewer **every 3 days** after the deadline.
  - Escalates to the assigning Editor/Admin **3 days** and **7 days** after a deadline passes.
  - Logs notification status in the DB and prevents sending duplicate reminders on the same day.

### 2. Inactive Author Cleanup
* **Route**: `/api/cron/cleanup-authors`
* **File Location**: `ijitest/src/app/api/cron/cleanup-authors/route.ts`
* **Target Actions**: `cleanupInactiveAuthors()` (`src/lib/cleanup.ts`)
* **Frequency**: **Daily (recommended at 02:00 UTC)**
* **Detailed Behavior**:
  - Finds authors whose only submissions are older than 28 days and have been rejected or requested for revision.
  - Safely deletes associated files from disk/storage service.
  - Removes the submissions and deletes the author's account if no active papers remain.

### 3. Stale Submission and Orphan Author Cleanup
* **Route**: `/api/cron/cleanup`
* **File Location**: `ijitest/src/app/api/cron/cleanup/route.ts`
* **Frequency**: **Daily** / **Weekly**
* **Detailed Behavior**:
  - Hard-deletes rejected or revision-requested submissions that haven't been updated for more than 28 days.
  - Removes all versions, files from storage, and cascades DB deletion.
  - Safely cleans up authors who have zero submissions left after this purge.

### 4. Chat History Pruning
* **Route**: `/api/cron/cleanup-chats`
* **File Location**: `ijitest/src/app/api/cron/cleanup-chats/route.ts`
* **Frequency**: **Monthly**
* **Detailed Behavior**:
  - Deletes all chat message records in the database where `createdAt` is older than 2 months to optimize table size and performance.
