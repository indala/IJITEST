import "server-only";

interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

/**
 * Submits a list of URLs to IndexNow for immediate indexing.
 * Uses the dynamic environment variable INDEXNOW_KEY.
 * @param urls Array of absolute page URLs to submit.
 */
export async function submitToIndexNow(urls: string[]): Promise<boolean> {
  const key = process.env['INDEXNOW_KEY'];
  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://www.ijitest.org';

  if (!key) {
    console.warn("IndexNow: INDEXNOW_KEY is not set in environment variables. Skipping submission.");
    return false;
  }

  if (urls.length === 0) {
    console.warn("IndexNow: No URLs provided for submission.");
    return false;
  }

  try {
    // Parse host from NEXT_PUBLIC_APP_URL
    const parsedUrl = new URL(appUrl);
    const host = parsedUrl.host;

    const payload: IndexNowPayload = {
      host,
      key,
      urlList: urls,
    };

    console.info(`IndexNow: Submitting ${urls.length} URLs for host ${host}...`);

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.info('IndexNow: URLs submitted successfully (HTTP 200/202).');
      return true;
    } else {
      const errorText = await response.text();
      console.error(`IndexNow submission failed. Status: ${response.status}. Response: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('IndexNow: Error during URL submission:', error instanceof Error ? error.message : String(error));
    return false;
  }
}
