import ApplicationsRegistry from '@/features/applications/components/ApplicationsRegistry';

export const metadata = {
    title: "Applications | IJITEST",
};

export default function ManageApplicationsPage() {
    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col">
            <ApplicationsRegistry role="admin" />
        </div>
    );
}
