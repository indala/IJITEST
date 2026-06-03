import ApplicationsRegistry from '@/features/applications/components/ApplicationsRegistry';

export const metadata = {
    title: "Applications | IJITEST",
};

export default function ManageApplicationsPage() {
    return <ApplicationsRegistry role="editor" />;
}
