/**
 * Project COUNTER-compliant Bot & Crawler Filter (Release 5 Standard)
 * Filters automated web robots, crawlers, scrapers, and headless HTTP libraries
 * to ensure article view and download statistics reflect genuine scholarly readership.
 */

const BOT_PATTERNS: RegExp[] = [
    // Major Search Engine Indexers
    /googlebot/i,
    /bingbot/i,
    /msnbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /sogou/i,
    /exabot/i,
    /applebot/i,
    /petalbot/i,
    /seznam/i,
    /coccoc/i,

    // Academic Harvesters, Indexers & DOI Crawlers
    /crossref/i,
    /oai/i,
    /mendeley/i,
    /zotero/i,
    /turnitin/i,
    /ithenticate/i,
    /scopus/i,
    /scirate/i,
    /semanticscholar/i,
    /paperpile/i,
    /readcube/i,
    /researchgate/i,

    // Social & Messaging Link Preview Fetchers
    /facebookexternalhit/i,
    /facebot/i,
    /twitterbot/i,
    /telegrambot/i,
    /whatsapp/i,
    /linkedinbot/i,
    /slackbot/i,
    /discordbot/i,
    /pinterest/i,

    // Headless Browsers, Scripting Clients, Scrapers & CLI Tools
    /curl/i,
    /wget/i,
    /python-requests/i,
    /urllib/i,
    /aiohttp/i,
    /httpx/i,
    /scrapy/i,
    /apache-httpclient/i,
    /postman/i,
    /insomnia/i,
    /headless/i,
    /puppeteer/i,
    /playwright/i,
    /selenium/i,
    /phantomjs/i,
    /lighthouse/i,
    /pagespeed/i,
    /bot/i,
    /crawl/i,
    /spider/i,
    /scraper/i,
    /archive\.org/i,
    /ia_archiver/i,
];

/**
 * Checks if a given User-Agent string corresponds to an automated robot or crawler.
 */
export function isBot(userAgent?: string | null): boolean {
    if (!userAgent || typeof userAgent !== 'string' || userAgent.trim().length === 0) {
        // Missing user agents in HTTP requests are classified as non-human per COUNTER
        return true;
    }

    const cleanUa = userAgent.trim();
    return BOT_PATTERNS.some(pattern => pattern.test(cleanUa));
}
