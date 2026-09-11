import "server-only";

export interface CrossrefConfig {
    username: string;
    password?: string;
    prefix: string;
    depositorName: string;
    depositorEmail: string;
    depositUrl: string;
    isTestMode: boolean;
}

export function getCrossrefConfig(): CrossrefConfig {
    const username = process.env['CROSSREF_USERNAME'] || "";
    const password = process.env['CROSSREF_PASSWORD'] || "";
    const prefix = process.env['CROSSREF_PREFIX'] || "10.68139";
    const depositorName = process.env['CROSSREF_DEPOSITOR_NAME'] || process.env['CROSSREF_MEMBER_NAME'] || "IJITEST Editorial Office";
    const depositorEmail = process.env['CROSSREF_DEPOSITOR_EMAIL'] || "editor@ijitest.org";
    const isTestMode = process.env['CROSSREF_TEST_MODE'] === "true";
    
    // CrossRef official deposit servlet endpoint
    const depositUrl = process.env['CROSSREF_DEPOSIT_URL'] || (
        isTestMode 
            ? "https://test.crossref.org/servlet/deposit" 
            : "https://doi.crossref.org/servlet/deposit"
    );

    return {
        username,
        password,
        prefix,
        depositorName,
        depositorEmail,
        depositUrl,
        isTestMode
    };
}

export interface ZenodoConfig {
    accessToken: string;
    apiUrl: string;
    useSandbox: boolean;
}

export function getZenodoConfig(): ZenodoConfig {
    const accessToken = process.env['ZENODO_ACCESS_TOKEN'] || "";
    const useSandbox = process.env['ZENODO_USE_SANDBOX'] !== "false";
    const apiUrl = process.env['ZENODO_API_URL'] || (
        useSandbox
            ? "https://sandbox.zenodo.org/api"
            : "https://zenodo.org/api"
    );

    return {
        accessToken,
        apiUrl,
        useSandbox
    };
}
