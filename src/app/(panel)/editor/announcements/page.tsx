import AnnouncementsManager from "@/features/announcements/components/AnnouncementsManager";

export const metadata = {
    title: "Announcements & Notices | Editorial Hub | IJITEST",
    description: "Manage journal announcements, calls for papers, news, and storage-service banner assets.",
};

export default function EditorAnnouncementsPage() {
    return (
        <div className="space-y-6">
            <AnnouncementsManager />
        </div>
    );
}
