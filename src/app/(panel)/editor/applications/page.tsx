import ApplicationsRegistry from '@/features/applications/components/ApplicationsRegistry';

export const metadata = {
    title: "Applications | IJITEST",
};

export const dynamic = "force-dynamic";

export default function ManageApplicationsPage() {
    return <ApplicationsRegistry role="editor" />;
}
