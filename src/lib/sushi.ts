import { db } from "@/lib/db";
import {
    usageStats,
    publications,
    submissions,
    submissionVersions,
    submissionAuthors
} from "@/db/schema";
import {
    type CounterR5Response,
    type CounterReportHeader,
    type CounterReportItem,
    type CounterPerformancePeriod,
    type CounterPerformanceInstance,
    type SushiStatusResponse,
    type SushiReportDefinition
} from "@/db/types";
import { getSettingsData } from "@/actions/settings";
import { eq, and, sql, desc, asc, inArray } from "drizzle-orm";

/**
 * COUNTER Release 5 Metric Enums
 */
const METRIC_MAP: Record<string, string> = {
    total_item_investigations: "Total_Item_Investigations",
    unique_item_investigations: "Unique_Item_Investigations",
    total_item_requests: "Total_Item_Requests",
    unique_item_requests: "Unique_Item_Requests",
};

/**
 * Format two-digit month
 */
function padMonth(m: number): string {
    return m < 10 ? `0${m}` : `${m}`;
}

/**
 * Get the last day of a given year and month
 */
function getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

/**
 * Return current SUSHI Service Status
 */
export async function getSushiStatus(): Promise<SushiStatusResponse> {
    const settings = await getSettingsData();
    const journalName = settings['journalName'] || "IJITEST";
    return {
        Description: `${journalName} COUNTER Release 5 SUSHI REST API Service`,
        Service_Active: true,
        Release: "5"
    };
}

/**
 * Return catalog of available SUSHI reports supported by IJITEST
 */
export function getSushiReports(): SushiReportDefinition[] {
    return [
        {
            Report_Name: "Title Master Report",
            Report_ID: "TR",
            Release: "5",
            Report_Description: "A customizable report presenting activity at the journal title level broken down by metric type and month.",
            Path: "reports/tr"
        },
        {
            Report_Name: "Journal Requests (Excl. OA_Gold)",
            Report_ID: "TR_J1",
            Release: "5",
            Report_Description: "Standard view of the Title Master Report presenting full-text article requests.",
            Path: "reports/tr_j1"
        },
        {
            Report_Name: "Item Master Report",
            Report_ID: "IR",
            Release: "5",
            Report_Description: "A customizable report presenting activity at the individual article item level with authors, DOI, and monthly metrics.",
            Path: "reports/ir"
        },
        {
            Report_Name: "Journal Article Requests",
            Report_ID: "IR_A1",
            Release: "5",
            Report_Description: "Standard view of the Item Master Report presenting monthly article usage requests.",
            Path: "reports/ir_a1"
        }
    ];
}

export interface ReportParams {
    begin_date?: string | undefined;
    end_date?: string | undefined;
    customer_id?: string | undefined;
    requestor_id?: string | undefined;
    item_id?: string | undefined;
    report_id?: "TR" | "TR_J1" | "IR" | "IR_A1" | undefined;
}

/**
 * Helper to parse begin_date and end_date
 */
function parseDateRange(begin?: string, end?: string) {
    const now = new Date();
    const currentYear = now.getFullYear();

    let startYear = currentYear;
    let startMonth = 1;
    if (begin) {
        const parts = begin.split("-");
        startYear = parseInt(parts[0] ?? `${currentYear}`, 10) || currentYear;
        startMonth = parseInt(parts[1] ?? "1", 10) || 1;
    }

    let finishYear = currentYear;
    let finishMonth = 12;
    if (end) {
        const parts = end.split("-");
        finishYear = parseInt(parts[0] ?? `${currentYear}`, 10) || currentYear;
        finishMonth = parseInt(parts[1] ?? "12", 10) || 12;
    }

    const beginDateStr = `${startYear}-${padMonth(startMonth)}-01`;
    const finishLastDay = getLastDayOfMonth(finishYear, finishMonth);
    const endDateStr = `${finishYear}-${padMonth(finishMonth)}-${finishLastDay < 10 ? '0' + finishLastDay : finishLastDay}`;

    return {
        startYear,
        startMonth,
        finishYear,
        finishMonth,
        beginDateStr,
        endDateStr
    };
}

/**
 * Generate Title Master Report (TR / TR_J1)
 */
export async function generateTitleReport(params: ReportParams): Promise<CounterR5Response> {
    const reportId = params.report_id || "TR";
    const settings = await getSettingsData();
    const journalName = settings['journalName'] || "International Journal of Innovative Trends in Engineering, Science and Technology";
    const platformName = settings['journalShortName'] || "IJITEST";
    const publisherName = settings['publisherName'] || "Felix Academic Publications";
    const issn = settings['issnNumber'] || "3139-6887";
    const customerId = params.customer_id || "0";
    const institutionName = customerId === "0" ? "The World" : `Subscriber ${customerId}`;

    const { startYear, startMonth, finishYear, finishMonth, beginDateStr, endDateStr } = parseDateRange(params.begin_date, params.end_date);

    const rows = await db.select({
        year: usageStats.year,
        month: usageStats.month,
        metricType: usageStats.metricType,
        totalCount: sql<number>`SUM(${usageStats.metricCount})`
    })
        .from(usageStats)
        .where(
            and(
                sql`(${usageStats.year} > ${startYear} OR (${usageStats.year} = ${startYear} AND ${usageStats.month} >= ${startMonth}))`,
                sql`(${usageStats.year} < ${finishYear} OR (${usageStats.year} = ${finishYear} AND ${usageStats.month} <= ${finishMonth}))`
            )
        )
        .groupBy(usageStats.year, usageStats.month, usageStats.metricType)
        .orderBy(asc(usageStats.year), asc(usageStats.month));

    const periodsMap = new Map<string, CounterPerformanceInstance[]>();

    for (const row of rows) {
        const counterMetricName = METRIC_MAP[row.metricType];
        if (!counterMetricName) continue;

        if (reportId === "TR_J1" && !counterMetricName.includes("Requests")) {
            continue;
        }

        const periodKey = `${row.year}-${padMonth(row.month)}`;
        if (!periodsMap.has(periodKey)) {
            periodsMap.set(periodKey, []);
        }
        periodsMap.get(periodKey)!.push({
            Metric_Type: counterMetricName,
            Count: Number(row.totalCount) || 0
        });
    }

    const performance: CounterPerformancePeriod[] = [];
    for (const [periodKey, instances] of periodsMap.entries()) {
        const [yStr, mStr] = periodKey.split("-");
        const y = Number(yStr) || startYear;
        const m = Number(mStr) || 1;
        const lastDay = getLastDayOfMonth(y, m);
        performance.push({
            Period: {
                Begin_Date: `${periodKey}-01`,
                End_Date: `${periodKey}-${lastDay < 10 ? '0' + lastDay : lastDay}`
            },
            Instance: instances
        });
    }

    const reportHeader: CounterReportHeader = {
        Created: new Date().toISOString(),
        Created_By: journalName,
        Customer_ID: customerId,
        Report_ID: reportId,
        Release: "5",
        Report_Name: reportId === "TR_J1" ? "Journal Requests (Excl. OA_Gold)" : "Title Master Report",
        Institution_Name: institutionName,
        Report_Filters: [
            { Name: "Begin_Date", Value: beginDateStr },
            { Name: "End_Date", Value: endDateStr }
        ]
    };

    const reportItem: CounterReportItem = {
        Title: journalName,
        Platform: platformName,
        Publisher: publisherName,
        Item_ID: [
            { Type: "Proprietary", Value: platformName.toLowerCase() },
            { Type: "Online_ISSN", Value: issn }
        ],
        Data_Type: "Journal",
        Section_Type: "Article",
        Performance: performance
    };

    return {
        Report_Header: reportHeader,
        Report_Items: [reportItem]
    };
}

/**
 * Generate Item Master Report (IR / IR_A1)
 */
export async function generateItemReport(params: ReportParams): Promise<CounterR5Response> {
    const reportId = params.report_id || "IR";
    const settings = await getSettingsData();
    const journalName = settings['journalName'] || "International Journal of Innovative Trends in Engineering, Science and Technology";
    const platformName = settings['journalShortName'] || "IJITEST";
    const publisherName = settings['publisherName'] || "Felix Academic Publications";
    const customerId = params.customer_id || "0";
    const institutionName = customerId === "0" ? "The World" : `Subscriber ${customerId}`;

    const { startYear, startMonth, finishYear, finishMonth, beginDateStr, endDateStr } = parseDateRange(params.begin_date, params.end_date);

    const queryConditions = [
        sql`(${usageStats.year} > ${startYear} OR (${usageStats.year} = ${startYear} AND ${usageStats.month} >= ${startMonth}))`,
        sql`(${usageStats.year} < ${finishYear} OR (${usageStats.year} = ${finishYear} AND ${usageStats.month} <= ${finishMonth}))`
    ];

    if (params.item_id) {
        const pubIdNum = parseInt(params.item_id, 10);
        if (!isNaN(pubIdNum)) {
            queryConditions.push(eq(publications.id, pubIdNum));
        }
    }

    const rows = await db.select({
        publicationId: publications.id,
        submissionId: publications.submissionId,
        doi: publications.doi,
        publishedAt: publications.publishedAt,
        year: usageStats.year,
        month: usageStats.month,
        metricType: usageStats.metricType,
        totalCount: sql<number>`SUM(${usageStats.metricCount})`,
    })
        .from(usageStats)
        .innerJoin(publications, eq(usageStats.publicationId, publications.id))
        .innerJoin(submissions, eq(publications.submissionId, submissions.id))
        .where(and(...queryConditions))
        .groupBy(
            publications.id,
            publications.submissionId,
            publications.doi,
            publications.publishedAt,
            usageStats.year,
            usageStats.month,
            usageStats.metricType
        )
        .orderBy(desc(publications.publishedAt), asc(usageStats.year), asc(usageStats.month));

    const submissionIds = Array.from(new Set(rows.map(r => r.submissionId)));

    // Fetch Authors
    const authorMap = new Map<number, { name: string; orcid?: string | undefined }[]>();
    // Fetch Titles from latest version
    const titleMap = new Map<number, string>();

    if (submissionIds.length > 0) {
        const [authorRows, versionRows] = await Promise.all([
            db.select({
                submissionId: submissionAuthors.submissionId,
                name: submissionAuthors.name,
                orcidId: submissionAuthors.orcidId,
            })
                .from(submissionAuthors)
                .where(inArray(submissionAuthors.submissionId, submissionIds))
                .orderBy(asc(submissionAuthors.orderIndex)),

            db.select({
                submissionId: submissionVersions.submissionId,
                title: submissionVersions.title,
                versionNumber: submissionVersions.versionNumber,
            })
                .from(submissionVersions)
                .where(inArray(submissionVersions.submissionId, submissionIds))
                .orderBy(desc(submissionVersions.versionNumber))
        ]);

        for (const a of authorRows) {
            if (!authorMap.has(a.submissionId)) {
                authorMap.set(a.submissionId, []);
            }
            authorMap.get(a.submissionId)!.push({
                name: a.name,
                orcid: a.orcidId || undefined
            });
        }

        for (const v of versionRows) {
            // Because ordered desc by versionNumber, first occurrence is the latest
            if (!titleMap.has(v.submissionId)) {
                titleMap.set(v.submissionId, v.title);
            }
        }
    }

    const itemsMap = new Map<number, {
        title: string;
        doi: string | null;
        publishedAt: Date | null;
        submissionId: number;
        periods: Map<string, CounterPerformanceInstance[]>;
    }>();

    for (const row of rows) {
        const counterMetricName = METRIC_MAP[row.metricType];
        if (!counterMetricName) continue;

        if (reportId === "IR_A1" && !counterMetricName.includes("Requests")) {
            continue;
        }

        if (!itemsMap.has(row.publicationId)) {
            itemsMap.set(row.publicationId, {
                title: titleMap.get(row.submissionId) || `Article ${row.submissionId}`,
                doi: row.doi,
                publishedAt: row.publishedAt,
                submissionId: row.submissionId,
                periods: new Map()
            });
        }

        const pubItem = itemsMap.get(row.publicationId)!;
        const periodKey = `${row.year}-${padMonth(row.month)}`;
        if (!pubItem.periods.has(periodKey)) {
            pubItem.periods.set(periodKey, []);
        }
        pubItem.periods.get(periodKey)!.push({
            Metric_Type: counterMetricName,
            Count: Number(row.totalCount) || 0
        });
    }

    const reportItems: CounterReportItem[] = [];

    for (const [pubId, itemData] of itemsMap.entries()) {
        const authors = authorMap.get(itemData.submissionId) || [];
        const contributors = authors.map(a => ({
            Type: "Author",
            Name: a.name,
            Identifier: a.orcid ? (a.orcid.startsWith("http") ? a.orcid : `https://orcid.org/${a.orcid}`) : undefined
        }));

        const itemIds = [
            { Type: "Proprietary", Value: String(pubId) }
        ];
        if (itemData.doi) {
            itemIds.push({ Type: "DOI", Value: itemData.doi });
        }

        const performance: CounterPerformancePeriod[] = [];
        for (const [periodKey, instances] of itemData.periods.entries()) {
            const [yStr, mStr] = periodKey.split("-");
            const y = Number(yStr) || startYear;
            const m = Number(mStr) || 1;
            const lastDay = getLastDayOfMonth(y, m);
            performance.push({
                Period: {
                    Begin_Date: `${periodKey}-01`,
                    End_Date: `${periodKey}-${lastDay < 10 ? '0' + lastDay : lastDay}`
                },
                Instance: instances
            });
        }

        const pubDateStr = itemData.publishedAt ? new Date(itemData.publishedAt).toISOString().split("T")[0] : undefined;

        reportItems.push({
            Item: itemData.title,
            Platform: platformName,
            Publisher: publisherName,
            Item_ID: itemIds,
            Item_Contributors: contributors.length > 0 ? contributors : undefined,
            Item_Dates: pubDateStr ? [{ Type: "Publication_Date", Value: pubDateStr }] : undefined,
            Item_Attributes: [{ Type: "Article_Version", Value: "VoR" }],
            Data_Type: "Article",
            Section_Type: "Article",
            YOP: pubDateStr ? pubDateStr.split("-")[0] : undefined,
            Performance: performance
        });
    }

    const reportHeader: CounterReportHeader = {
        Created: new Date().toISOString(),
        Created_By: journalName,
        Customer_ID: customerId,
        Report_ID: reportId,
        Release: "5",
        Report_Name: reportId === "IR_A1" ? "Journal Article Requests" : "Item Master Report",
        Institution_Name: institutionName,
        Report_Filters: [
            { Name: "Begin_Date", Value: beginDateStr },
            { Name: "End_Date", Value: endDateStr }
        ]
    };

    return {
        Report_Header: reportHeader,
        Report_Items: reportItems
    };
}

/**
 * Get aggregate lifetime metrics for Admin Settings & Dashboard
 */
export async function getAggregatedCounterMetrics() {
    const counts = await db.select({
        metricType: usageStats.metricType,
        total: sql<number>`SUM(${usageStats.metricCount})`
    })
        .from(usageStats)
        .groupBy(usageStats.metricType);

    const result = {
        totalInvestigations: 0,
        uniqueInvestigations: 0,
        totalRequests: 0,
        uniqueRequests: 0
    };

    for (const c of counts) {
        const val = Number(c.total) || 0;
        if (c.metricType === "total_item_investigations") result.totalInvestigations = val;
        if (c.metricType === "unique_item_investigations") result.uniqueInvestigations = val;
        if (c.metricType === "total_item_requests") result.totalRequests = val;
        if (c.metricType === "unique_item_requests") result.uniqueRequests = val;
    }

    return result;
}
