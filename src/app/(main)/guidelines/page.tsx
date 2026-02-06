import { getSettings } from "@/actions/settings";
import GuidelinesContent from "./GuidelinesContent";

export default async function AuthorGuidelines() {
    const settings = await getSettings();

    return <GuidelinesContent settings={settings} />;
}
