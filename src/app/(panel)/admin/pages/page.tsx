import StaticPagesManager from "./StaticPagesManager";

export const metadata = {
    title: "Custom CMS Pages | Admin Panel | IJITEST",
    description: "Create and customize journal policy, ethics, and scholarly guidelines pages with dynamic metadata placeholders.",
};

export default function AdminStaticPagesPage() {
    return (
        <div className="space-y-6">
            <StaticPagesManager />
        </div>
    );
}
