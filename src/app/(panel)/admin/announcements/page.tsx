import AnnouncementsManager from "./AnnouncementsManager";

export const metadata = {
    title: "Announcements & Notices | Admin Panel | IJITEST",
    description: "Manage journal announcements, calls for papers, news, and storage-service banner assets.",
};

export default function AdminAnnouncementsPage() {
    return (
        <div className="space-y-6">
            <AnnouncementsManager />
        </div>
    );
}
