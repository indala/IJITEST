import { NextRequest, NextResponse } from "next/server";
import { getSettingsData } from "@/actions/settings";
import { getPublishedPapers, getPublishedIssues, getPaperById } from "@/actions/archives";
import {
    type OaiParams,
    type OaiRepositoryConfig,
    renderOaiResponse,
    renderOaiError,
    renderOaiIdentify,
    renderOaiListMetadataFormats,
    renderOaiListSets,
    renderOaiListIdentifiers,
    renderOaiListRecords,
    renderOaiGetRecord,
    oaiIdentifierToPaperId,
} from "@/lib/oai-pmh";

async function handleOaiRequest(request: NextRequest): Promise<NextResponse> {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Handle both GET search params and POST form/json params
    let params: OaiParams = {};
    if (request.method === "POST") {
        try {
            const contentType = request.headers.get("content-type") || "";
            if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
                const formData = await request.formData();
                params = {
                    verb: formData.get("verb") as string | null,
                    identifier: formData.get("identifier") as string | null,
                    metadataPrefix: formData.get("metadataPrefix") as string | null,
                    from: formData.get("from") as string | null,
                    until: formData.get("until") as string | null,
                    set: formData.get("set") as string | null,
                    resumptionToken: formData.get("resumptionToken") as string | null,
                };
            } else if (contentType.includes("application/json")) {
                const json = await request.json();
                params = json;
            }
        } catch {
            // fallback to searchParams
        }
    }

    if (!params.verb) {
        params = {
            verb: searchParams.get("verb"),
            identifier: searchParams.get("identifier"),
            metadataPrefix: searchParams.get("metadataPrefix"),
            from: searchParams.get("from"),
            until: searchParams.get("until"),
            set: searchParams.get("set"),
            resumptionToken: searchParams.get("resumptionToken"),
        };
    }

    const settings = await getSettingsData();
    const journalBaseUrl = (settings['journalWebsite'] || 'https://ijitest.org').replace(/\/$/, '');
    const requestBaseUrl = `${journalBaseUrl}/api/oai`;

    let hostname = 'ijitest.org';
    try {
        hostname = new URL(journalBaseUrl).hostname;
    } catch {}

    const config: OaiRepositoryConfig = {
        repositoryName: settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology',
        baseURL: requestBaseUrl,
        protocolVersion: '2.0',
        adminEmail: settings['contactEmail'] || 'editor@ijitest.org',
        earliestDatestamp: '2024-01-01T00:00:00Z',
        deletedRecord: 'no',
        granularity: 'YYYY-MM-DDThh:mm:ssZ',
        repositoryIdentifier: hostname,
    };

    const verb = params.verb?.trim();

    // 1. Validate Verb
    if (!verb) {
        const errorXml = renderOaiError('badVerb', 'Missing required parameter: verb');
        const xml = renderOaiResponse({ requestUrl: requestBaseUrl, params, contentXml: errorXml });
        return new NextResponse(xml, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
    }

    let contentXml = '';

    switch (verb) {
        // 1. Identify
        case 'Identify': {
            contentXml = renderOaiIdentify(config);
            break;
        }

        // 2. ListMetadataFormats
        case 'ListMetadataFormats': {
            if (params.identifier) {
                const paperId = oaiIdentifierToPaperId(config.repositoryIdentifier, params.identifier);
                if (!paperId) {
                    contentXml = renderOaiError('idDoesNotExist', `Identifier not found: ${params.identifier}`);
                    break;
                }
                const paperRes = await getPaperById(paperId);
                if (!paperRes.success || !paperRes.data) {
                    contentXml = renderOaiError('idDoesNotExist', `Identifier not found: ${params.identifier}`);
                    break;
                }
            }
            contentXml = renderOaiListMetadataFormats();
            break;
        }

        // 3. ListSets
        case 'ListSets': {
            const issuesRes = await getPublishedIssues();
            const issues = issuesRes.success ? (issuesRes.data || []) : [];
            contentXml = renderOaiListSets(issues);
            break;
        }

        // 4. ListIdentifiers
        case 'ListIdentifiers': {
            if (!params.metadataPrefix && !params.resumptionToken) {
                contentXml = renderOaiError('badArgument', 'Missing required argument: metadataPrefix');
                break;
            }
            if (params.metadataPrefix && params.metadataPrefix !== 'oai_dc') {
                contentXml = renderOaiError('cannotDisseminateFormat', `Unsupported metadataPrefix: ${params.metadataPrefix}`);
                break;
            }

            const papersRes = await getPublishedPapers();
            let papers = papersRes.success ? (papersRes.data || []) : [];

            // Apply set filter if provided (e.g. vol_1:iss_1)
            if (params.set) {
                const parts = params.set.split(':');
                const volMatch = parts[0]?.match(/vol_(\d+)/);
                const issMatch = parts[1]?.match(/iss_(\d+)/);

                if (volMatch && volMatch[1]) {
                    const v = Number(volMatch[1]);
                    papers = papers.filter(p => p.volumeNumber === v);
                }
                if (issMatch && issMatch[1]) {
                    const i = Number(issMatch[1]);
                    papers = papers.filter(p => p.issueNumber === i);
                }
            }

            // Apply from date filter
            if (params.from) {
                const fromDate = new Date(params.from).getTime();
                if (!isNaN(fromDate)) {
                    papers = papers.filter(p => {
                        const d = new Date(p.updatedAt || p.publishedAt || 0).getTime();
                        return d >= fromDate;
                    });
                }
            }

            // Apply until date filter
            if (params.until) {
                const untilDate = new Date(params.until).getTime();
                if (!isNaN(untilDate)) {
                    papers = papers.filter(p => {
                        const d = new Date(p.updatedAt || p.publishedAt || 0).getTime();
                        return d <= untilDate;
                    });
                }
            }

            if (papers.length === 0) {
                contentXml = renderOaiError('noRecordsMatch', 'No matching records found for the requested criteria');
                break;
            }

            contentXml = renderOaiListIdentifiers(papers, config);
            break;
        }

        // 5. ListRecords
        case 'ListRecords': {
            if (!params.metadataPrefix && !params.resumptionToken) {
                contentXml = renderOaiError('badArgument', 'Missing required argument: metadataPrefix');
                break;
            }
            if (params.metadataPrefix && params.metadataPrefix !== 'oai_dc') {
                contentXml = renderOaiError('cannotDisseminateFormat', `Unsupported metadataPrefix: ${params.metadataPrefix}`);
                break;
            }

            const papersRes = await getPublishedPapers();
            let papers = papersRes.success ? (papersRes.data || []) : [];

            // Apply set filter
            if (params.set) {
                const parts = params.set.split(':');
                const volMatch = parts[0]?.match(/vol_(\d+)/);
                const issMatch = parts[1]?.match(/iss_(\d+)/);

                if (volMatch && volMatch[1]) {
                    const v = Number(volMatch[1]);
                    papers = papers.filter(p => p.volumeNumber === v);
                }
                if (issMatch && issMatch[1]) {
                    const i = Number(issMatch[1]);
                    papers = papers.filter(p => p.issueNumber === i);
                }
            }

            // Apply from date filter
            if (params.from) {
                const fromDate = new Date(params.from).getTime();
                if (!isNaN(fromDate)) {
                    papers = papers.filter(p => {
                        const d = new Date(p.updatedAt || p.publishedAt || 0).getTime();
                        return d >= fromDate;
                    });
                }
            }

            // Apply until date filter
            if (params.until) {
                const untilDate = new Date(params.until).getTime();
                if (!isNaN(untilDate)) {
                    papers = papers.filter(p => {
                        const d = new Date(p.updatedAt || p.publishedAt || 0).getTime();
                        return d <= untilDate;
                    });
                }
            }

            if (papers.length === 0) {
                contentXml = renderOaiError('noRecordsMatch', 'No matching records found for the requested criteria');
                break;
            }

            contentXml = renderOaiListRecords(papers, settings, config);
            break;
        }

        // 6. GetRecord
        case 'GetRecord': {
            if (!params.identifier) {
                contentXml = renderOaiError('badArgument', 'Missing required argument: identifier');
                break;
            }
            if (!params.metadataPrefix) {
                contentXml = renderOaiError('badArgument', 'Missing required argument: metadataPrefix');
                break;
            }
            if (params.metadataPrefix !== 'oai_dc') {
                contentXml = renderOaiError('cannotDisseminateFormat', `Unsupported metadataPrefix: ${params.metadataPrefix}`);
                break;
            }

            const paperId = oaiIdentifierToPaperId(config.repositoryIdentifier, params.identifier);
            if (!paperId) {
                contentXml = renderOaiError('idDoesNotExist', `Invalid identifier format: ${params.identifier}`);
                break;
            }

            const paperRes = await getPaperById(paperId);
            if (!paperRes.success || !paperRes.data) {
                contentXml = renderOaiError('idDoesNotExist', `No record found for identifier: ${params.identifier}`);
                break;
            }

            contentXml = renderOaiGetRecord(paperRes.data, settings, config);
            break;
        }

        default: {
            contentXml = renderOaiError('badVerb', `Illegal OAI verb: '${verb}'`);
            break;
        }
    }

    const xml = renderOaiResponse({
        requestUrl: requestBaseUrl,
        params,
        contentXml,
    });

    return new NextResponse(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=600',
        },
    });
}

export async function GET(request: NextRequest) {
    return handleOaiRequest(request);
}

export async function POST(request: NextRequest) {
    return handleOaiRequest(request);
}
