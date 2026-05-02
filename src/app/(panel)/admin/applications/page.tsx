import ApplicationsRegistry from '@/features/applications/components/ApplicationsRegistry';

export const dynamic = "force-dynamic";

export default function ManageApplicationsPage() {
    return (
        <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden">
            <ApplicationsRegistry role="admin" />
        </div>
    );
}
